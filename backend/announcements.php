<?php
declare(strict_types=1);

require_once __DIR__ . "/config/db.php";

$origin = $_SERVER["HTTP_ORIGIN"] ?? "";
$allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5176",
    "http://127.0.0.1:5176",
];

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Vary: Origin");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Méthode non autorisée."
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

try {
    $id = isset($_GET["id"]) ? (int) $_GET["id"] : 0;

    if ($id > 0) {
        $stmt = $pdo->prepare("
            SELECT
                a.id,
                a.titre,
                a.slug,
                a.contenu,
                a.image,
                a.auteur_id,
                a.statut,
                a.date_publication,
                a.created_at,
                a.updated_at,
                CONCAT(COALESCE(u.prenom, ''), ' ', COALESCE(u.nom, '')) AS auteur
            FROM announcements a
            LEFT JOIN users u ON u.id = a.auteur_id
            WHERE a.id = :id
              AND a.statut = 'publie'
              AND (a.date_publication IS NULL OR a.date_publication <= NOW())
            LIMIT 1
        ");
        $stmt->execute(["id" => $id]);
        $announcement = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$announcement) {
            http_response_code(404);
            echo json_encode([
                "success" => false,
                "message" => "Annonce introuvable."
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            exit;
        }

        echo json_encode([
            "success" => true,
            "announcement" => $announcement,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    $stmt = $pdo->query("
        SELECT
            a.id,
            a.titre,
            a.slug,
            a.contenu,
            a.image,
            a.auteur_id,
            a.statut,
            a.date_publication,
            a.created_at,
            a.updated_at,
            CONCAT(COALESCE(u.prenom, ''), ' ', COALESCE(u.nom, '')) AS auteur
        FROM announcements a
        LEFT JOIN users u ON u.id = a.auteur_id
        WHERE a.statut = 'publie'
          AND (a.date_publication IS NULL OR a.date_publication <= NOW())
        ORDER BY COALESCE(a.date_publication, a.created_at) DESC, a.id DESC
    ");

    $announcements = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "announcements" => $announcements,
        "total" => count($announcements),
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (PDOException $e) {
    error_log("AAPI ANNOUNCEMENTS API ERROR: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Impossible de charger les annonces."
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}
