<?php
declare(strict_types=1);

require_once __DIR__ . "/config/db.php";

$id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;

if ($id <= 0) {
    http_response_code(400);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT image FROM announcements WHERE id = :id LIMIT 1");
    $stmt->execute(["id" => $id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row || empty($row["image"])) {
        http_response_code(404);
        exit;
    }

    $image = (string)$row["image"];
    $filename = basename(parse_url($image, PHP_URL_PATH) ?: $image);

    $file = __DIR__ . "/uploads/announcements/" . $filename;

    if (!is_file($file) || !is_readable($file)) {
        http_response_code(404);
        exit;
    }

    $mime = mime_content_type($file) ?: "application/octet-stream";
    header("Content-Type: " . $mime);
    header("Content-Length: " . (string)filesize($file));
    header("Cache-Control: public, max-age=86400");

    readfile($file);
} catch (Throwable $e) {
    error_log("AAPI ANNOUNCEMENT IMAGE ERROR: " . $e->getMessage());
    http_response_code(500);
}
