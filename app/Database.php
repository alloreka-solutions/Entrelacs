<?php
declare(strict_types=1);

final class Database
{
    private static ?PDO $connection = null;

    public static function connection(): PDO
    {
        if (self::$connection instanceof PDO) {
            return self::$connection;
        }

        if (!extension_loaded('pdo_sqlite')) {
            throw new RuntimeException('Le module PHP pdo_sqlite est requis.');
        }

        $defaultPath = dirname(__DIR__) . '/var/entrelacs.sqlite';
        $configuredPath = getenv('ENTRELACS_DB_PATH');
        $dbPath = is_string($configuredPath) && $configuredPath !== '' ? $configuredPath : $defaultPath;
        $directory = dirname($dbPath);

        if (!is_dir($directory) && !mkdir($directory, 0770, true) && !is_dir($directory)) {
            throw new RuntimeException('Impossible de créer le répertoire de données SQLite.');
        }

        $pdo = new PDO('sqlite:' . $dbPath, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
        $pdo->exec('PRAGMA foreign_keys = ON');
        $pdo->exec('PRAGMA busy_timeout = 5000');

        $schemaPath = dirname(__DIR__) . '/database/schema.sql';
        $schema = file_get_contents($schemaPath);
        if ($schema === false) {
            throw new RuntimeException('Le fichier de schéma SQLite est introuvable.');
        }
        $pdo->exec($schema);

        self::$connection = $pdo;
        return $pdo;
    }
}
