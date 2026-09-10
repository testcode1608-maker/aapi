<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');

$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5176',
    'http://127.0.0.1:5176',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: '.$origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__.'/../../config/db.php';

function messageJson(bool $success, string $message, array $data = [], int $status = 200): void
{
    http_response_code($status);
    echo json_encode(array_merge([
        'success' => $success,
        'message' => $message,
    ], $data), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function checkMessageAdmin(PDO $pdo, int $id): void
{
    $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ? AND role = 'admin' AND statut = 'actif' LIMIT 1");
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        messageJson(false, 'Accès administrateur refusé.', [], 403);
    }
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $adminId = (int)($_GET['user_id'] ?? 0);
        checkMessageAdmin($pdo, $adminId);

        $search = trim((string)($_GET['search'] ?? ''));
        $lu = (string)($_GET['lu'] ?? '');

        $sql = "
            SELECT
                m.id,
                m.sender_id,
                m.receiver_id,
                m.sujet,
                m.contenu,
                m.lu,
                m.date_lecture,
                m.created_at,
                s.nom AS sender_nom,
                s.prenom AS sender_prenom,
                s.email AS sender_email,
                r.nom AS receiver_nom,
                r.prenom AS receiver_prenom,
                r.email AS receiver_email
            FROM messages m
            LEFT JOIN users s ON s.id = m.sender_id
            LEFT JOIN users r ON r.id = m.receiver_id
            WHERE 1 = 1
        ";
        $params = [];

        if ($search !== '') {
            $sql .= " AND (m.sujet LIKE ? OR m.contenu LIKE ? OR s.nom LIKE ? OR s.prenom LIKE ? OR s.email LIKE ?)";
            $v = '%'.$search.'%';
            $params = [$v, $v, $v, $v, $v];
        }

        if ($lu === '0' || $lu === '1') {
            $sql .= ' AND m.lu = ?';
            $params[] = (int)$lu;
        }

        $sql .= ' ORDER BY m.created_at DESC';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $statsStmt = $pdo->query("SELECT COUNT(*) total, COALESCE(SUM(lu = 0),0) unread, COALESCE(SUM(lu = 1),0) read_count FROM messages");
        $stats = $statsStmt->fetch(PDO::FETCH_ASSOC) ?: [];

        messageJson(true, 'Messages chargés avec succès.', [
            'messages' => $messages,
            'stats' => [
                'total' => (int)($stats['total'] ?? 0),
                'unread' => (int)($stats['unread'] ?? 0),
                'read' => (int)($stats['read_count'] ?? 0),
            ],
        ]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $body = json_decode(file_get_contents('php://input') ?: '{}', true);
        if (!is_array($body)) {
            messageJson(false, 'Données invalides.', [], 400);
        }

        $adminId = (int)($body['user_id'] ?? 0);
        checkMessageAdmin($pdo, $adminId);
        $messageId = (int)($body['message_id'] ?? 0);
        $action = (string)($body['action'] ?? '');

        if ($messageId <= 0 || !in_array($action, ['mark_message_read', 'mark_message_unread'], true)) {
            messageJson(false, 'Action ou message invalide.', [], 400);
        }

        $read = $action === 'mark_message_read' ? 1 : 0;
        $stmt = $pdo->prepare('UPDATE messages SET lu = ?, date_lecture = ? WHERE id = ?');
        $stmt->execute([$read, $read ? date('Y-m-d H:i:s') : null, $messageId]);

        messageJson(true, 'Statut du message mis à jour.');
    }

    messageJson(false, 'Méthode non autorisée.', [], 405);
} catch (Throwable $e) {
    messageJson(false, 'Erreur serveur: '.$e->getMessage(), [], 500);
}
