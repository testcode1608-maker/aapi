<?php
/**
 * AAPI API — CONNEXION POSTGRESQL
 */

header("Content-Type: application/json; charset=UTF-8");

$host = getenv("DB_HOST") ?: "db";
$port = getenv("DB_PORT") ?: "5432";
$dbname = getenv("DB_NAME") ?: "aapi_db";
$username = getenv("DB_USER") ?: "aapi";
$password = getenv("DB_PASSWORD") ?: "";

try {
    $pdo = new PDO(
        "pgsql:host={$host};port={$port};dbname={$dbname}",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Erreur de connexion à la base de données.",
        "error" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
