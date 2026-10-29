<?php
/**
 * Connexion SQLite et application des migrations additives.
 *
 * Exige PHP 8.2+ et PDO_SQLITE.
 * La base SQLite doit rester hors de la racine web.
 */

function app_apply_migrations($db)
{
    $db->exec(
        'CREATE TABLE IF NOT EXISTS app_migrations (
            migration_id TEXT PRIMARY KEY,
            applied_at TEXT NOT NULL
        )'
    );

    $migrationId = '001_project_name_poll';

    $check = $db->prepare(
        'SELECT migration_id FROM app_migrations WHERE migration_id = :id'
    );
    $check->execute(array(':id' => $migrationId));

    if ($check->fetch()) {
        return;
    }

    $migrationPath = dirname(__DIR__) . '/database/migrations/001_project_name_poll.sql';
    $sql = file_get_contents($migrationPath);

    if ($sql === false) {
        throw new RuntimeException('Database migration file is unavailable.');
    }

    $db->beginTransaction();

    try {
        $db->exec($sql);

        $insert = $db->prepare(
            'INSERT INTO app_migrations (migration_id, applied_at)
             VALUES (:id, :applied_at)'
        );
        $insert->execute(array(
            ':id' => $migrationId,
            ':applied_at' => gmdate('Y-m-d\TH:i:s\Z')
        ));

        $db->commit();
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        throw $e;
    }
}

function app_database()
{
    $configuredPath = getenv('ENTRELACS_DB_PATH');
    $databasePath = is_string($configuredPath) && $configuredPath !== ''
        ? $configuredPath
        : dirname(__DIR__) . '/storage/database/app.sqlite';
    $directory = dirname($databasePath);

    if (!is_dir($directory)) {
        if (!mkdir($directory, 0700, true) && !is_dir($directory)) {
            throw new RuntimeException('Database directory is unavailable.');
        }
    }

    if (!is_writable($directory)) {
        throw new RuntimeException('Database directory is not writable.');
    }

    $db = new PDO('sqlite:' . $databasePath, null, null, array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false
    ));

    $db->exec('PRAGMA foreign_keys = ON');
    $db->exec('PRAGMA busy_timeout = 5000');

    app_apply_migrations($db);

    return $db;
}
