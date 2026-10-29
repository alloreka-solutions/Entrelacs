<?php
/**
 * Connexion SQLite du prototype.
 *
 * Exige PHP 8.2+ et PDO_SQLITE.
 * Le fichier SQLite doit rester hors de la racine web.
 */

function app_database()
{
    $databasePath = dirname(__DIR__) . '/storage/database/app.sqlite';
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

    return $db;
}
