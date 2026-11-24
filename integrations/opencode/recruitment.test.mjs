import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RECRUITMENT_CONTRACT, RECRUITMENT_ROLES, createCandidateRegistry,
  registerCandidate, recordSimulatedEvaluation, evaluateCandidates,
  proposePanelSelection, prepareCooperation, collectIndependentContributions,
  collectReviewsAndDossier,
} from './recruitment.mjs';

// A strict E-OC-01 double with the same public function names and data contracts.
// It NEVER imports the SDK nor reaches a provider. The established 25 E-OC-01 tests
// remain separate historical evidence, not counted as re-executed here.
function fakeBridge() {
  const calls = [];
  const api = {
    calls,
    proposeCandidate(input) {
      calls.push('proposeCandidate');
      if (!input.id || !input.role || !['manuel', 'sdk'].includes(input.mode)) throw Error('Candidat invalide');
      return Object.freeze({ ...input, status: 'candidat', verified: false });
    },
    prepareReviewPanel({ id, candidates, assignments, directory }) {
      calls.push('prepareReviewPanel');
      if (assignments.length < 2) throw Error('Panel insuffisant');
      const catalogue = new Map(candidates.map((c) => [c.id, c]));
      const missions = assignments.map(({ slotId, candidateId }) => {
        const candidate = catalogue.get(candidateId);
        if (!candidate) throw Error('Affectation inconnue');
        if (candidate.mode === 'sdk' && !directory) throw Error('Un répertoire de projet explicite est nécessaire pour le SDK.');
        return Object.freeze({ id: `${id}:${slotId}`, slotId, candidateId, role: candidate.role,
          mode: candidate.mode, status: 'préparée', directory: candidate.mode === 'sdk' ? directory : null });
      });
      return Object.freeze({ id, contract: 'entrelacs-opencode-review-v0.1', status: 'préparée',
        missions: Object.freeze(missions), members: Object.freeze(candidates.map((c) => ({
          candidateId: c.id, role: c.role, mode: c.mode, provenance: c.provenance,
        }))), approvedByHuman: false });
    },
    recordContribution({ panel, missionId, candidateId, content, sources, limitations }) {
      calls.push('recordContribution');
      const mission = panel.missions.find((m) => m.id === missionId && m.candidateId === candidateId);
      if (!mission) throw Error('Contribution non attribuée');
      return Object.freeze({ id: `contribution:${missionId}`, panelId: panel.id, missionId, candidateId,
        role: mission.role, content, sources: Object.freeze([...sources]),
        limitations: Object.freeze([...limitations]), status: 'proposition_à_revoir', approvedByHuman: false });
    },
    prepareCrossReviews({ panel, contributions }) {
      calls.push('prepareCrossReviews');
      if (contributions.length !== panel.missions.length) throw Error('Contributions incomplètes');
      const tasks = [];
      for (const source of contributions) {
        for (const reviewer of panel.members.filter((x) => ['relecteur', 'contradicteur'].includes(x.role))) {
          if (source.candidateId === reviewer.candidateId) continue;
          tasks.push(Object.freeze({ id: `review:${source.missionId}:${reviewer.candidateId}`,
            panelId: panel.id, sourceContributionId: source.id,
            sourceCandidateId: source.candidateId, reviewerId: reviewer.candidateId,
            reviewerRole: reviewer.role, status: 'préparée' }));
        }
      }
      return Object.freeze(tasks);
    },
    recordCrossReview({ task, reviewerId, content, verdict, evidence, limitations }) {
      calls.push('recordCrossReview');
      if (task.reviewerId !== reviewerId || task.sourceCandidateId === reviewerId ||
          !['appui', 'désaccord', 'incertitude', 'amélioration'].includes(verdict)) throw Error('Avis invalide');
      return Object.freeze({ id: `avis:${task.id}`, panelId: task.panelId,
        sourceContributionId: task.sourceContributionId, reviewerId,
        verdict, content, evidence: Object.freeze([...evidence]),
        limitations: Object.freeze([...limitations]), status: 'avis_proposé', approvedByHuman: false });
    },
    prepareDecisionDossier({ panel, contributions, reviews }) {
      calls.push('prepareDecisionDossier');
      const ids = new Set(contributions.map((c) => c.id));
      if (ids.size !== contributions.length || reviews.some((r) => !ids.has(r.sourceContributionId))) throw Error('Références invalides');
      return Object.freeze({ panelId: panel.id, status: 'proposition_à_arbitrer',
        contributions, reviews, disagreements: reviews.filter((r) => r.verdict === 'désaccord'),
        humanDecision: null, merged: false, published: false });
    },
  };
  return api;
}

function registry() {
  let r = createCandidateRegistry();
  r = registerCandidate(r, { id: 'dev', label: 'Développeur fictif', provider: 'fixture',
    mode: 'sdk', roles: ['developpeur'], declaredCapabilities: ['écrire_code', 'analyse_statique'],
    provenance: 'jeu de données fictif', limitations: ['Aucun moteur réel'] });
  r = registerCandidate(r, { id: 'dora', label: 'Dora déclarative', provider: 'IONOS GPT',
    model: 'gpt-oss-120b (déclaré)', mode: 'manuel', roles: ['relecteur'],
    declaredCapabilities: ['analyse_statique', 'relecture_DE'],
    limitations: ['Pas de navigateur', 'Pas de terminal'], provenance: 'candidature rapportée par le pilote' });
  r = registerCandidate(r, { id: 'crit', label: 'Contradicteur fictif', provider: 'fixture',
    mode: 'manuel', roles: ['contradicteur'], declaredCapabilities: ['critique'],
    provenance: 'jeu de données fictif' });
  return r;
}
const slots = () => [
  { id: 'produire', role: 'developpeur', requiredCapabilities: ['écrire_code'], allowedModes: ['sdk'] },
  { id: 'relire', role: 'relecteur', requiredCapabilities: ['analyse_statique'], allowedModes: ['manuel'], preferredCandidateIds: ['dora'] },
  { id: 'contredire', role: 'contradicteur', requiredCapabilities: ['critique'] },
];
const plan = (r = registry()) => proposePanelSelection({ registry: r, id: 'PE-01-fictif', slots: slots() });
function cooperation(r = registry(), bridge = fakeBridge()) {
  const p = plan(r);
  return { bridge, workflow: prepareCooperation({ registry: r, selection: p, id: 'PE-01-fictif',
    objective: 'Comparer une fiche publique fictive', publicContext: 'Aucun identifiant ni secret',
    directory: '/workspace/fictif-existant', bridge }) };
}
function collection(bridge = fakeBridge()) {
  const { workflow } = cooperation(registry(), bridge);
  const submissions = workflow.panel.missions.map((m) => ({ slotId: m.slotId, candidateId: m.candidateId,
    content: `${m.role} : constat fictif sur une fiche publique`,
    sources: ['preuve:fixture'], limitations: ['non vérifié dans un navigateur'] }));
  return { bridge, collected: collectIndependentContributions({ cooperation: workflow, submissions, bridge }) };
}
function reviewSubmissions(collected) {
  return collected.reviewTasks.map((task, i) => ({ taskId: task.id, reviewerId: task.reviewerId,
    verdict: i === 0 ? 'désaccord' : 'incertitude',
    content: `Objection fictive ${i + 1}`, evidence: [`preuve:fictive-${i}`], limitations: ['Simulation uniquement'] }));
}

test('E-OC-02 : contrat et huit rôles reconnus', () => {
  assert.equal(RECRUITMENT_ROLES.length, 8);
  assert.match(RECRUITMENT_CONTRACT, /eoc02/);
});
test('registre vide, immuable, sans persistance ni activation', () => {
  const r = createCandidateRegistry();
  assert.equal(r.version, 0);
  assert.equal(r.persistent, false);
  assert.equal(r.activated, false);
  assert.ok(Object.isFrozen(r));
  assert.ok(Object.isFrozen(r.candidates));
});
test('inscription conserve fournisseur, provenance et limites, sans recrutement', () => {
  const r = registry();
  assert.equal(r.candidates.length, 3);
  assert.equal(r.history.length, 3);
  assert.equal(r.candidates[1].mode, 'manuel');
  assert.deepEqual(r.candidates[1].limitations, ['Pas de navigateur', 'Pas de terminal']);
  assert.equal(r.candidates[1].recruited, false);
  assert.equal(r.candidates[1].activated, false);
  assert.equal(r.candidates[1].verifiedCapabilities.length, 0);
});
test('doublon et provenance manquante refusés sans mutation', () => {
  const r = registry();
  assert.throws(() => registerCandidate(r, { id: 'dev', label: 'X', provider: 'P', provenance: 'p', mode: 'sdk', roles: ['testeur'] }), /déjà utilisé/);
  assert.throws(() => registerCandidate(r, { id: 'new', label: 'X', provider: 'P', mode: 'manuel', roles: ['testeur'] }), /provenance/);
  assert.equal(r.candidates.length, 3);
});
test('rôle invalide et capacités dupliquées refusés', () => {
  const r = createCandidateRegistry();
  const raw = { id: 'x', label: 'X', provider: 'P', provenance: 'fixture', mode: 'manuel' };
  assert.throws(() => registerCandidate(r, { ...raw, roles: ['administrateur'] }), /Rôle/);
  assert.throws(() => registerCandidate(r, { ...raw, roles: ['testeur'], declaredCapabilities: ['lire', 'lire'] }), /unique/);
  assert.throws(() => registerCandidate(r, { ...raw, roles: ['testeur'], declaredCapabilities: ['lire', ' lire '] }), /unique/);
});
test('évaluation simulée conserve la provenance et ne vérifie pas une capacité', () => {
  const before = registry();
  const after = recordSimulatedEvaluation(before, { candidateId: 'dora', capability: 'analyse_statique',
    observation: 'Relecture fictive cohérente', evidence: 'fixture-test-EOC02' });
  assert.equal(before.candidates[1].status, 'candidat');
  assert.equal(after.candidates[1].status, 'à_évaluer');
  assert.equal(after.candidates[1].qualification, 'simulée');
  assert.equal(after.candidates[1].evaluations[0].verified, false);
  assert.equal(after.candidates[1].verifiedCapabilities.length, 0);
  assert.equal(after.history.length, 4);
});
test('évaluation hors capacité déclarée refusée', () => {
  assert.throws(() => recordSimulatedEvaluation(registry(), { candidateId: 'dora',
    capability: 'terminal', observation: 'Simulation', evidence: 'fixture' }), /non déclarée/);
});
test('tri explicable des candidats : rôle, capacité, mode, provenance', () => {
  const r = registry();
  const all = evaluateCandidates(r, { role: 'relecteur', requiredCapabilities: ['analyse_statique'], allowedModes: ['manuel'] });
  const dora = all.find((x) => x.candidateId === 'dora');
  assert.equal(dora.eligible, true);
  assert.equal(dora.basis, 'déclarations_seulement');
  assert.match(dora.provenance, /pilote/);
  assert.equal(all.find((x) => x.candidateId === 'dev').eligible, false);
  assert.ok(all.find((x) => x.candidateId === 'dev').reasons.includes('mode_incompatible'));
});
test('permission fictive : mode SDK interdit pour Dora manuelle', () => {
  const all = evaluateCandidates(registry(), { role: 'relecteur', requiredCapabilities: ['analyse_statique'], allowedModes: ['sdk'] });
  assert.ok(all.find((x) => x.candidateId === 'dora').reasons.includes('mode_incompatible'));
});
test('capacité non déclarée rend inéligible sans déductions', () => {
  const all = evaluateCandidates(registry(), { role: 'relecteur', requiredCapabilities: ['exécuter_tests'] });
  assert.ok(all.find((x) => x.candidateId === 'dora').reasons.includes('capacités_non_déclarées'));
});
test('mode preuve stricte : même après simulation aucune capacité vérifiée', () => {
  const after = recordSimulatedEvaluation(registry(), { candidateId: 'dora', capability: 'analyse_statique',
    observation: 'Simulée', evidence: 'fixture' });
  const all = evaluateCandidates(after, { role: 'relecteur', requiredCapabilities: ['analyse_statique'], requireVerified: true });
  assert.equal(all.find((x) => x.candidateId === 'dora').eligible, false);
  assert.ok(all.find((x) => x.candidateId === 'dora').reasons.includes('capacités_non_vérifiées'));
});
test('sélection explicite développeur/relecteur/contradicteur avec identités distinctes', () => {
  const p = plan();
  assert.deepEqual(p.selections.map((v) => v.candidateId), ['dev', 'dora', 'crit']);
  assert.equal(new Set(p.selections.map((v) => v.candidateId)).size, 3);
  assert.equal(p.status, 'affectation_proposée');
  assert.equal(p.approvedByHuman, false);
  assert.equal(p.activated, false);
  assert.equal(p.published, false);
});
test('échec clair si rôle obligatoire non pourvu', () => {
  assert.throws(() => proposePanelSelection({ registry: registry(), id: 'x',
    slots: [...slots(), { id: 'tester', role: 'testeur', requiredCapabilities: ['exécuter_tests'] }] }), /Aucun candidat recevable/);
});
test('créneaux dupliqués refusés', () => {
  assert.throws(() => proposePanelSelection({ registry: registry(), id: 'x',
    slots: [{ ...slots()[0], id: 'meme' }, { ...slots()[1], id: 'meme' }] }), /dupliqué/);
});
test('préparation des missions via pont E-OC-01 : aucun SDK ouvert', () => {
  const { bridge, workflow } = cooperation();
  assert.deepEqual(bridge.calls, [
    'proposeCandidate', 'proposeCandidate', 'proposeCandidate', 'prepareReviewPanel',
  ]);
  assert.equal(workflow.status, 'missions_préparées');
  assert.equal(workflow.panel.missions.length, 3);
  assert.equal(workflow.panel.missions.find((m) => m.candidateId === 'dora').directory, null);
  assert.equal(workflow.activated, false);
});
test('mission SDK sans répertoire refusée avant tout lancement', () => {
  const r = registry(), bridge = fakeBridge();
  assert.throws(() => prepareCooperation({ registry: r, selection: plan(r), id: 'E',
    objective: 'Relecture', publicContext: 'fiche publique', bridge }), /répertoire/);
  assert.equal(bridge.calls.includes('sessions.create'), false);
});
test('pas de coordination possible sans pont conforme', () => {
  const r = registry();
  assert.throws(() => prepareCooperation({ registry: r, selection: plan(r), id: 'E',
    objective: 'Relecture', publicContext: 'publique', bridge: {} }), /pont E-OC-01/);
});
test('collecte initiale exige toutes les contributions et les bons auteurs', () => {
  const { bridge, workflow } = cooperation();
  const base = workflow.panel.missions.map((m) => ({ slotId: m.slotId,
    candidateId: m.candidateId, content: `${m.role} pense X` }));
  assert.throws(() => collectIndependentContributions({ cooperation: workflow,
    submissions: base.slice(0, -1), bridge }), /Toutes/);
  assert.throws(() => collectIndependentContributions({ cooperation: workflow,
    submissions: [{ ...base[0], candidateId: 'dora' }, ...base.slice(1)], bridge }), /étrangère/);
});
test('chaque contribution demeure attribuée, distincte et non validée', () => {
  const { collected } = collection();
  assert.equal(collected.contributions.length, 3);
  assert.equal(new Set(collected.contributions.map((v) => v.candidateId)).size, 3);
  assert.ok(collected.contributions.every((v) => v.approvedByHuman === false));
  assert.equal(collected.status, 'revue_croisée_à_faire');
  assert.ok(collected.reviewTasks.every((v) => v.reviewerId !== v.sourceCandidateId));
});
test('échec de collecte ne produit pas un dossier ni de publication', () => {
  const { bridge, workflow } = cooperation();
  assert.throws(() => collectIndependentContributions({ cooperation: workflow,
    submissions: [], bridge }), /Toutes/);
  assert.equal(workflow.published, false);
});
test('revue incomplète refusée', () => {
  const { bridge, collected } = collection();
  assert.throws(() => collectReviewsAndDossier({ collection: collected,
    submissions: reviewSubmissions(collected).slice(0, -1), bridge }), /Toutes les revues/);
});
test('relecteur erroné ou avis dupliqué refusé', () => {
  const { bridge, collected } = collection();
  const submissions = reviewSubmissions(collected);
  assert.throws(() => collectReviewsAndDossier({ collection: collected,
    submissions: [{ ...submissions[0], reviewerId: 'dev' }, ...submissions.slice(1)], bridge }), /étranger/);
  assert.throws(() => collectReviewsAndDossier({ collection: collected,
    submissions: [submissions[0], submissions[0], ...submissions.slice(2)], bridge }), /double/);
});
test('désaccords conservés dans le dossier sans effacer les contributions', () => {
  const { bridge, collected } = collection();
  const original = collected.contributions[0];
  const dossier = collectReviewsAndDossier({ collection: collected, submissions: reviewSubmissions(collected), bridge });
  assert.equal(dossier.status, 'dossier_à_arbitrer');
  assert.equal(dossier.contributions[0], original);
  assert.equal(dossier.disagreements.length, 1);
  assert.equal(dossier.disagreements[0].verdict, 'désaccord');
  assert.equal(dossier.dossier.humanDecision, null);
  assert.equal(dossier.approvedByHuman, false);
  assert.equal(dossier.recruited, false);
  assert.equal(dossier.activated, false);
  assert.equal(dossier.merged, false);
  assert.equal(dossier.published, false);
});
test('le scénario nominal n’appelle ni SDK, ni serveur ni paiement', () => {
  const { bridge, collected } = collection();
  collectReviewsAndDossier({ collection: collected, submissions: reviewSubmissions(collected), bridge });
  assert.ok(bridge.calls.every((name) => !/openCode|host|session|payment|publish|merge/i.test(name)));
});

test('panel minimal à deux contributions indépendantes et une revue externe', () => {
  const base = registry();
  const bridge = fakeBridge();
  const selection = proposePanelSelection({ registry: base, id: 'PAIR-01', slots: slots().slice(0, 2) });
  const workflow = prepareCooperation({ registry: base, selection, id: 'PAIR-01',
    objective: 'Comparer deux arguments fictifs', publicContext: 'Document public fictif',
    directory: '/workspace/fictif-existant', bridge });
  const collected = collectIndependentContributions({ cooperation: workflow, bridge,
    submissions: [
      { slotId: 'produire', candidateId: 'dev', content: 'A : un exemple fictif', limitations: ['non testé'] },
      { slotId: 'relire', candidateId: 'dora', content: 'B : un contre-exemple fictif', limitations: ['sans accès au site'] },
    ] });
  assert.equal(collected.reviewTasks.length, 1);
  assert.equal(collected.reviewTasks[0].reviewerId, 'dora');
  assert.equal(collected.reviewTasks[0].sourceCandidateId, 'dev');
  const result = collectReviewsAndDossier({ collection: collected, bridge, submissions: [{
    taskId: collected.reviewTasks[0].id, reviewerId: 'dora', verdict: 'désaccord',
    content: 'Réserve fictive sans modification de A', evidence: ['fixture'],
  }] });
  assert.equal(result.contributions.length, 2);
  assert.equal(result.disagreements.length, 1);
  assert.equal(result.dossier.humanDecision, null);
});
