<?php
/**
 * AAPI - Public statistics endpoint
 *
 * Backend endpoint used by the Home page statistics cards.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$dbHost = getenv('AAPI_DB_HOST') ?: '127.0.0.1';
$dbName = getenv('AAPI_DB_NAME') ?: 'aapi_db';
$dbUser = getenv('AAPI_DB_USER') ?: 'root';
$dbPass = getenv('AAPI_DB_PASS') ?: '';
$dbCharset = 'utf8mb4';

try {
    $pdo = new PDO(
        "mysql:host={$dbHost};dbname={$dbName};charset={$dbCharset}",
        $dbUser,
        $dbPass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );

    $projects = (int) $pdo->query(
        "SELECT COUNT(*) FROM projects"
    )->fetchColumn();

    $investors = (int) $pdo->query(
        "SELECT COUNT(*) FROM users WHERE role = 'investisseur' AND statut = 'actif'"
    )->fetchColumn();

    $investmentValue = (float) $pdo->query(
        "SELECT COALESCE(SUM(montant_investissement), 0)
         FROM projects
         WHERE statut <> 'archive'"
    )->fetchColumn();

    $jobs = (int) $pdo->query(
        "SELECT COALESCE(SUM(nombre_emplois), 0)
         FROM projects
         WHERE statut <> 'archive'"
    )->fetchColumn();

    echo json_encode([
        'success' => true,
        'data' => [
            'projects' => $projects,
            'investors' => $investors,
            'investment_value' => $investmentValue,
            'jobs' => $jobs,
        ],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
    http_response_code(500);
    error_log('AAPI statistics error: ' . $e->getMessage());

    echo json_encode([
        'success' => false,
        'message' => 'Unable to load AAPI statistics.',
    ], JSON_UNESCAPED_UNICODE);
}
