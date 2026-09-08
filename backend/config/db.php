<?php

/**
 * ============================================================
 * AAPI API — CONNEXION MYSQL
 * ============================================================
 */

header("Content-Type: application/json; charset=UTF-8");

$host = "localhost";
$dbname = "aapi_db";
$username = "root";
$password = "";

try {
    $pdo = new PDO(
        "mysql:host={$host};dbname={$dbname};charset=utf8mb4",
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