<?php
/**
 * AAPI — ADMIN UNIFIED API
 *
 * Endpoint unique pour toute l'administration.
 */
declare(strict_types=1);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5176',
    'http://127.0.0.1:5176',
];
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: '.$origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['success'=>true,'message'=>'CORS OK'], JSON_UNESCAPED_UNICODE);
    exit;
}

$action = trim((string)($_GET['action'] ?? ''));
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw ?: '{}', true);
    if (is_array($body) && isset($body['action'])) {
        $action = trim((string)$body['action']);
    }
}

$handlers = [
    'dashboard' => __DIR__.'/dashboard.php',
    'users' => __DIR__.'/users.php',
    'investors' => __DIR__.'/investors.php',
    'projects' => __DIR__.'/projects.php',
    'investments' => __DIR__.'/investments.php',
    'requests' => __DIR__.'/requests.php',
    'messages' => __DIR__.'/messages.php',
    'documents' => __DIR__.'/documents.php',
    'update_project_status' => __DIR__.'/dashboard.php',
    'update_user_status' => __DIR__.'/users.php',
    'update_investor_status' => __DIR__.'/investors.php',
    'update_investment_status' => __DIR__.'/investments.php',
    'update_request_status' => __DIR__.'/requests.php',
    'mark_message_read' => __DIR__.'/messages.php',
    'mark_message_unread' => __DIR__.'/messages.php',
    'update_document_status' => __DIR__.'/documents.php',
];

if (!isset($handlers[$action])) {
    http_response_code(400);
    echo json_encode([
        'success'=>false,
        'message'=>'Action administration inconnue.',
        'actions'=>array_keys($handlers)
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

require $handlers[$action];
