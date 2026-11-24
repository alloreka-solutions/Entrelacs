/**
 * EntreLacs E-OC-02 — in-memory candidate registry and explainable coordination.
 * No OpenCode import, provider calls, persistence, recruitment or permission grant.
 * The core E-OC-01 bridge is passed as a dependency to keep this module inert.
 */
export const RECRUITMENT_CONTRACT = 'entrelacs-recrutement-eoc02-v0.1';
export const RECRUITMENT_ROLES = Object.freeze([
  'explorateur', 'architecte', 'developpeur', 'testeur',
  'relecteur', 'contradicteur', 'documentaliste', 'synthetiseur',
]);
const ROLES = new Set(RECRUITMENT_ROLES);
const MODES = new Set(['manuel', 'sdk']);
const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;
const unique = (values) => new Set(values).size === values.length;

function strings(values, label, { empty = false } = {}) {
  if (!Array.isArray(values) || (!empty && values.length === 0) ||
      values.some((value) => !nonEmpty(value)) ||
      !unique(values.map((value) => value.trim()))) {
    throw new TypeError(`${label} doit contenir des libellés uniques et non vides.`);
  }
  return Object.freeze(values.map((value) => value.trim()));
}
function freeze(value) { return Object.freeze(value); }
function existingRegistry(registry) {
  if (registry?.contract !== RECRUITMENT_CONTRACT ||
      !Array.isArray(registry.candidates) || !Array.isArray(registry.history)) {
    throw new TypeError('Registre EntreLacs invalide.');
  }
}
function nextRegistry(registry, candidateList, event) {
  return freeze({ contract: RECRUITMENT_CONTRACT, version: registry.version + 1,
    candidates: freeze(candidateList), history: freeze([...registry.history, freeze(event)]),
    persistent: false, activated: false });
}

/** All dates and provenance must be provided by the caller: never invent evidence. */
export function createCandidateRegistry() {
  return freeze({ contract: RECRUITMENT_CONTRACT, version: 0,
    candidates: freeze([]), history: freeze([]), persistent: false, activated: false });
}

export function registerCandidate(registry, input) {
  existingRegistry(registry);
  if (!input || !nonEmpty(input.id) || !nonEmpty(input.label) ||
      !nonEmpty(input.provider) || !nonEmpty(input.provenance) ||
      !MODES.has(input.mode) || registry.candidates.some((c) => c.id === input.id.trim())) {
    throw new TypeError('Candidature invalide, sans provenance ou identifiant déjà utilisé.');
  }
  const roles = strings(input.roles, 'Rôles');
  if (roles.some((role) => !ROLES.has(role))) throw new TypeError('Rôle non reconnu.');
  const declaredCapabilities = strings(input.declaredCapabilities ?? [], 'Capacités déclarées', { empty: true });
  const limitations = strings(input.limitations ?? [], 'Limites déclarées', { empty: true });
  const candidate = freeze({ id: input.id.trim(), label: input.label.trim(),
    provider: input.provider.trim(), model: nonEmpty(input.model) ? input.model.trim() : 'non vérifié',
    mode: input.mode, roles, declaredCapabilities, limitations,
    provenance: input.provenance.trim(),
    status: 'candidat', qualification: 'non_évaluée',
    evaluations: freeze([]), verifiedCapabilities: freeze([]),
    recruited: false, activated: false });
  return nextRegistry(registry, [...registry.candidates, candidate],
    { type: 'candidature_proposée', candidateId: candidate.id, provenance: candidate.provenance });
}

/** A simulated assessment is evidence about a fixture, NOT verification of an AI provider. */
export function recordSimulatedEvaluation(registry, { candidateId, capability, observation, evidence }) {
  existingRegistry(registry);
  if (!nonEmpty(candidateId) || !nonEmpty(capability) ||
      !nonEmpty(observation) || !nonEmpty(evidence)) {
    throw new TypeError('Une évaluation simulée doit être étayée.');
  }
  const original = registry.candidates.find((c) => c.id === candidateId);
  if (!original || !original.declaredCapabilities.includes(capability)) {
    throw new TypeError('Évaluation hors candidat ou capacité non déclarée.');
  }
  const evaluation = freeze({ capability, observation: observation.trim(),
    evidence: evidence.trim(), level: 'simulation', verified: false });
  const updated = freeze({ ...original, status: 'à_évaluer', qualification: 'simulée',
    evaluations: freeze([...original.evaluations, evaluation]) });
  return nextRegistry(registry,
    registry.candidates.map((c) => c.id === candidateId ? updated : c),
    { type: 'évaluation_simulée', candidateId, capability, evidence: evidence.trim() });
}

/** Deterministic eligibility report, with no opaque score or automatic recruitment. */
export function evaluateCandidates(registry, request) {
  existingRegistry(registry);
  if (!request || !ROLES.has(request.role)) throw new TypeError('Rôle demandé inconnu.');
  const requiredCapabilities = strings(request.requiredCapabilities ?? [], 'Compétences requises', { empty: true });
  const allowedModes = strings(request.allowedModes ?? ['manuel', 'sdk'], 'Modes acceptés');
  if (allowedModes.some((mode) => !MODES.has(mode))) throw new TypeError('Mode de mission inconnu.');
  const excludedIds = strings(request.excludedIds ?? [], 'Exclusions', { empty: true });
  const requireVerified = request.requireVerified === true;
  return freeze([...registry.candidates].sort((a, b) => a.id.localeCompare(b.id, 'fr')).map((candidate) => {
    const reasons = [];
    if (!candidate.roles.includes(request.role)) reasons.push('rôle_non_déclaré');
    if (!allowedModes.includes(candidate.mode)) reasons.push('mode_incompatible');
    if (excludedIds.includes(candidate.id)) reasons.push('candidat_exclu');
    if (candidate.status === 'indisponible') reasons.push('candidat_indisponible');
    const missing = requiredCapabilities.filter((cap) => !(
      requireVerified ? candidate.verifiedCapabilities : candidate.declaredCapabilities).includes(cap));
    if (missing.length) reasons.push(requireVerified ? 'capacités_non_vérifiées' : 'capacités_non_déclarées');
    return freeze({ candidateId: candidate.id, label: candidate.label, role: request.role,
      mode: candidate.mode, provenance: candidate.provenance, eligible: reasons.length === 0,
      reasons: freeze(reasons), missingCapabilities: freeze(missing),
      basis: requireVerified ? 'preuves_vérifiées' : 'déclarations_seulement',
      recruited: false });
  }));
}

/** Proposes unique people for explicit role slots; never calls a provider. */
export function proposePanelSelection({ registry, id, slots }) {
  existingRegistry(registry);
  if (!nonEmpty(id) || !Array.isArray(slots) || slots.length < 2) {
    throw new TypeError('Un panel identifié et deux rôles au minimum sont nécessaires.');
  }
  const usedIds = new Set(), slotIds = new Set(), selections = [], explanations = [];
  for (const slot of slots) {
    if (!slot || !nonEmpty(slot.id) || slotIds.has(slot.id.trim()) || !ROLES.has(slot.role)) {
      throw new TypeError('Créneau manquant, dupliqué ou rôle invalide.');
    }
    slotIds.add(slot.id.trim());
    const report = evaluateCandidates(registry, { ...slot, excludedIds: [...usedIds] });
    const eligible = report.filter((entry) => entry.eligible);
    // The coordinator may state a public preference, but cannot grant new rights.
    const preferred = strings(slot.preferredCandidateIds ?? [], 'Préférences', { empty: true });
    const winner = eligible.find((entry) => preferred.includes(entry.candidateId)) ?? eligible[0];
    explanations.push(freeze({ slotId: slot.id.trim(), role: slot.role,
      evaluated: report, selectedId: winner?.candidateId ?? null }));
    if (!winner) throw new Error(`Aucun candidat recevable pour ${slot.id.trim()} (${slot.role}).`);
    const record = registry.candidates.find((candidate) => candidate.id === winner.candidateId);
    usedIds.add(record.id);
    selections.push(freeze({ slotId: slot.id.trim(), candidateId: record.id,
      role: slot.role, mode: record.mode, label: record.label,
      provenance: record.provenance, declaredCapabilities: record.declaredCapabilities,
      limitations: record.limitations, basis: winner.basis, activated: false }));
  }
  return freeze({ id: id.trim(), contract: RECRUITMENT_CONTRACT,
    status: 'affectation_proposée', selections: freeze(selections),
    explanations: freeze(explanations), approvedByHuman: false, recruited: false,
    activated: false, published: false });
}

function validateBridge(bridge, functions) {
  if (!bridge || functions.some((method) => typeof bridge[method] !== 'function')) {
    throw new TypeError('Contrat du pont E-OC-01 incomplet.');
  }
}

/** Connect to E-OC-01 without importing it or starting an OpenCode host. */
export function prepareCooperation({ registry, selection, id, objective, publicContext, directory, bridge }) {
  existingRegistry(registry);
  validateBridge(bridge, ['proposeCandidate', 'prepareReviewPanel']);
  if (selection?.contract !== RECRUITMENT_CONTRACT ||
      selection.status !== 'affectation_proposée' || !nonEmpty(id) ||
      selection.id !== id.trim() || !nonEmpty(objective) || !nonEmpty(publicContext)) {
    throw new TypeError('Sélection ou mission non préparée.');
  }
  const candidates = selection.selections.map((record) => {
    const original = registry.candidates.find((candidate) => candidate.id === record.candidateId);
    if (!original || !original.roles.includes(record.role) || original.mode !== record.mode) {
      throw new Error('Candidature devenue incompatible.');
    }
    return bridge.proposeCandidate({ id: original.id, label: original.label,
      provider: original.provider, model: original.model,
      role: record.role, mode: record.mode,
      declaredCapabilities: [...original.declaredCapabilities], provenance: original.provenance });
  });
  const panel = bridge.prepareReviewPanel({ id: id.trim(), objective: objective.trim(),
    publicContext: publicContext.trim(), candidates,
    assignments: selection.selections.map(({ slotId, candidateId }) => ({ slotId, candidateId })),
    directory });
  return freeze({ contract: RECRUITMENT_CONTRACT, id: id.trim(),
    status: 'missions_préparées', selection, panel, proposalsOnly: true,
    approvedByHuman: false, activated: false, published: false });
}

export function collectIndependentContributions({ cooperation, submissions, bridge }) {
  validateBridge(bridge, ['recordContribution', 'prepareCrossReviews']);
  if (cooperation?.contract !== RECRUITMENT_CONTRACT ||
      cooperation.status !== 'missions_préparées' || !Array.isArray(submissions) ||
      submissions.length !== cooperation.panel.missions.length) {
    throw new TypeError('Toutes les contributions initiales indépendantes sont requises.');
  }
  const indexes = new Map(cooperation.panel.missions.map((mission) => [mission.slotId, mission]));
  const seen = new Set();
  const contributions = submissions.map((entry) => {
    const mission = indexes.get(entry?.slotId);
    if (!mission || seen.has(entry.slotId) ||
        mission.candidateId !== entry.candidateId || !nonEmpty(entry.content)) {
      throw new Error('Contribution initiale étrangère, dupliquée ou vide.');
    }
    seen.add(entry.slotId);
    return bridge.recordContribution({ panel: cooperation.panel, missionId: mission.id,
      candidateId: entry.candidateId, content: entry.content,
      sources: entry.sources ?? [], limitations: entry.limitations ?? [] });
  });
  const reviewTasks = bridge.prepareCrossReviews({ panel: cooperation.panel, contributions });
  return freeze({ contract: RECRUITMENT_CONTRACT,
    status: 'revue_croisée_à_faire', cooperation,
    contributions: freeze(contributions), reviewTasks: freeze(reviewTasks),
    approvedByHuman: false, activated: false, published: false });
}

export function collectReviewsAndDossier({ collection, submissions, bridge }) {
  validateBridge(bridge, ['recordCrossReview', 'prepareDecisionDossier']);
  if (collection?.contract !== RECRUITMENT_CONTRACT ||
      collection.status !== 'revue_croisée_à_faire' || !Array.isArray(submissions) ||
      submissions.length !== collection.reviewTasks.length) {
    throw new TypeError('Toutes les revues croisées attribuées sont requises.');
  }
  const byTask = new Map(collection.reviewTasks.map((task) => [task.id, task]));
  const seen = new Set();
  const reviews = submissions.map((entry) => {
    const task = byTask.get(entry?.taskId);
    if (!task || seen.has(task.id) || entry.reviewerId !== task.reviewerId ||
        !nonEmpty(entry.content)) {
      throw new Error('Avis étranger, en double ou incorrectement attribué.');
    }
    seen.add(task.id);
    return bridge.recordCrossReview({ task, reviewerId: entry.reviewerId,
      content: entry.content, verdict: entry.verdict,
      evidence: entry.evidence ?? [], limitations: entry.limitations ?? [] });
  });
  const dossier = bridge.prepareDecisionDossier({ panel: collection.cooperation.panel,
    contributions: collection.contributions, reviews });
  return freeze({ contract: RECRUITMENT_CONTRACT, status: 'dossier_à_arbitrer',
    selection: collection.cooperation.selection,
    contributions: collection.contributions, reviews: freeze(reviews), dossier,
    disagreements: freeze(reviews.filter((entry) => entry.verdict === 'désaccord')),
    humanDecision: null, approvedByHuman: false, recruited: false,
    activated: false, merged: false, published: false });
}
