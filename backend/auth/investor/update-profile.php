<?php
header('Content-Type: application/json; charset=UTF-8');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5176',
    'http://127.0.0.1:5176',
];
if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'طريقة الطلب غير مسموحة.'], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once __DIR__ . '/../../config/db.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'بيانات الطلب غير صالحة.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$userId = (int)($input['user_id'] ?? 0);
$email = trim((string)($input['email'] ?? ''));
$telephone = trim((string)($input['telephone'] ?? ''));
$photo = trim((string)($input['photo'] ?? ''));

if ($userId <= 0 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'البريد الإلكتروني أو معرف المستثمر غير صالح.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, nom, prenom, email, telephone, role, statut, photo, last_login, created_at, updated_at FROM users WHERE id = ? AND role = 'investisseur' LIMIT 1");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || $user['statut'] !== 'actif') {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'حساب المستثمر غير متاح.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $emailStmt = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1');
    $emailStmt->execute([$email, $userId]);
    if ($emailStmt->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'البريد الإلكتروني مستخدم من طرف حساب آخر.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $storedPhoto = $user['photo'];
    if ($photo !== '') {
        if (!preg_match('#^data:image/(jpeg|png|webp);base64,#i', $photo)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'صيغة الصورة غير صالحة.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $storedPhoto = $photo;
    }

    $update = $pdo->prepare('UPDATE users SET email = ?, telephone = ?, photo = ?, updated_at = NOW() WHERE id = ?');
    $update->execute([$email, $telephone, $storedPhoto, $userId]);

    $user['email'] = $email;
    $user['telephone'] = $telephone;
    $user['photo'] = $storedPhoto;
    $user['updated_at'] = date('Y-m-d H:i:s');

    echo json_encode([
        'success' => true,
        'message' => 'تم تحديث الملف الشخصي بنجاح.',
        'user' => $user,
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'خطأ في الخادم.'], JSON_UNESCAPED_UNICODE);
}
