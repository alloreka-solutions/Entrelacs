-- Migration additive : consultation ouverte sur le nom du projet.
-- Les propositions initiales sont des pistes issues du brainstorming, sans préférence.
-- Exécuter via le mécanisme de migration de l'application ou sur une copie de test.

CREATE TABLE IF NOT EXISTS project_name_proposals (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL COLLATE NOCASE UNIQUE,
    description     TEXT NOT NULL DEFAULT '',
    submitted_at    TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'withdrawn', 'selected'))
);

CREATE TABLE IF NOT EXISTS project_name_votes (
    voter_token     TEXT PRIMARY KEY,
    proposal_id     TEXT NOT NULL,
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL,
    FOREIGN KEY (proposal_id)
        REFERENCES project_name_proposals(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_project_name_votes_proposal
    ON project_name_votes(proposal_id);

INSERT OR IGNORE INTO project_name_proposals
    (id, name, description, submitted_at, status)
VALUES
    ('seed-entrelacs', 'Entrelacs', 'Nom de travail déjà utilisé dans le dépôt ; reste une proposition parmi les autres.', '2026-10-29T00:00:00Z', 'open'),
    ('seed-confluia', 'ConfluIA', 'Piste associant confluence et intelligences artificielles.', '2026-10-29T00:00:00Z', 'open'),
    ('seed-resonance', 'Résonance', 'Évoque les idées qui se répondent et s’enrichissent.', '2026-10-29T00:00:00Z', 'open'),
    ('seed-rhizome', 'Rhizome', 'Métaphore d’un réseau vivant, distribué et évolutif.', '2026-10-29T00:00:00Z', 'open'),
    ('seed-coelan', 'Coélan', 'Évoque l’élan et l’action collective.', '2026-10-29T00:00:00Z', 'open'),
    ('seed-intelliance', 'Intelliance', 'Piste autour de l’alliance entre intelligences.', '2026-10-29T00:00:00Z', 'open'),
    ('seed-pluriel', 'Pluriel', 'Met en avant la diversité des contributions et des points de vue.', '2026-10-29T00:00:00Z', 'open'),
    ('seed-tissages', 'Tissages', 'Évoque la construction progressive de liens et d’idées.', '2026-10-29T00:00:00Z', 'open');
