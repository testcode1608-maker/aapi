<?php
/**
 * AAPI API — CREATE INVESTMENT
 * POST http://localhost/aapi-api/auth/investor/create-investment.php
 *
 * Body:
 * {
 *   "user_id": 2,
 *   "project_id": 10,
 *   "montant": 5000000,
 *   "date_investissement": "2026-09-11",
 *   "notes": "..."
 * }
 */

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
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    echo json_encode(["success" => true, "message" => "CORS OK"], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "طريقة الطلب غير مسموحة."], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once __DIR__ . "/../../config/db.php";

$input = json_decode(file_get_contents("php://input"), true);
if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "بيانات الطلب غير صالحة."], JSON_UNESCAPED_UNICODE);
    exit;
}

$userId = (int)($input["user_id"] ?? 0);
$projectId = (int)($input["project_id"] ?? 0);
$amount = (float)($input["montant"] ?? 0);
$date = trim((string)($input["date_investissement"] ?? ""));
$notes = trim((string)($input["notes"] ?? ""));

if ($userId <= 0 || $projectId <= 0 || $amount <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "اختر المشروع وأدخل مبلغ استثمار صحيح."
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($date === "") {
    $date = date("Y-m-d");
} elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "تاريخ الاستثمار غير صالح."], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $userStmt = $pdo->prepare("SELECT id FROM users WHERE id = ? AND role = 'investisseur' AND statut = 'actif' LIMIT 1");
    $userStmt->execute([$userId]);
    if (!$userStmt->fetch(PDO::FETCH_ASSOC)) {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "حساب المستثمر غير صالح."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // The investor can only invest in one of their own approved/active projects.
    $projectStmt = $pdo->prepare("\n        SELECT id, titre, statut, montant_investissement\n        FROM projects\n        WHERE id = ? AND user_id = ?\n          AND statut IN ('approuve', 'en_cours')\n        LIMIT 1\n    ");
    $projectStmt->execute([$projectId, $userId]);
    $project = $projectStmt->fetch(PDO::FETCH_ASSOC);

    if (!$project) {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "يمكنك إضافة استثمار فقط إلى مشروعك المعتمد أو قيد الإنجاز."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $pdo->beginTransaction();

    $reference = "INV-" . date("Ymd") . "-" . strtoupper(bin2hex(random_bytes(4)));

    $insert = $pdo->prepare("\n        INSERT INTO investments\n            (user_id, project_id, montant, date_investissement, statut, reference, notes)\n        VALUES\n            (?, ?, ?, ?, 'en_attente', ?, ?)\n    ");
    $insert->execute([$userId, $projectId, $amount, $date, $reference, $notes !== "" ? $notes : null]);

    $investmentId = (int)$pdo->lastInsertId();

    $notification = $pdo->prepare("\n        INSERT INTO notifications\n            (user_id, titre, message, type, lien, lu)\n        VALUES\n            (?, ?, ?, 'info', ?, 0)\n    ");
    $notification->execute([
        $userId,
        "طلب استثمار جديد",
        "تم تسجيل طلب استثمارك في مشروع: " . $project["titre"] . " وهو الآن قيد الانتظار.",
        "/investor/dashboard/investments"
    ]);

    $pdo->commit();

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "تمت إضافة الاستثمار بنجاح، وهو الآن قيد الانتظار للمراجعة.",
        "investment" => [
            "id" => $investmentId,
            "user_id" => $userId,
            "project_id" => $projectId,
            "montant" => $amount,
            "date_investissement" => $date,
            "statut" => "en_attente",
            "reference" => $reference,
            "notes" => $notes !== "" ? $notes : null,
            "projet_titre" => $project["titre"],
            "projet_statut" => $project["statut"],
            "projet_montant" => (float)$project["montant_investissement"],
        ]
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "تعذر تسجيل الاستثمار."
    ], JSON_UNESCAPED_UNICODE);
}
