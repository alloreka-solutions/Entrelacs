<?php
/**
 * Prototype : propositions et vote consultatif sur le nom du projet,
 * plus dépôt manuel de contributions dans les sessions ouvertes.
 *
 * Exige PHP 8.2+ et PDO_SQLITE.
 * Le vote repose sur une session navigateur : il n'est pas résistant
 * à la suppression des cookies, aux navigateurs multiples ou aux robots.
 * Ne pas présenter ce mécanisme comme un scrutin vérifié.
 */

session_start();

require_once dirname(__DIR__) . '/app/database.php';

function app_escape($value)
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

$message = '';
$sessions = array();
$proposals = array();
$myVote = null;
$db = null;

try {
    $db = app_database();

    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    if (!isset($_SESSION['name_vote_token'])) {
        $_SESSION['name_vote_token'] = bin2hex(random_bytes(32));
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $submittedToken = isset($_POST['csrf_token'])
            ? (string) $_POST['csrf_token']
            : '';

        if (!hash_equals($_SESSION['csrf_token'], $submittedToken)) {
            throw new RuntimeException('Jeton de sécurité invalide.');
        }

        $action = isset($_POST['action']) ? (string) $_POST['action'] : '';

        if ($action === 'propose_name') {
            $name = isset($_POST['name']) ? trim((string) $_POST['name']) : '';
            $description = isset($_POST['description'])
                ? trim((string) $_POST['description'])
                : '';

            if ($name === '' || strlen($name) > 80) {
                throw new InvalidArgumentException('Le nom doit contenir entre 1 et 80 caractères.');
            }

            if (strlen($description) > 1000) {
                throw new InvalidArgumentException('La description est trop longue (1 000 octets maximum).');
            }

            $insert = $db->prepare(
                'INSERT INTO project_name_proposals
                    (id, name, description, submitted_at, status)
                 VALUES (:id, :name, :description, :submitted_at, :status)'
            );

            try {
                $insert->execute(array(
                    ':id' => bin2hex(random_bytes(16)),
                    ':name' => $name,
                    ':description' => $description,
                    ':submitted_at' => gmdate('Y-m-d\TH:i:s\Z'),
                    ':status' => 'open'
                ));
                $message = 'Votre proposition de nom a été ajoutée.';
            } catch (PDOException $e) {
                if (strpos($e->getMessage(), 'UNIQUE') !== false) {
                    throw new InvalidArgumentException('Ce nom existe déjà. Vous pouvez voter pour la proposition existante.');
                }
                throw $e;
            }
        } elseif ($action === 'vote_name') {
            $proposalId = isset($_POST['proposal_id'])
                ? (string) $_POST['proposal_id']
                : '';

            $check = $db->prepare(
                "SELECT id FROM project_name_proposals
                 WHERE id = :id AND status = 'open'"
            );
            $check->execute(array(':id' => $proposalId));

            if (!$check->fetch()) {
                throw new InvalidArgumentException('Cette proposition n’est plus disponible au vote.');
            }

            $vote = $db->prepare(
                'INSERT INTO project_name_votes
                    (voter_token, proposal_id, created_at, updated_at)
                 VALUES (:token, :proposal_id, :created_at, :updated_at)
                 ON CONFLICT(voter_token) DO UPDATE SET
                    proposal_id = excluded.proposal_id,
                    updated_at = excluded.updated_at'
            );

            $now = gmdate('Y-m-d\TH:i:s\Z');
            $vote->execute(array(
                ':token' => $_SESSION['name_vote_token'],
                ':proposal_id' => $proposalId,
                ':created_at' => $now,
                ':updated_at' => $now
            ));

            $message = 'Votre vote a été enregistré. Vous pouvez le modifier à tout moment.';
        } else {
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
    }

    $proposals = $db->query(
        "SELECT p.id, p.name, p.description, p.submitted_at,
                COUNT(v.voter_token) AS vote_count
         FROM project_name_proposals p
         LEFT JOIN project_name_votes v ON v.proposal_id = p.id
         WHERE p.status = 'open'
         GROUP BY p.id, p.name, p.description, p.submitted_at
         ORDER BY vote_count DESC, p.name COLLATE NOCASE ASC"
    )->fetchAll();

    $myVoteQuery = $db->prepare(
        'SELECT proposal_id FROM project_name_votes WHERE voter_token = :token'
    );
    $myVoteQuery->execute(array(':token' => $_SESSION['name_vote_token']));
    $myVoteRow = $myVoteQuery->fetch();
    $myVote = $myVoteRow ? $myVoteRow['proposal_id'] : null;

    // Les sessions sont une fonction distincte : leur table peut ne pas
    // encore avoir été initialisée dans une base de démonstration neuve.
    try {
        $sessions = $db->query(
            "SELECT id, title, objective
             FROM sessions
             WHERE status = 'open'
             ORDER BY created_at DESC"
        )->fetchAll();
    } catch (PDOException $e) {
        $sessions = array();
    }

} catch (InvalidArgumentException $e) {
    $message = $e->getMessage();
} catch (Exception $e) {
    error_log('Prototype application error: ' . $e->getMessage());
    $message = 'Une erreur est survenue. Consultez le journal serveur.';
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Initiative ouverte — Choix collectif du nom</title>
    <link rel="stylesheet" href="assets/style.css">
</head>
<body>
<main class="container">
    <header>
        <p class="eyebrow">Projet collectif en construction</p>
        <h1>Quel nom pour notre projet ?</h1>
        <p>Le nom n’est pas décidé. Chacun peut proposer une idée et voter pour celle qu’il préfère.</p>
    </header>

    <?php if ($message !== ''): ?>
        <p class="notice" role="status"><?php echo app_escape($message); ?></p>
    <?php endif; ?>

    <section aria-labelledby="name-proposals-title">
        <h2 id="name-proposals-title">Propositions de noms</h2>
        <p class="intro">Toutes les propositions sont présentées sur un pied d’égalité. Le classement reflète les votes enregistrés, pas une décision définitive.</p>

        <?php if (count($proposals) === 0): ?>
            <p>Aucun nom proposé pour le moment. Soyez le premier à contribuer.</p>
        <?php else: ?>
            <div class="proposal-list">
            <?php foreach ($proposals as $proposal): ?>
                <article class="proposal">
                    <div class="proposal-heading">
                        <h3><?php echo app_escape($proposal['name']); ?></h3>
                        <span class="vote-count">
                            <?php echo (int) $proposal['vote_count']; ?>
                            vote<?php echo ((int) $proposal['vote_count'] > 1) ? 's' : ''; ?>
                        </span>
                    </div>

                    <?php if ($proposal['description'] !== ''): ?>
                        <p><?php echo nl2br(app_escape($proposal['description'])); ?></p>
                    <?php endif; ?>

                    <form method="post" class="vote-form">
                        <input type="hidden" name="csrf_token"
                            value="<?php echo app_escape($_SESSION['csrf_token']); ?>">
                        <input type="hidden" name="action" value="vote_name">
                        <input type="hidden" name="proposal_id"
                            value="<?php echo app_escape($proposal['id']); ?>">
                        <button type="submit">
                            <?php echo ($myVote === $proposal['id']) ? 'Mon choix actuel' : 'Voter pour ce nom'; ?>
                        </button>
                    </form>
                </article>
            <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </section>

    <section class="proposal-form-section" aria-labelledby="new-name-title">
        <h2 id="new-name-title">Proposer un autre nom</h2>
        <p>Une idée originale est bienvenue, même si elle ne figure pas encore dans la liste.</p>

        <form method="post">
            <input type="hidden" name="csrf_token"
                value="<?php echo app_escape($_SESSION['csrf_token']); ?>">
            <input type="hidden" name="action" value="propose_name">

            <label for="name">Nom proposé</label>
            <input id="name" name="name" type="text" maxlength="80" required>

            <label for="description">Pourquoi ce nom ? (facultatif)</label>
            <textarea id="description" name="description" maxlength="1000" rows="3"></textarea>

            <button type="submit">Ajouter ma proposition</button>
        </form>
    </section>

    <aside class="voting-note">
        <h2>Comment interpréter le vote ?</h2>
        <ul>
            <li>Chaque session de navigateur dispose d’un vote, modifiable.</li>
            <li>Le mécanisme actuel est indicatif : il ne vérifie pas l’identité des votants et ne bloque pas les votes multiples par une même personne utilisant plusieurs navigateurs.</li>
            <li>Le résultat sera un élément de la réflexion collective, pas une décision automatique.</li>
            <li>Le nom final, s’il est choisi, devra aussi faire l’objet de vérifications de disponibilité, de marque et de nom de domaine.</li>
        </ul>
    </aside>

    <section aria-labelledby="sessions-title">
        <h2 id="sessions-title">Sessions de travail</h2>

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
        <p>Prototype de travail — aucune connexion à un service d’IA n’est active.</p>
    </footer>
</main>
</body>
</html>
