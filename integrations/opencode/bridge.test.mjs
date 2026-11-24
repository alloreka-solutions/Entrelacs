import test from 'node:test';
import assert from 'node:assert/strict';
import { BRIDGE_CONTRACT, proposeCandidate, prepareReview, executeApprovedReview } from './bridge.mjs';

const candidate = () => proposeCandidate({
  id: 'agent-test', label: 'Relecteur fictif', provider: 'simulé',
  role: 'relecteur', mode: 'sdk', declaredCapabilities: ['analyse statique'],
  provenance: 'fixture locale',
});
const mission = () => prepareReview({
  id: 'E-OC-01', candidate: candidate(), objective: 'Relire un document sans modification',
  publicContext: 'Projet public, données fictives', directory: '/workspace/existant',
});

test('candidat déclaré n’est jamais recruté automatiquement', () => {
  const c = candidate();
  assert.equal(c.status, 'candidat');
  assert.equal(c.verified, false);
  assert.equal(c.model, 'non vérifié');
});
test('rôle et mode invalides sont refusés', () => {
  assert.throws(() => proposeCandidate({ id:'x', label:'X', provider:'P', role:'administrateur', mode:'sdk' }));
});
test('mode manuel prépare une invitation sans répertoire ni exécution', () => {
  const c = proposeCandidate({ id:'dora', label:'Dora', provider:'IONOS GPT', role:'relecteur', mode:'manuel' });
  const m = prepareReview({ id:'E-OC-M', candidate:c, objective:'Relire le contenu public', publicContext:'Page de démonstration' });
  assert.equal(m.mode, 'manuel');
  assert.equal(m.directory, null);
  assert.match(m.prompt, /Le pilote humain décide/);
});
test('préparation ne lance pas OpenCode', () => {
  const m = mission();
  assert.equal(m.status, 'préparée');
  assert.equal(m.contract, BRIDGE_CONTRACT);
  assert.match(m.prompt, /trois constats/);
});
test('une mission non approuvée refuse tout appel', async () => {
  let invoked = 0;
  await assert.rejects(() => executeApprovedReview({ mission:mission(), approval:{ missionId:'E-OC-01', allowModelCall:false }, hostFactory:async()=>{invoked++;return {};} }),/non autorisé/);
  assert.equal(invoked,0);
});
test('autorisation pour une autre mission est refusée', async () => {
  await assert.rejects(() => executeApprovedReview({ mission:mission(), approval:{ missionId:'autre', allowModelCall:true }, hostFactory:async()=>{throw new Error('invoquée');} }),/non autorisé/);
});
test('adaptateur SDK simulé transmet une mission bornée et ferme le host', async () => {
  const events=[];
  const stub=()=>({sessions:{
    create: async x=>{events.push(['create',x]);return {id:'session-fictive'};},
    prompt: async x=>{events.push(['prompt',x]);return {text:'Constat simulé, non vérifié'};},
  },close:async()=>events.push(['close'])});
  const result=await executeApprovedReview({mission:mission(),approval:{missionId:'E-OC-01',allowModelCall:true},hostFactory:stub});
  assert.equal(result.status,'proposition_à_revoir');
  assert.equal(result.approvedByHuman,false);
  assert.equal(result.merged,false);
  assert.equal(result.published,false);
  assert.deepEqual(events.map(e=>e[0]),['create','prompt','close']);
  assert.equal(events[0][1].location.directory,'/workspace/existant');
  assert.equal(events[1][1].sessionID,'session-fictive');
});
test('échec du prompt libère le host et ne valide rien', async () => {
  const events=[];
  const stub=()=>({sessions:{create:async()=>({id:'fictive'}),prompt:async()=>{events.push('prompt');throw new Error('échec simulé');}},close:async()=>events.push('close')});
  await assert.rejects(()=>executeApprovedReview({mission:mission(),approval:{missionId:'E-OC-01',allowModelCall:true},hostFactory:stub}),/échec simulé/);
  assert.deepEqual(events,['prompt','close']);
});
test('mission manuelle refusée par le chemin SDK', async () => {
  const c=proposeCandidate({id:'dora',label:'Dora',provider:'IONOS GPT',role:'relecteur',mode:'manuel'});
  const m=prepareReview({id:'DORA-01',candidate:c,objective:'Relire',publicContext:'Texte public'});
  await assert.rejects(()=>executeApprovedReview({mission:m,approval:{missionId:m.id,allowModelCall:true},hostFactory:async()=>({})}),/mission SDK/);
});

// E-OC-01 — second lot: deterministic role coordination, no model or network.
import {
  ROLES_DISPONIBLES, prepareReviewPanel, recordContribution,
  prepareCrossReviews, recordCrossReview, prepareDecisionDossier,
  proposedReadOnlyPermissionRules, simulatePermission,
} from './bridge.mjs';

const panelFixture = () => {
  const candidates = [
    proposeCandidate({ id:'author', label:'Auteur fictif', provider:'fixture', role:'developpeur', mode:'sdk', provenance:'test' }),
    proposeCandidate({ id:'reviewer', label:'Relecteur fictif', provider:'fixture', role:'relecteur', mode:'manuel', provenance:'test' }),
    proposeCandidate({ id:'dissent', label:'Contradicteur fictif', provider:'fixture', role:'contradicteur', mode:'manuel', provenance:'test' }),
  ];
  const panel = prepareReviewPanel({
    id:'E-OC-01-PANEL', objective:'Analyser une fonction fictive',
    publicContext:'Extrait public, sans données privées', directory:'/workspace/existant',
    candidates, assignments:[
      {slotId:'a',candidateId:'author'}, {slotId:'r',candidateId:'reviewer'},
      {slotId:'d',candidateId:'dissent'},
    ],
  });
  return {panel,candidates};
};
const contributionFixture = (panel, n, text) => recordContribution({
  panel, missionId:panel.missions[n].id, candidateId:panel.missions[n].candidateId,
  content:text, sources:['code public'], limitations:['revue statique'],
});

test('rôles du protocole disponibles sans recrutement automatique', () => {
  assert.deepEqual(ROLES_DISPONIBLES, ['explorateur','architecte','developpeur','testeur','relecteur','contradicteur','documentaliste','synthetiseur']);
  const c=proposeCandidate({id:'p',label:'P',provider:'fixture',role:'synthetiseur',mode:'manuel'});
  assert.equal(c.status,'candidat');
  assert.equal(c.verified,false);
});

test('affectation explicite de trois rôles et prompts indépendants sans host', () => {
  const {panel}=panelFixture();
  assert.equal(panel.status,'préparée');
  assert.equal(panel.independent,true);
  assert.equal(panel.missions.length,3);
  assert.equal(panel.approvedByHuman,false);
  assert.deepEqual(panel.missions.map(m=>m.role),['developpeur','relecteur','contradicteur']);
  assert.ok(panel.missions.every(m=>!m.prompt.includes('Réponse de') && m.status==='préparée'));
  assert.equal(panel.missions.filter(m=>m.mode==='sdk').length,1);
});

test('candidats, affectations et créneaux dupliqués refusés', () => {
  const {candidates}=panelFixture();
  const args={id:'P',objective:'Relire',publicContext:'Public',directory:'/workspace/existant',candidates};
  assert.throws(()=>prepareReviewPanel({...args,assignments:[{slotId:'same',candidateId:'author'},{slotId:'same',candidateId:'reviewer'}]}),/dupliquée/);
  assert.throws(()=>prepareReviewPanel({...args,assignments:[{slotId:'a',candidateId:'author'},{slotId:'b',candidateId:'author'}]}),/dupliquée/);
  assert.throws(()=>prepareReviewPanel({...args,assignments:[{slotId:'a',candidateId:'author'},{slotId:'b',candidateId:'unknown'}]}),/inconnue/);
  assert.throws(()=>prepareReviewPanel({...args,candidates:[candidates[0],candidates[0]],assignments:[{slotId:'a',candidateId:'author'},{slotId:'b',candidateId:'reviewer'}]}),/dupliqué/);
});

test('l’affectation SDK réclame un répertoire, pas les candidats manuels', () => {
  const {candidates}=panelFixture();
  assert.throws(()=>prepareReviewPanel({id:'X',objective:'Relire',publicContext:'Public',candidates,assignments:[{slotId:'a',candidateId:'author'},{slotId:'b',candidateId:'reviewer'}]}),/répertoire/);
  const p=prepareReviewPanel({id:'Y',objective:'Relire',publicContext:'Public',candidates,assignments:[{slotId:'a',candidateId:'reviewer'},{slotId:'b',candidateId:'dissent'}]});
  assert.ok(p.missions.every(m=>m.directory===null));
});

test('contributions attribuées, indépendantes, non approuvées et non mutées', () => {
  const {panel}=panelFixture();
  const a=contributionFixture(panel,0,'Proposition A');
  const b=contributionFixture(panel,1,'Proposition B');
  assert.notEqual(a.id,b.id);
  assert.equal(a.role,'developpeur');
  assert.equal(a.verified,false);
  assert.equal(b.approvedByHuman,false);
  assert.equal(a.sources[0],'code public');
  assert.equal(panel.missions[0].prompt.includes(b.content),false);
  assert.ok(Object.isFrozen(a));
});

test('refus d’une contribution attribuée à un autre candidat', () => {
  const {panel}=panelFixture();
  assert.throws(()=>recordContribution({panel,missionId:panel.missions[0].id,candidateId:'dissent',content:'usurpé'}),/non attribuée/);
  assert.throws(()=>recordContribution({panel,missionId:panel.missions[0].id,candidateId:'author',content:'  '}),/invalide/);
});

test('revue croisée uniquement après réception de tous les avis initiaux', () => {
  const {panel}=panelFixture();
  const all=[contributionFixture(panel,0,'A'),contributionFixture(panel,1,'B'),contributionFixture(panel,2,'C')];
  assert.throws(()=>prepareCrossReviews({panel,contributions:all.slice(0,2)}),/Toutes les contributions/);
  const tasks=prepareCrossReviews({panel,contributions:all});
  assert.equal(tasks.length,4);
  assert.ok(tasks.every(t=>t.reviewerId!==t.sourceCandidateId));
  assert.ok(tasks.every(t=>t.prompt.includes('Contribution initiale')));
  assert.equal(all[0].content,'A');
});

test('revue croisée refuse les contributions doublonnées ou d’un autre panel', () => {
  const {panel}=panelFixture();
  const a=contributionFixture(panel,0,'A'),b=contributionFixture(panel,1,'B');
  assert.throws(()=>prepareCrossReviews({panel,contributions:[a,a,b]}),/dupliquée/);
  assert.throws(()=>prepareCrossReviews({panel,contributions:[a,b,{...a,missionId:panel.missions[2].id,panelId:'autre'}]}),/étrangère/);
});

test('avis de relecture : désaccord explicite, preuve et source intacte', () => {
  const {panel}=panelFixture();
  const contributions=panel.missions.map((_,i)=>contributionFixture(panel,i,`Proposition ${i}`));
  const task=prepareCrossReviews({panel,contributions})[0];
  const review=recordCrossReview({task,reviewerId:task.reviewerId,content:'Omission factuelle',verdict:'désaccord',evidence:['preuve fictive'],limitations:['non exécuté']});
  assert.equal(review.verdict,'désaccord');
  assert.equal(review.sourceContributionId,task.sourceContributionId);
  assert.equal(review.approvedByHuman,false);
  assert.equal(contributions[0].content,'Proposition 0');
  assert.throws(()=>recordCrossReview({task,reviewerId:task.sourceCandidateId,content:'auto revue',verdict:'appui'}),/non attribuée/);
  assert.throws(()=>recordCrossReview({task,reviewerId:task.reviewerId,content:'X',verdict:'certifié'}),/invalide/);
});

test('synthèse mécanique préserve les contributions et divergences sans décider', () => {
  const {panel}=panelFixture(),contributions=panel.missions.map((_,i)=>contributionFixture(panel,i,`Version ${i}`));
  const tasks=prepareCrossReviews({panel,contributions});
  const reviews=[recordCrossReview({task:tasks[0],reviewerId:tasks[0].reviewerId,content:'Omission',verdict:'désaccord'}),recordCrossReview({task:tasks[1],reviewerId:tasks[1].reviewerId,content:'Point recevable',verdict:'appui'})];
  const dossier=prepareDecisionDossier({panel,contributions,reviews});
  assert.equal(dossier.disagreements.length,1);
  assert.equal(dossier.reviews.length,2);
  assert.equal(dossier.contributions.length,3);
  assert.equal(dossier.humanDecision,null);
  assert.equal(dossier.published,false);
  assert.equal(dossier.merged,false);
});

test('dossier n’accepte pas avis orphelins ni doublons', () => {
  const {panel}=panelFixture(),contributions=panel.missions.map((_,i)=>contributionFixture(panel,i,`Version ${i}`));
  assert.throws(()=>prepareDecisionDossier({panel,contributions:contributions.slice(0,2),reviews:[]}),/incomplet/);
  assert.throws(()=>prepareDecisionDossier({panel,contributions,reviews:[{id:'r',panelId:panel.id,sourceContributionId:'inconnue'}]}),/incohérentes/);
});

test('politique simulée : lecture du code permise et fichiers .env refusés', () => {
  const rules=proposedReadOnlyPermissionRules();
  assert.equal(simulatePermission(rules,'read','src/index.mjs'),'allow');
  assert.equal(simulatePermission(rules,'glob','src/**/*.mjs'),'allow');
  assert.equal(simulatePermission(rules,'grep','FIXME'),'allow');
  assert.equal(simulatePermission(rules,'read','project/.env'),'deny');
  assert.equal(simulatePermission(rules,'read','.env.local'),'deny');
});

test('politique simulée : shell, édition, réseau, sous-agents et outils inconnus refusés', () => {
  const rules=proposedReadOnlyPermissionRules();
  for(const [act,res] of [['shell','git push origin main'],['edit','README.md'],['external_directory','/etc/*'],['webfetch','https://example.org'],['websearch','test'],['subagent','build'],['execute','*'],['plugin_write','*'],['git_push','*']]) {
    assert.equal(simulatePermission(rules,act,res),'deny',`${act} ${res}`);
  }
});

test('politique simulée : dernière règle applicable prioritaire', () => {
  const rules=[{action:'*',resource:'*',effect:'deny'},{action:'read',resource:'*',effect:'allow'},{action:'read',resource:'*.env*',effect:'deny'}];
  assert.equal(simulatePermission(rules,'read','data/file.md'),'allow');
  assert.equal(simulatePermission(rules,'read','secrets/.env.production'),'deny');
  assert.equal(simulatePermission([], 'read','data/file.md'),'ask');
});

test('dossier rejette une contribution forgée pour le mauvais auteur', () => {
  const {panel}=panelFixture(),cs=panel.missions.map((_,i)=>contributionFixture(panel,i,`P${i}`));
  const fake=[{...cs[0],candidateId:'inconnu'},cs[1],cs[2]];
  assert.throws(()=>prepareDecisionDossier({panel,contributions:fake,reviews:[]}),/incohérentes/);
});

test('dossier refuse une revue faite par son auteur ou un rôle non relecteur', () => {
  const {panel}=panelFixture(),cs=panel.missions.map((_,i)=>contributionFixture(panel,i,`P${i}`));
  const forged={id:'avis-invalide',panelId:panel.id,sourceContributionId:cs[0].id,reviewerId:'author',status:'avis_proposé'};
  assert.throws(()=>prepareDecisionDossier({panel,contributions:cs,reviews:[forged]}),/incohérentes/);
});
