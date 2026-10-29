<?php
declare(strict_types=1);

if (!extension_loaded('pdo_sqlite')) {
    fwrite(STDERR, "pdo_sqlite is required for this smoke test.\n");
    exit(1);
}

$tempDirectory = sys_get_temp_dir() . '/entrelacs-test-' . bin2hex(random_bytes(6));
if (!mkdir($tempDirectory, 0700, true)) {
    throw new RuntimeException('Unable to create temporary test directory.');
}
$databasePath = $tempDirectory . '/test.sqlite';
putenv('ENTRELACS_DB_PATH=' . $databasePath);

require_once dirname(__DIR__) . '/app/database.php';

try {
    $db = app_database();
    $db->exec('PRAGMA foreign_keys = ON');

    $migration = $db->query(
        "SELECT migration_id FROM app_migrations WHERE migration_id = '001_project_name_poll'"
    )->fetchColumn();
    if ($migration !== '001_project_name_poll') {
        throw new RuntimeException('The initial migration was not recorded.');
    }

    $proposalId = bin2hex(random_bytes(16));
    $insert = $db->prepare(
        'INSERT INTO project_name_proposals (id, name, description, submitted_at, status)
         VALUES (:id, :name, :description, :submitted_at, :status)'
    );
    $insert->execute(array(
        ':id' => $proposalId,
        ':name' => 'Test ' . bin2hex(random_bytes(4)),
        ':description' => 'Proposition de test',
        ':submitted_at' => gmdate('Y-m-d\\TH:i:s\\Z'),
        ':status' => 'open'
    ));

    $vote = $db->prepare(
        'INSERT INTO project_name_votes (voter_token, proposal_id, created_at, updated_at)
         VALUES (:token, :proposal, :created, :updated)'
    );
    $now = gmdate('Y-m-d\\TH:i:s\\Z');
    if (preg_match('/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$/', $now) !== 1) {
        throw new RuntimeException('Timestamp must be valid UTC ISO 8601.');
    }
    $vote->execute(array(
        ':token' => bin2hex(random_bytes(16)),
        ':proposal' => $proposalId,
        ':created' => $now,
        ':updated' => $now
    ));

    $count = $db->query(
        'SELECT COUNT(*) FROM project_name_votes WHERE proposal_id = ' . $db->quote($proposalId)
    )->fetchColumn();
    if ((int) $count !== 1) {
        throw new RuntimeException('The test vote was not persisted.');
    }

    // Reopening the database must not re-run or break the migration.
    $db = null;
    $db = app_database();
    $migrationCount = (int) $db->query(
        "SELECT COUNT(*) FROM app_migrations WHERE migration_id = '001_project_name_poll'"
    )->fetchColumn();
    if ($migrationCount !== 1) {
        throw new RuntimeException('Migration idempotency check failed.');
    }
    $persistedVoteCount = (int) $db->query(
        'SELECT COUNT(*) FROM project_name_votes WHERE proposal_id = ' . $db->quote($proposalId)
    )->fetchColumn();
    if ($persistedVoteCount !== 1) {
        throw new RuntimeException('The vote did not persist after reopening the database.');
    }

    echo "OK: SQLite connection, initial migration, foreign-key relation and persistence.\n";
} finally {
    if (isset($db) && $db instanceof PDO) {
        $db = null;
    }
    foreach (glob($tempDirectory . '/*') ?: array() as $file) {
        if (is_file($file)) {
            unlink($file);
        }
    }
    if (is_dir($tempDirectory)) {
        rmdir($tempDirectory);
    }
}
