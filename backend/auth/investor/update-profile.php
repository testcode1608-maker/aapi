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
    echo json_encode([
        'success' => false,
        'message' => 'طريقة الطلب غير مسموحة.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once __DIR__ . '/../../config/db.php';

$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'بيانات الطلب غير صالحة.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$userId = (int)($input['user_id'] ?? 0);
$email = trim((string)($input['email'] ?? ''));
$telephone = trim((string)($input['telephone'] ?? ''));
$photo = trim((string)($input['photo'] ?? ''));

if ($userId <= 0 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'البريد الإلكتروني أو معرف المستثمر غير صالح.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {

    /*
     * ---------------------------------------------------------
     * 1. Get investor
     * ---------------------------------------------------------
     */

    $stmt = $pdo->prepare("
        SELECT
            id,
            nom,
            prenom,
            email,
            telephone,
            role,
            statut,
            photo,
            last_login,
            created_at,
            updated_at
        FROM users
        WHERE id = ?
          AND role = 'investisseur'
        LIMIT 1
    ");

    $stmt->execute([$userId]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || $user['statut'] !== 'actif') {
        http_response_code(403);

        echo json_encode([
            'success' => false,
            'message' => 'حساب المستثمر غير متاح.'
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    /*
     * ---------------------------------------------------------
     * 2. Check email
     * ---------------------------------------------------------
     */

    $emailStmt = $pdo->prepare("
        SELECT id
        FROM users
        WHERE email = ?
          AND id <> ?
        LIMIT 1
    ");

    $emailStmt->execute([
        $email,
        $userId
    ]);

    if ($emailStmt->fetch()) {
        http_response_code(409);

        echo json_encode([
            'success' => false,
            'message' => 'البريد الإلكتروني مستخدم من طرف حساب آخر.'
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    /*
     * ---------------------------------------------------------
     * 3. Keep existing photo
     * ---------------------------------------------------------
     */

    $storedPhoto = trim((string)($user['photo'] ?? ''));

    /*
     * ---------------------------------------------------------
     * 4. Save new photo
     * ---------------------------------------------------------
     */

    if ($photo !== '') {

        if (!preg_match(
            '#^data:image/(jpeg|png|webp);base64,#i',
            $photo,
            $matches
        )) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'صيغة الصورة غير صالحة.'
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }

        $mimeType = strtolower($matches[1]);

        switch ($mimeType) {
            case 'jpeg':
                $extension = 'jpg';
                break;

            case 'png':
                $extension = 'png';
                break;

            case 'webp':
                $extension = 'webp';
                break;

            default:
                http_response_code(400);

                echo json_encode([
                    'success' => false,
                    'message' => 'صيغة الصورة غير مدعومة.'
                ], JSON_UNESCAPED_UNICODE);

                exit;
        }

        /*
         * Remove Base64 header
         */

        $base64 = preg_replace(
            '#^data:image/(jpeg|png|webp);base64,#i',
            '',
            $photo
        );

        /*
         * Decode image
         */

        $binary = base64_decode($base64, true);

        if ($binary === false) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'تعذر قراءة الصورة.'
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }

        /*
         * Maximum 5 MB
         */

        if (strlen($binary) > 5 * 1024 * 1024) {
            http_response_code(413);

            echo json_encode([
                'success' => false,
                'message' => 'حجم الصورة يجب ألا يتجاوز 5 ميغابايت.'
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }

        /*
         * Validate real image
         */

        $imageInfo = @getimagesizefromstring($binary);

        if ($imageInfo === false) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'الملف المرسل ليس صورة صالحة.'
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }

        $allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (
            !isset($imageInfo['mime']) ||
            !in_array(
                strtolower($imageInfo['mime']),
                $allowedMimeTypes,
                true
            )
        ) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'يسمح فقط بصور JPG أو PNG أو WEBP.'
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }

        /*
         * -----------------------------------------------------
         * 5. Create uploads/profiles
         * -----------------------------------------------------
         */

        $apiRoot = dirname(__DIR__, 3);

        $uploadDir = $apiRoot . '/uploads/profiles';

        if (!is_dir($uploadDir)) {

            if (!mkdir($uploadDir, 0755, true)) {

                http_response_code(500);

                echo json_encode([
                    'success' => false,
                    'message' => 'تعذر إنشاء مجلد الصور.'
                ], JSON_UNESCAPED_UNICODE);

                exit;
            }
        }

        /*
         * -----------------------------------------------------
         * 6. Generate safe filename
         * -----------------------------------------------------
         */

        $fileName =
            'investor_' .
            $userId .
            '_' .
            time() .
            '_' .
            bin2hex(random_bytes(6)) .
            '.' .
            $extension;

        $filePath = $uploadDir . '/' . $fileName;

        /*
         * -----------------------------------------------------
         * 7. Save physical file
         * -----------------------------------------------------
         */

        if (file_put_contents($filePath, $binary) === false) {

            http_response_code(500);

            echo json_encode([
                'success' => false,
                'message' => 'تعذر حفظ صورة الملف الشخصي.'
            ], JSON_UNESCAPED_UNICODE);

            exit;
        }

        /*
         * -----------------------------------------------------
         * 8. Store ONLY relative path in database
         * -----------------------------------------------------
         */

        $storedPhoto =
            'uploads/profiles/' .
            $fileName;

        /*
         * -----------------------------------------------------
         * 9. Delete old uploaded profile photo
         * -----------------------------------------------------
         */

        $oldPhoto = trim((string)($user['photo'] ?? ''));

        if (
            $oldPhoto !== '' &&
            preg_match(
                '#^uploads/profiles/[^/]+$#',
                $oldPhoto
            )
        ) {

            $oldPath =
                $apiRoot .
                '/' .
                $oldPhoto;

            if (is_file($oldPath)) {
                @unlink($oldPath);
            }
        }
    }

    /*
     * ---------------------------------------------------------
     * 10. Update database
     * ---------------------------------------------------------
     */

    $update = $pdo->prepare("
        UPDATE users
        SET
            email = ?,
            telephone = ?,
            photo = ?,
            updated_at = NOW()
        WHERE id = ?
    ");

    $update->execute([
        $email,
        $telephone,
        $storedPhoto,
        $userId
    ]);

    /*
     * ---------------------------------------------------------
     * 11. Return updated user
     * ---------------------------------------------------------
     */

    $user['email'] = $email;
    $user['telephone'] = $telephone;
    $user['photo'] = $storedPhoto;
    $user['updated_at'] = date('Y-m-d H:i:s');

    echo json_encode([
        'success' => true,
        'message' => 'تم تحديث الملف الشخصي بنجاح.',
        'user' => $user
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'خطأ في الخادم.'
    ], JSON_UNESCAPED_UNICODE);
}