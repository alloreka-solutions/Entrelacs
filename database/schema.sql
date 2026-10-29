-- Entrelacs — schéma initial SQLite
-- Version : 0.1
-- Appliquer sur une base neuve uniquement après sauvegarde et vérification.
-- Les suppressions en cascade sont volontairement évitées pour préserver la traçabilité.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS projects (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'paused', 'archived')),
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    id              TEXT PRIMARY KEY,
    project_id      TEXT NOT NULL,
    title           TEXT NOT NULL,
    objective       TEXT NOT NULL,
    expected_output TEXT NOT NULL DEFAULT '',
    constraints     TEXT NOT NULL DEFAULT '',
    status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'open', 'review', 'synthesis', 'closed', 'archived')),
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS tasks (
    id              TEXT PRIMARY KEY,
    session_id      TEXT NOT NULL,
    title           TEXT NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    assigned_role   TEXT NOT NULL DEFAULT '',
    status          TEXT NOT NULL DEFAULT 'todo'
                    CHECK (status IN ('todo', 'in_progress', 'blocked', 'review', 'done', 'cancelled')),
    acceptance_criteria TEXT NOT NULL DEFAULT '',
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS task_dependencies (
    task_id         TEXT NOT NULL,
    depends_on_task_id TEXT NOT NULL,
    created_at      TEXT NOT NULL,
    PRIMARY KEY (task_id, depends_on_task_id),
    CHECK (task_id <> depends_on_task_id),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE RESTRICT,
    FOREIGN KEY (depends_on_task_id) REFERENCES tasks(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS contributions (
    id              TEXT PRIMARY KEY,
    session_id      TEXT NOT NULL,
    task_id         TEXT,
    parent_id       TEXT,
    version         INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
    author_type     TEXT NOT NULL
                    CHECK (author_type IN ('human', 'agent', 'system')),
    author_label    TEXT NOT NULL,
    provider        TEXT NOT NULL DEFAULT '',
    model           TEXT NOT NULL DEFAULT '',
    role            TEXT NOT NULL,
    participation_mode TEXT NOT NULL DEFAULT 'manual'
                    CHECK (participation_mode IN ('manual', 'official_api', 'authorized_integration', 'local')),
    content         TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'submitted'
                    CHECK (status IN ('draft', 'submitted', 'in_review', 'revised', 'archived')),
    sources_json    TEXT NOT NULL DEFAULT '[]',
    limitations     TEXT NOT NULL DEFAULT '',
    created_at      TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE RESTRICT,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE RESTRICT,
    FOREIGN KEY (parent_id) REFERENCES contributions(id) ON DELETE RESTRICT,
    UNIQUE (parent_id, version)
);

CREATE TABLE IF NOT EXISTS reviews (
    id              TEXT PRIMARY KEY,
    contribution_id TEXT NOT NULL,
    author_label    TEXT NOT NULL,
    role            TEXT NOT NULL,
    scope           TEXT NOT NULL DEFAULT '',
    remark_type     TEXT NOT NULL
                    CHECK (remark_type IN ('fact', 'reasoning', 'security', 'test', 'documentation', 'design', 'other')),
    severity        TEXT NOT NULL DEFAULT 'unspecified'
                    CHECK (severity IN ('unspecified', 'low', 'medium', 'high', 'critical')),
    argument        TEXT NOT NULL,
    evidence_json   TEXT NOT NULL DEFAULT '[]',
    recommendation TEXT NOT NULL DEFAULT '',
    limitations     TEXT NOT NULL DEFAULT '',
    status          TEXT NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'answered', 'resolved', 'not_retained')),
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL,
    FOREIGN KEY (contribution_id) REFERENCES contributions(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS decisions (
    id              TEXT PRIMARY KEY,
    session_id      TEXT NOT NULL,
    title           TEXT NOT NULL,
    rationale       TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'to_review'
                    CHECK (status IN ('to_review', 'accepted', 'conditional', 'rejected', 'deferred')),
    decided_by      TEXT NOT NULL,
    related_items_json TEXT NOT NULL DEFAULT '[]',
    conditions      TEXT NOT NULL DEFAULT '',
    created_at      TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS audit_events (
    id              TEXT PRIMARY KEY,
    session_id      TEXT,
    actor_type      TEXT NOT NULL
                    CHECK (actor_type IN ('human', 'agent', 'system')),
    actor_label     TEXT NOT NULL,
    event_type      TEXT NOT NULL,
    object_type     TEXT NOT NULL DEFAULT '',
    object_id       TEXT NOT NULL DEFAULT '',
    details_json    TEXT NOT NULL DEFAULT '{}',
    created_at      TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_sessions_project_created
    ON sessions(project_id, created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_session_status
    ON tasks(session_id, status);
CREATE INDEX IF NOT EXISTS idx_contributions_session_created
    ON contributions(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_contributions_task
    ON contributions(task_id);
CREATE INDEX IF NOT EXISTS idx_reviews_contribution_status
    ON reviews(contribution_id, status);
CREATE INDEX IF NOT EXISTS idx_decisions_session_status
    ON decisions(session_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_session_created
    ON audit_events(session_id, created_at);
