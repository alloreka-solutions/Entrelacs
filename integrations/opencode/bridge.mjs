/** EntreLacs — OpenCode adapter prototype. No provider activation at import time. */
export const BRIDGE_CONTRACT = 'entrelacs-opencode-review-v0.1';

const ROLES = new Set(['developpeur', 'relecteur', 'contradicteur', 'documentaliste']);
const MODES = new Set(['manuel', 'sdk']);
const nonEmpty = (x) => typeof x === 'string' && x.trim().length > 0;

/** A candidate record is a proposal, never a recruitment decision. */
export function proposeCandidate(input) {
  if (!input || !nonEmpty(input.id) || !nonEmpty(input.label) ||
      !nonEmpty(input.provider) || !ROLES.has(input.role) || !MODES.has(input.mode)) {
    throw new TypeError('Fiche candidat incomplète ou rôle/mode inconnu.');
  }
  return Object.freeze({
    id: input.id.trim(), label: input.label.trim(), provider: input.provider.trim(),
    model: nonEmpty(input.model) ? input.model.trim() : 'non vérifié',
    role: input.role, mode: input.mode,
    declaredCapabilities: Array.isArray(input.declaredCapabilities) ? [...input.declaredCapabilities] : [],
    provenance: nonEmpty(input.provenance) ? input.provenance.trim() : 'déclaration non recoupée',
    status: 'candidat', verified: false,
  });
}

/** Creates a bounded, human-reviewable assignment, without any AI call. */
export function prepareReview({ id, candidate, objective, publicContext, directory }) {
  if (!nonEmpty(id) || !candidate || candidate.status !== 'candidat' ||
      !nonEmpty(objective) || !nonEmpty(publicContext)) {
    throw new TypeError('Mission, candidat ou contexte public manquant.');
  }
  if (candidate.mode === 'sdk' && !nonEmpty(directory)) {
    throw new TypeError('Un répertoire de projet explicite est nécessaire pour le SDK.');
  }
  const prompt = [
    `EntreLacs — mission ${id.trim()} — rôle ${candidate.role}.`,
    'Le contenu ci-dessous est public. Ne sollicite pas de données privées ni de secrets.',
    `Objectif : ${objective.trim()}`,
    `Contexte public : ${publicContext.trim()}`,
    'Produis au maximum trois constats avec preuves, limites et correctifs proposés.',
    'Sépare observations confirmées, hypothèses, et propositions.',
    'Ne fusionne, ne contacte personne, ne déploie et ne dépense rien.',
    'Le pilote humain décide des suites. Ne prétends pas avoir exécuté un test non réalisé.',
  ].join('\n\n');
  return Object.freeze({
    id: id.trim(), candidateId: candidate.id, mode: candidate.mode,
    directory: candidate.mode === 'sdk' ? directory.trim() : null,
    prompt, status: 'préparée', contract: BRIDGE_CONTRACT,
  });
}

/**
 * Only this function can invoke a host. Approval must refer to the exact mission.
 * Tool permissions and provider billing are configured outside this prototype:
 * never call it until those conditions have been independently qualified.
 */
export async function executeApprovedReview({ mission, approval, hostFactory }) {
  if (!mission || mission.contract !== BRIDGE_CONTRACT || mission.mode !== 'sdk') {
    throw new Error('Une mission SDK préparée est requise.');
  }
  if (!approval || approval.missionId !== mission.id || approval.allowModelCall !== true) {
    throw new Error('Appel au modèle non autorisé pour cette mission.');
  }
  if (typeof hostFactory !== 'function') {
    throw new TypeError('Fabrique de SDK non fournie.');
  }
  const host = await hostFactory();
  try {
    const session = await host.sessions.create({ location: { directory: mission.directory } });
    if (!nonEmpty(session?.id)) throw new Error('Session OpenCode sans identifiant.');
    const result = await host.sessions.prompt({ sessionID: session.id, text: mission.prompt });
    return {
      missionId: mission.id, sessionId: session.id, mode: 'sdk',
      status: 'proposition_à_revoir', result,
      approvedByHuman: false, merged: false, published: false,
    };
  } finally {
    await host?.close?.();
  }
}

/** Lazy import: calling prepareReview or importing this file starts no SDK. */
export async function createOpenCodeHost() {
  const { OpenCode } = await import('@opencode/sdk');
  return OpenCode.create();
}
