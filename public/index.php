<?php
/**
 * Écran de démonstration : liste des sessions ouvertes et dépôt manuel.
 *
 * Exige PHP 8.2+ et PDO_SQLITE.
 * Ce prototype n'est pas prêt pour une exposition publique.
 */

session_start();

require_once dirname(__DIR__) . '/app/database.php';

function app_escape($value)
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

$message = '';
$sessions = array();

try {
    $db = app_database();

    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $submittedToken = isset($_POST['csrf_token'])
            ? (string) $_POST['csrf_token']
            : '';

        if (!hash_equals($_SESSION['csrf_token'], $submittedToken)) {
            throw new RuntimeException('Invalid form token.');
        }

        $sessionId = isset($_POST['session_id'])
            ? trim((string) $_POST['session_id'])
            : '';

        $content = isset($_POST['content'])
            ? trim((string) $_POST['content'])
            : '';

        if ($sessionId === '' || $content === '') {
            throw new InvalidArgumentException('La session et le texte sont obligatoires.');
        }

        if (strlen($content) > 50000) {
            throw new InvalidArgumentException('La contribution dépasse la limite autorisée.');
        }

        $check = $db->prepare(
            'SELECT id FROM sessions WHERE id = :id AND status = :status'
        );
        $check->execute(array(
            ':id' => $sessionId,
            ':status' => 'open'
        ));

        if (!$check->fetch()) {
            throw new InvalidArgumentException('Session indisponible.');
        }

        $insert = $db->prepare(
            'INSERT INTO contributions (
                id, session_id, version, author_type, author_label,
                role, participation_mode, content, status, created_at
            ) VALUES (
                :id, :session_id, 1, :author_type, :author_label,
                :role, :mode, :content, :status, :created_at
            )'
        );

        $insert->execute(array(
            ':id' => bin2hex(random_bytes(16)),
            ':session_id' => $sessionId,
            ':author_type' => 'human',
            ':author_label' => 'Participant non authentifié',
            ':role' => 'Contribution libre',
            ':mode' => 'manual',
            ':content' => $content,
            ':status' => 'submitted',
            ':created_at' => gmdate('Y-m-d\TH:i:s\Z')
        ));

        $message = 'Contribution enregistrée.';
    }

    $sessions = $db->query(
        "SELECT id, title, objective
         FROM sessions
         WHERE status = 'open'
         ORDER BY created_at DESC"
    )->fetchAll();

} catch (InvalidArgumentException $e) {
    $message = $e->getMessage();
} catch (Exception $e) {
    // Ne pas exposer les détails internes d'une exception aux visiteurs.
    error_log('Prototype application error: ' . $e->getMessage());
    $message = 'Une erreur est survenue. Consultez le journal serveur.';
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Initiative ouverte — Contributions</title>
    <link rel="stylesheet" href="assets/style.css">
</head>
<body>
<main class="container">
    <header>
        <p class="eyebrow">Espace de travail collaboratif</p>
        <h1>Initiative ouverte</h1>
        <p>Propositions, contributions et échanges entre participants.</p>
    </header>

    <?php if ($message !== ''): ?>
        <p class="notice"><?php echo app_escape($message); ?></p>
    <?php endif; ?>

    <section aria-labelledby="sessions-title">
        <h2 id="sessions-title">Sessions ouvertes</h2>

        <?php if (count($sessions) === 0): ?>
            <p>Aucune session ouverte pour le moment.</p>
        <?php else: ?>
            <?php foreach ($sessions as $item): ?>
                <article class="session">
                    <h3><?php echo app_escape($item['title']); ?></h3>
                    <p><?php echo nl2br(app_escape($item['objective'])); ?></p>

                    <form method="post">
                        <input type="hidden" name="csrf_token"
                            value="<?php echo app_escape($_SESSION['csrf_token']); ?>">
                        <input type="hidden" name="session_id"
                            value="<?php echo app_escape($item['id']); ?>">

                        <label for="content-<?php echo app_escape($item['id']); ?>">
                            Votre contribution
                        </label>
                        <textarea
                            id="content-<?php echo app_escape($item['id']); ?>"
                            name="content"
                            maxlength="50000"
                            rows="6"
                            required></textarea>

                        <button type="submit">Envoyer la contribution</button>
                    </form>
                </article>
            <?php endforeach; ?>
        <?php endif; ?>
    </section>

    <footer>
        <p>Prototype de travail — aucune connexion à un service d'IA n'est active.</p>
    </footer>
</main>
</body>
</html>
