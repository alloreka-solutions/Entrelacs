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
