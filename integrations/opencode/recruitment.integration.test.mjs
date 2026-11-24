/** E-OC-02 -> exact E-OC-01 GitHub blob. Fictitious data; no OpenCode host. */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as bridge from './bridge.mjs';
import {
  createCandidateRegistry, registerCandidate, proposePanelSelection,
  prepareCooperation, collectIndependentContributions, collectReviewsAndDossier,
} from './recruitment.mjs';

const panelId = 'E-OC-02-fixture';
function fixtures({ two = false } = {}) {
  let registry = createCandidateRegistry();
  const pool = [
    {id:'dev',role:'developpeur',mode:'sdk',cap:'code'},
    {id:'dora',role:'relecteur',mode:'manuel',cap:'relecture'},
    {id:'crit',role:'contradicteur',mode:'manuel',cap:'critique'},
  ];
  for (const p of (two ? pool.slice(0,2) : pool)) {
    registry = registerCandidate(registry, {
      id:p.id,label:p.id,provider:'fournisseur fictif',
      mode:p.mode,roles:[p.role],declaredCapabilities:[p.cap],
      provenance:'fixture locale',limitations:['aucune exécution réelle'],
    });
  }
  const slots = (two ? pool.slice(0,2) : pool).map(p=>({
    id:p.role,role:p.role,requiredCapabilities:[p.cap],allowedModes:[p.mode],
  }));
  const selection=proposePanelSelection({registry,id:panelId,slots});
  return {registry,selection};
}
function cooperation({two=false,directory='/workspace/repertoire-fictif'}={}) {
  const {registry,selection}=fixtures({two});
  const prepared=prepareCooperation({
    registry,selection,id:panelId,objective:'Comparer des textes imaginaires',
    publicContext:'Document public entièrement fictif',directory,bridge,
  });
  return prepared;
}
function contributions(prepared) {
  return collectIndependentContributions({cooperation:prepared,bridge,
    submissions:prepared.panel.missions.map(m=>({
      slotId:m.slotId,candidateId:m.candidateId,
      content:`Contribution fictive de ${m.candidateId}`,
      sources:[`fixture:${m.candidateId}`],limitations:['non testée en production'],
    }))});
}
function finalise(collected) {
  return collectReviewsAndDossier({collection:collected,bridge,
    submissions:collected.reviewTasks.map((t,i)=>({
      taskId:t.id,reviewerId:t.reviewerId,content:`Avis fictif ${i}`,
      verdict:i===0?'désaccord':'appui',evidence:['preuve fictive'],
      limitations:['simulation uniquement'],
    }))});
}
test('contrat E-OC-01 réellement intégré : rôles et fonctions attendues',()=>{
  assert.equal(bridge.BRIDGE_CONTRACT,'entrelacs-opencode-review-v0.1');
  for(const name of ['proposeCandidate','prepareReviewPanel','recordContribution',
    'prepareCrossReviews','recordCrossReview','prepareDecisionDossier']){
    assert.equal(typeof bridge[name],'function');
  }
});
test('trois rôles et missions préparés sans créer de host SDK',()=>{
  const prepared=cooperation();
  assert.equal(prepared.panel.contract,bridge.BRIDGE_CONTRACT);
  assert.equal(prepared.panel.missions.length,3);
  assert.equal(prepared.panel.missions.find(x=>x.candidateId==='dora').directory,null);
  assert.match(prepared.panel.missions[0].prompt,/Le pilote humain décide/);
  assert.equal(prepared.activated,false);
  assert.equal(prepared.approvedByHuman,false);
});
test('contributions indépendantes puis quatre revues et désaccord intact',()=>{
  const collected=contributions(cooperation());
  assert.equal(collected.contributions.length,3);
  assert.equal(collected.reviewTasks.length,4);
  assert.ok(collected.reviewTasks.every(t=>t.sourceCandidateId!==t.reviewerId));
  assert.ok(collected.contributions.every(c=>c.provenance==='fixture locale'&&c.verified===false));
  const old=collected.contributions.map(c=>c.content);
  const decision=finalise(collected);
  assert.equal(decision.status,'dossier_à_arbitrer');
  assert.equal(decision.disagreements.length,1);
  assert.deepEqual(decision.contributions.map(c=>c.content),old);
  assert.equal(decision.dossier.humanDecision,null);
  assert.equal(decision.approvedByHuman,false);
  assert.equal(decision.recruited,false);
  assert.equal(decision.activated,false);
  assert.equal(decision.published,false);
});
test('panel de deux candidats : un relecteur externe et arbitrage non pris',()=>{
  const collected=contributions(cooperation({two:true}));
  assert.equal(collected.reviewTasks.length,1);
  assert.equal(collected.reviewTasks[0].reviewerId,'dora');
  assert.equal(collected.reviewTasks[0].sourceCandidateId,'dev');
  const result=finalise(collected);
  assert.equal(result.dossier.humanDecision,null);
});
test('aucune collecte partielle ni avis d’un autre relecteur',()=>{
  const prepared=cooperation();
  assert.throws(()=>collectIndependentContributions({cooperation:prepared,bridge,submissions:[]}),/Toutes/);
  const collected=contributions(prepared);
  const others=collected.reviewTasks.map(t=>({taskId:t.id,reviewerId:'dev',content:'Avis inventé',verdict:'appui'}));
  assert.throws(()=>collectReviewsAndDossier({collection:collected,bridge,submissions:others}),/étranger/);
});
test('répertoire SDK obligatoire via le module E-OC-01 réel',()=>{
  const {registry,selection}=fixtures();
  assert.throws(()=>prepareCooperation({registry,selection,id:panelId,
    objective:'Analyse fictive',publicContext:'Donnée publique fictive',bridge}),/répertoire/);
});
test('l’identifiant de la sélection doit rester celui de la mission préparée',()=>{
  const {registry,selection}=fixtures();
  assert.throws(()=>prepareCooperation({registry,selection,id:'MISSION-DIFFÉRENTE',
    objective:'Mission fictive',publicContext:'Page fictive',directory:'/workspace/fictif',bridge}),
    /identifiant|sélection|mission/i);
});
test('aucun import SDK exécuté ni effet réseau dans le scénario fictif',()=>{
  const result=finalise(contributions(cooperation()));
  assert.equal(result.merged,false);
  assert.equal(result.published,false);
  assert.equal(typeof bridge.createOpenCodeHost,'function');
});
