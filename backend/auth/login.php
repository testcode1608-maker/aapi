<?php

/**
 * ============================================================
 * AAPI API — LOGIN INVESTISSEUR
 * ============================================================
 */

/* ============================================================
   CORS — يجب أن يكون قبل أي شيء آخر
   ============================================================ */

$origin = $_SERVER["HTTP_ORIGIN"] ?? "";

if (
    preg_match(
        '/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/',
        $origin
    )
) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Vary: Origin");
}

header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

/* ============================================================
   OPTIONS — PREFLIGHT
   ============================================================ */

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {

    http_response_code(200);

    echo json_encode([
        "success" => true
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

/* ============================================================
   DATABASE
   ============================================================ */

require_once __DIR__ . "/../config/db.php";

/* ============================================================
   METHOD
   ============================================================ */

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "طريقة الطلب غير مسموحة."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

/* ============================================================
   READ JSON
   ============================================================ */

$rawData = file_get_contents("php://input");

$data = json_decode($rawData, true);

if (!is_array($data)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "بيانات الطلب غير صحيحة."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

/* ============================================================
   DATA
   ============================================================ */

$email = trim($data["email"] ?? "");
$password = $data["password"] ?? "";

/* ============================================================
   VALIDATION
   ============================================================ */

if ($email === "" || $password === "") {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "يرجى إدخال البريد الإلكتروني وكلمة المرور."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "البريد الإلكتروني غير صحيح."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

/* ============================================================
   LOGIN
   ============================================================ */

try {

    $stmt = $pdo->prepare("
        SELECT
            id,
            nom,
            prenom,
            email,
            password,
            telephone,
            role,
            statut,
            photo
        FROM users
        WHERE email = ?
        LIMIT 1
    ");

    $stmt->execute([
        $email
    ]);

    $user = $stmt->fetch();

    /* --------------------------------------------------------
       USER NOT FOUND
       -------------------------------------------------------- */

    if (!$user) {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "البريد الإلكتروني أو كلمة المرور غير صحيحة."
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    /* --------------------------------------------------------
       ACCOUNT STATUS
       -------------------------------------------------------- */

    if ($user["statut"] !== "actif") {

        http_response_code(403);

        echo json_encode([
            "success" => false,
            "message" => "هذا الحساب غير مفعل."
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    /* --------------------------------------------------------
       PASSWORD
       -------------------------------------------------------- */

    if (!password_verify(
        $password,
        $user["password"]
    )) {

        http_response_code(401);

        echo json_encode([
            "success" => false,
            "message" => "البريد الإلكتروني أو كلمة المرور غير صحيحة."
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    /* --------------------------------------------------------
       LAST LOGIN
       -------------------------------------------------------- */

    $updateStmt = $pdo->prepare("
        UPDATE users
        SET last_login = NOW()
        WHERE id = ?
    ");

    $updateStmt->execute([
        $user["id"]
    ]);

    /* --------------------------------------------------------
       REMOVE PASSWORD
       -------------------------------------------------------- */

    unset($user["password"]);

    /* --------------------------------------------------------
       SUCCESS
       -------------------------------------------------------- */

    echo json_encode([
        "success" => true,
        "message" => "تم تسجيل الدخول بنجاح.",
        "user" => $user
    ], JSON_UNESCAPED_UNICODE);

    exit;

} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "حدث خطأ أثناء تسجيل الدخول.",
        "error" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);

    exit;
}