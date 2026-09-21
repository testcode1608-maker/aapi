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
    $stmt = $pdo->query("
        SELECT
            id,
            nom,
            slug,
            description,
            icone,
            statut
        FROM sectors
        WHERE statut = 'actif'
        ORDER BY id ASC
    ");

    $sectors = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($sectors as &$sector) {
        $sector["image_url"] = "http://localhost/aapi-api/sector-image.php?id=" . (int)$sector["id"];
    }
    unset($sector);

    echo json_encode([
        "success" => true,
        "sectors" => $sectors,
        "total" => count($sectors),
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (PDOException $e) {
    error_log("AAPI SECTORS API ERROR: " . $e->getMessage());

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Impossible de charger les secteurs."
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}
