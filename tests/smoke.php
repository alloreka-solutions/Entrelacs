<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/app/Database.php';

if (!extension_loaded('pdo_sqlite')) {
    fwrite(STDERR, "SKIP: pdo_sqlite is not installed.\n");
    exit(2);
}

$tempPath = sys_get_temp_dir() . '/entrelacs-smoke-' . bin2hex(random_bytes(6)) . '.sqlite';
putenv('ENTRELACS_DB_PATH=' . $tempPath);

try {
    $pdo = Database::connection();
    $pdo->exec("INSERT INTO projects (name, description) VALUES ('Projet test', 'Test automatisé')");
    $projectId = (int) $pdo->lastInsertId();

    $stmt = $pdo->prepare("INSERT INTO sessions (project_id, title, prompt) VALUES (:project_id, :title, :prompt)");
    $stmt->execute(['project_id' => $projectId, 'title' => 'Session test', 'prompt' => 'Vérifier la persistance']);
    $sessionId = (int) $pdo->lastInsertId();

    $stmt = $pdo->prepare("INSERT INTO contributions (session_id, author, role, content) VALUES (:session_id, :author, :role, :content)");
    $stmt->execute(['session_id' => $sessionId, 'author' => 'Test IA', 'role' => 'critic', 'content' => 'Contribution de test']);
    
    $stmt = $pdo->prepare('SELECT p.name, s.title, c.author, c.content FROM projects p JOIN sessions s ON s.project_id = p.id JOIN contributions c ON c.session_id = s.id WHERE p.id = :id');
    $stmt->execute(['id' => $projectId]);
    $row = $stmt->fetch();

    if (!$row || $row['name'] !== 'Projet test' || $row['title'] !== 'Session test' || $row['author'] !== 'Test IA' || $row['content'] !== 'Contribution de test') {
        throw new RuntimeException('Les données de test ne sont pas récupérées correctement.');
    }

    echo "OK: schéma SQLite, relations et persistance vérifiés.\n";
} finally {
    unset($pdo);
    if (is_file($tempPath)) {
        unlink($tempPath);
    }
}
