<?php
declare(strict_types=1);

require_once __DIR__ . "/../../config/db.php";

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
    exit;
}

function deleteJson(bool $success, string $message, array $data = [], int $status = 200): never
{
    http_response_code($status);
    echo json_encode(
        array_merge(["success" => $success, "message" => $message], $data),
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );
    exit;
}

function requireAdmin(PDO $pdo, int $adminId): void
{
    if ($adminId <= 0) {
        deleteJson(false, "معرف المسؤول غير صالح.", [], 400);
    }

    $stmt = $pdo->prepare("
        SELECT id, role, statut
        FROM users
        WHERE id = ?
        LIMIT 1
    ");
    $stmt->execute([$adminId]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$admin || strtolower((string)$admin["role"]) !== "admin") {
        deleteJson(false, "الوصول مرفوض. هذا الحساب ليس حساب مسؤول.", [], 403);
    }

    if (strtolower((string)$admin["statut"]) !== "actif") {
        deleteJson(false, "حساب المسؤول غير نشط.", [], 403);
    }
}

try {
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        deleteJson(false, "طريقة الطلب غير مسموحة.", [], 405);
    }

    $body = json_decode(file_get_contents("php://input") ?: "{}", true);
    if (!is_array($body)) {
        deleteJson(false, "بيانات الطلب غير صالحة.", [], 400);
    }

    $adminId = (int)($body["user_id"] ?? 0);
    $action = trim((string)($body["action"] ?? ""));
    $recordId = (int)($body["record_id"] ?? 0);

    requireAdmin($pdo, $adminId);

    if ($recordId <= 0) {
        deleteJson(false, "معرف السجل غير صالح.", [], 400);
    }

    $allowedActions = [
        "delete_users",
        "delete_investors",
        "delete_projects",
        "delete_investments",
        "delete_requests",
        "delete_messages",
        "delete_documents",
        "delete_sectors",
        "delete_opportunities",
        "delete_announcements",
        "delete_news",
        "delete_faqs",
    ];

    if (!in_array($action, $allowedActions, true)) {
        deleteJson(false, "عملية الحذف غير مدعومة.", [], 400);
    }

    if (($action === "delete_users" || $action === "delete_investors") && $recordId === $adminId) {
        deleteJson(false, "لا يمكنك حذف حساب المسؤول الذي تستخدمه حالياً.", [], 403);
    }

    if ($action === "delete_users") {
        $check = $pdo->prepare("SELECT id, role FROM users WHERE id = ? LIMIT 1");
        $check->execute([$recordId]);
        $target = $check->fetch(PDO::FETCH_ASSOC);

        if (!$target) {
            deleteJson(false, "المستخدم غير موجود.", [], 404);
        }

        if (strtolower((string)$target["role"]) === "admin") {
            deleteJson(false, "لا يمكن حذف حساب مسؤول.", [], 403);
        }

        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$recordId]);
    } elseif ($action === "delete_investors") {
        $check = $pdo->prepare("
            SELECT id, role
            FROM users
            WHERE id = ?
            LIMIT 1
        ");
        $check->execute([$recordId]);
        $target = $check->fetch(PDO::FETCH_ASSOC);

        if (!$target) {
            deleteJson(false, "المستثمر غير موجود.", [], 404);
        }

        if (strtolower((string)$target["role"]) !== "investisseur") {
            deleteJson(false, "يمكن حذف المستثمرين فقط من هذه الصفحة.", [], 403);
        }

        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$recordId]);
    } else {
        $tables = [
            "delete_projects" => "projects",
            "delete_investments" => "investments",
            "delete_requests" => "investment_requests",
            "delete_messages" => "messages",
            "delete_documents" => "documents",
            "delete_sectors" => "sectors",
            "delete_opportunities" => "opportunities",
            "delete_announcements" => "announcements",
            "delete_news" => "news",
            "delete_faqs" => "investor_faq",
        ];

        $table = $tables[$action];

        $check = $pdo->prepare("SELECT id FROM {$table} WHERE id = ? LIMIT 1");
        $check->execute([$recordId]);

        if (!$check->fetch(PDO::FETCH_ASSOC)) {
            deleteJson(false, "السجل غير موجود.", [], 404);
        }

        $stmt = $pdo->prepare("DELETE FROM {$table} WHERE id = ? LIMIT 1");
        $stmt->execute([$recordId]);

        if ($action === "delete_opportunities") {
            $dir = __DIR__ . "/../../uploads/opportunities";
            foreach (["jpg", "png", "webp", "gif"] as $ext) {
                $imageFile = $dir . "/opportunity_" . $recordId . "." . $ext;
                if (is_file($imageFile)) @unlink($imageFile);
            }
        }
        if ($action === "delete_sectors") {
            $dir = __DIR__ . "/../../uploads/sectors";
            foreach (["jpg", "png", "webp", "gif"] as $ext) {
                $imageFile = $dir . "/sector_" . $recordId . "." . $ext;
                if (is_file($imageFile)) {
                    @unlink($imageFile);
                }
            }
        }
    }

    deleteJson(true, "تم حذف السجل بنجاح.", [
        "deleted_id" => $recordId,
        "action" => $action,
    ]);
} catch (PDOException $e) {
    error_log("AAPI ADMIN DELETE PDO ERROR: " . $e->getMessage());
    deleteJson(false, "تعذر حذف السجل بسبب ارتباطه ببيانات أخرى.", [], 409);
} catch (Throwable $e) {
    error_log("AAPI ADMIN DELETE ERROR: " . $e->getMessage());
    deleteJson(false, "حدث خطأ داخلي أثناء الحذف.", [], 500);
}
