<?php
/**
 * AAPI — ADMIN UNIFIED API
 *
 * Endpoint unique pour l'administration.
 * GET :  admin.php?action=dashboard|users|investors|projects|investments|requests&user_id=1
 * POST: les mêmes actions d'administration sont transmis aux handlers existants.
 */
declare(strict_types=1);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
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
    'update_project_status' => __DIR__.'/dashboard.php',
    'update_user_status' => __DIR__.'/users.php',
    'update_investor_status' => __DIR__.'/investors.php',
    'update_investment_status' => __DIR__.'/investments.php',
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

/*
 * Les anciens handlers restent la source de vérité pour la logique SQL.
 * Ce fichier fournit une seule URL publique à React, sans dupliquer
 * ni risquer de casser le code PHP déjà testé.
 */
require $handlers[$action];
