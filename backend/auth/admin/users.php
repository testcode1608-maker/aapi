<?php

/**
 * ============================================================
 * AAPI API — ADMIN USERS
 * ============================================================
 *
 * GET:
 *   ?user_id=6
 *
 * Filtres:
 *   ?user_id=6&search=ahmed
 *   ?user_id=6&role=investisseur
 *   ?user_id=6&statut=actif
 *
 * POST:
 *   action=update_user_status
 *
 * Body JSON:
 * {
 *   "user_id": 6,
 *   "target_user_id": 12,
 *   "statut": "suspendu"
 * }
 *
 * ============================================================
 */

declare(strict_types=1);

/* ============================================================
   CORS
   ============================================================ */

$origin = $_SERVER["HTTP_ORIGIN"] ?? "";

$allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5176",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5176",
];

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: " . $origin);
} else {
    header("Access-Control-Allow-Origin: http://localhost:5173");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

/* ============================================================
   DB
   ============================================================ */

require_once __DIR__ . "/../../config/db.php";

/* ============================================================
   JSON RESPONSE
   ============================================================ */

function responseJson(
    bool $success,
    string $message,
    array $data = [],
    int $statusCode = 200
): never {
    http_response_code($statusCode);

    echo json_encode(
        array_merge(
            [
                "success" => $success,
                "message" => $message,
            ],
            $data
        ),
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    );

    exit;
}

/* ============================================================
   VERIFY ADMIN
   ============================================================ */

function verifyAdmin(PDO $pdo, int $userId): array
{
    if ($userId <= 0) {
        responseJson(
            false,
            "معرف المسؤول غير صالح.",
            [],
            400
        );
    }

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
        LIMIT 1
    ");

    $stmt->execute([$userId]);

    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$admin) {
        responseJson(
            false,
            "الحساب المسؤول غير موجود.",
            [],
            403
        );
    }

    if (strtolower((string)$admin["role"]) !== "admin") {
        responseJson(
            false,
            "الوصول مرفوض. هذا الحساب ليس حساب مسؤول.",
            [],
            403
        );
    }

    if (strtolower((string)$admin["statut"]) !== "actif") {
        responseJson(
            false,
            "حساب المسؤول غير نشط.",
            [],
            403
        );
    }

    return $admin;
}

/* ============================================================
   DATABASE CHECK
   ============================================================ */

try {

    if (!isset($pdo) || !($pdo instanceof PDO)) {
        responseJson(
            false,
            "اتصال قاعدة البيانات غير متوفر.",
            [],
            500
        );
    }

    /* ========================================================
       GET
       ======================================================== */

    if ($_SERVER["REQUEST_METHOD"] === "GET") {

        $adminId = isset($_GET["user_id"])
            ? (int)$_GET["user_id"]
            : 0;

        $admin = verifyAdmin($pdo, $adminId);

        /* ----------------------------------------------------
           FILTERS
           ---------------------------------------------------- */

        $search = trim((string)($_GET["search"] ?? ""));
        $role = trim((string)($_GET["role"] ?? ""));
        $statut = trim((string)($_GET["statut"] ?? ""));

        $where = [];
        $params = [];

        /* Search */

        if ($search !== "") {

            $where[] = "
                (
                    nom LIKE ?
                    OR prenom LIKE ?
                    OR email LIKE ?
                    OR telephone LIKE ?
                )
            ";

            $searchValue = "%" . $search . "%";

            $params[] = $searchValue;
            $params[] = $searchValue;
            $params[] = $searchValue;
            $params[] = $searchValue;
        }

        /* Role */

        $allowedRoles = [
            "investisseur",
            "admin",
            "agent"
        ];

        if (
            $role !== "" &&
            in_array($role, $allowedRoles, true)
        ) {
            $where[] = "role = ?";
            $params[] = $role;
        }

        /* Status */

        $allowedStatuses = [
            "actif",
            "inactif",
            "suspendu"
        ];

        if (
            $statut !== "" &&
            in_array($statut, $allowedStatuses, true)
        ) {
            $where[] = "statut = ?";
            $params[] = $statut;
        }

        /* ----------------------------------------------------
           WHERE
           ---------------------------------------------------- */

        $whereSql = "";

        if (!empty($where)) {
            $whereSql = "WHERE " . implode(" AND ", $where);
        }

        /* ----------------------------------------------------
           USERS
           ---------------------------------------------------- */

        $sql = "
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
            $whereSql
            ORDER BY
                CASE
                    WHEN role = 'admin' THEN 1
                    WHEN role = 'agent' THEN 2
                    ELSE 3
                END,
                created_at DESC
        ";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        /* ----------------------------------------------------
           STATS
           ---------------------------------------------------- */

        $statsStmt = $pdo->query("
            SELECT
                COUNT(*) AS total,
                SUM(role = 'investisseur') AS investisseurs,
                SUM(role = 'admin') AS admins,
                SUM(role = 'agent') AS agents,
                SUM(statut = 'actif') AS actifs,
                SUM(statut = 'inactif') AS inactifs,
                SUM(statut = 'suspendu') AS suspendus
            FROM users
        ");

        $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

        $total = (int)($stats["total"] ?? 0);

        $stats = [
            "total" => $total,
            "investisseurs" => (int)($stats["investisseurs"] ?? 0),
            "admins" => (int)($stats["admins"] ?? 0),
            "agents" => (int)($stats["agents"] ?? 0),
            "actifs" => (int)($stats["actifs"] ?? 0),
            "inactifs" => (int)($stats["inactifs"] ?? 0),
            "suspendus" => (int)($stats["suspendus"] ?? 0),
        ];

        /* ----------------------------------------------------
           PERCENTAGES
           ---------------------------------------------------- */

        $stats["pourcentage_actifs"] =
            $total > 0
                ? round(($stats["actifs"] / $total) * 100, 1)
                : 0;

        $stats["pourcentage_investisseurs"] =
            $total > 0
                ? round(($stats["investisseurs"] / $total) * 100, 1)
                : 0;

        responseJson(
            true,
            "تم تحميل المستخدمين بنجاح.",
            [
                "admin" => $admin,
                "stats" => $stats,
                "users" => $users,
                "total_filtered" => count($users)
            ]
        );
    }

    /* ========================================================
       POST
       ======================================================== */

    if ($_SERVER["REQUEST_METHOD"] === "POST") {

        $rawBody = file_get_contents("php://input");

        $body = json_decode(
            $rawBody ?: "{}",
            true
        );

        if (!is_array($body)) {
            responseJson(
                false,
                "بيانات الطلب غير صالحة.",
                [],
                400
            );
        }

        $adminId = (int)($body["user_id"] ?? 0);

        $admin = verifyAdmin($pdo, $adminId);

        $action = trim((string)($body["action"] ?? ""));

        /* ====================================================
           UPDATE USER STATUS
           ==================================================== */

        if ($action === "update_user_status") {

            $targetUserId = (int)(
                $body["target_user_id"] ?? 0
            );

            $newStatus = trim(
                (string)($body["statut"] ?? "")
            );

            if ($targetUserId <= 0) {
                responseJson(
                    false,
                    "معرف المستخدم غير صالح.",
                    [],
                    400
                );
            }

            $allowedStatuses = [
                "actif",
                "inactif",
                "suspendu"
            ];

            if (!in_array($newStatus, $allowedStatuses, true)) {
                responseJson(
                    false,
                    "حالة المستخدم غير صالحة.",
                    [],
                    400
                );
            }

            /* ------------------------------------------------
               PROTECT CURRENT ADMIN
               ------------------------------------------------ */

            if ($targetUserId === $adminId) {
                responseJson(
                    false,
                    "لا يمكنك تغيير حالة حساب المسؤول الذي تستخدمه حالياً.",
                    [],
                    403
                );
            }

            /* ------------------------------------------------
               GET TARGET USER
               ------------------------------------------------ */

            $targetStmt = $pdo->prepare("
                SELECT
                    id,
                    nom,
                    prenom,
                    email,
                    role,
                    statut
                FROM users
                WHERE id = ?
                LIMIT 1
            ");

            $targetStmt->execute([
                $targetUserId
            ]);

            $targetUser = $targetStmt->fetch(
                PDO::FETCH_ASSOC
            );

            if (!$targetUser) {
                responseJson(
                    false,
                    "المستخدم غير موجود.",
                    [],
                    404
                );
            }

            /* ------------------------------------------------
               PROTECT OTHER ADMINS
               ------------------------------------------------ */

            if (
                strtolower(
                    (string)$targetUser["role"]
                ) === "admin"
            ) {
                responseJson(
                    false,
                    "لا يمكن تغيير حالة حساب مسؤول من خلال هذه العملية.",
                    [],
                    403
                );
            }

            /* ------------------------------------------------
               UPDATE
               ------------------------------------------------ */

            $updateStmt = $pdo->prepare("
                UPDATE users
                SET
                    statut = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
                LIMIT 1
            ");

            $updateStmt->execute([
                $newStatus,
                $targetUserId
            ]);

            /* ------------------------------------------------
               GET UPDATED USER
               ------------------------------------------------ */

            $updatedStmt = $pdo->prepare("
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
                LIMIT 1
            ");

            $updatedStmt->execute([
                $targetUserId
            ]);

            $updatedUser = $updatedStmt->fetch(
                PDO::FETCH_ASSOC
            );

            responseJson(
                true,
                "تم تحديث حالة المستخدم بنجاح.",
                [
                    "user" => $updatedUser
                ]
            );
        }

        /* ====================================================
           UNKNOWN ACTION
           ==================================================== */

        responseJson(
            false,
            "العملية المطلوبة غير معروفة.",
            [],
            400
        );
    }

    /* ========================================================
       METHOD NOT ALLOWED
       ======================================================== */

    responseJson(
        false,
        "طريقة الطلب غير مسموحة.",
        [],
        405
    );

} catch (PDOException $e) {

    error_log(
        "AAPI ADMIN USERS PDO ERROR: " .
        $e->getMessage()
    );

    responseJson(
        false,
        "حدث خطأ في قاعدة البيانات.",
        [],
        500
    );

} catch (Throwable $e) {

    error_log(
        "AAPI ADMIN USERS ERROR: " .
        $e->getMessage()
    );

    responseJson(
        false,
        "حدث خطأ داخلي في الخادم.",
        [],
        500
    );
}