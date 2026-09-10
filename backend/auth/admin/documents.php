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

function documentJson(bool $success, string $message, array $data = [], int $status = 200): void
{
    http_response_code($status);
    echo json_encode(array_merge([
        'success' => $success,
        'message' => $message,
    ], $data), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function checkDocumentAdmin(PDO $pdo, int $id): void
{
    $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ? AND role = 'admin' AND statut = 'actif' LIMIT 1");
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        documentJson(false, 'Accès administrateur refusé.', [], 403);
    }
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $adminId = (int)($_GET['user_id'] ?? 0);
        checkDocumentAdmin($pdo, $adminId);

        $search = trim((string)($_GET['search'] ?? ''));
        $statut = trim((string)($_GET['statut'] ?? ''));

        $sql = "
            SELECT
                d.id,
                d.user_id,
                d.project_id,
                d.request_id,
                d.titre,
                d.type_document,
                d.fichier,
                d.nom_original,
                d.extension,
                d.taille,
                d.statut,
                d.commentaire,
                d.uploaded_at,
                u.nom,
                u.prenom,
                u.email,
                p.titre AS titre_projet,
                r.objet AS objet_demande
            FROM documents d
            INNER JOIN users u ON u.id = d.user_id
            LEFT JOIN projects p ON p.id = d.project_id
            LEFT JOIN investment_requests r ON r.id = d.request_id
            WHERE 1 = 1
        ";
        $params = [];

        if ($search !== '') {
            $sql .= " AND (d.titre LIKE ? OR d.nom_original LIKE ? OR d.type_document LIKE ? OR u.nom LIKE ? OR u.prenom LIKE ? OR u.email LIKE ? OR p.titre LIKE ?)";
            $v = '%'.$search.'%';
            $params = [$v, $v, $v, $v, $v, $v, $v];
        }

        if (in_array($statut, ['en_attente', 'valide', 'rejete'], true)) {
            $sql .= ' AND d.statut = ?';
            $params[] = $statut;
        }

        $sql .= ' ORDER BY d.uploaded_at DESC';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $documents = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $statsStmt = $pdo->query("SELECT COUNT(*) total, COALESCE(SUM(statut = 'en_attente'),0) en_attente, COALESCE(SUM(statut = 'valide'),0) valide, COALESCE(SUM(statut = 'rejete'),0) rejete FROM documents");
        $stats = $statsStmt->fetch(PDO::FETCH_ASSOC) ?: [];

        documentJson(true, 'Documents chargés avec succès.', [
            'documents' => $documents,
            'stats' => [
                'total' => (int)($stats['total'] ?? 0),
                'en_attente' => (int)($stats['en_attente'] ?? 0),
                'valide' => (int)($stats['valide'] ?? 0),
                'rejete' => (int)($stats['rejete'] ?? 0),
            ],
        ]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $body = json_decode(file_get_contents('php://input') ?: '{}', true);
        if (!is_array($body)) {
            documentJson(false, 'Données invalides.', [], 400);
        }

        $adminId = (int)($body['user_id'] ?? 0);
        checkDocumentAdmin($pdo, $adminId);
        $documentId = (int)($body['document_id'] ?? 0);
        $status = (string)($body['statut'] ?? '');

        if ($documentId <= 0 || !in_array($status, ['en_attente', 'valide', 'rejete'], true)) {
            documentJson(false, 'Document ou statut invalide.', [], 400);
        }

        $stmt = $pdo->prepare('UPDATE documents SET statut = ?, commentaire = ? WHERE id = ?');
        $stmt->execute([$status, $body['commentaire'] ?? null, $documentId]);

        documentJson(true, 'Statut du document mis à jour.');
    }

    documentJson(false, 'Méthode non autorisée.', [], 405);
} catch (Throwable $e) {
    documentJson(false, 'Erreur serveur: '.$e->getMessage(), [], 500);
}
