<?php

/**
 * ============================================================
 * AAPI — ADMIN INVESTORS API
 * ============================================================
 */

header("Content-Type: application/json; charset=UTF-8");

$allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5176",
    "http://127.0.0.1:5176"
];

$origin = $_SERVER["HTTP_ORIGIN"] ?? "";

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: " . $origin);
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

require_once __DIR__ . "/../../config/db.php";

/* ============================================================
   JSON RESPONSE
   ============================================================ */

function responseJson(
    bool $success,
    string $message,
    array $data = [],
    int $status = 200
): void {

    http_response_code($status);

    echo json_encode(
        array_merge(
            [
                "success" => $success,
                "message" => $message
            ],
            $data
        ),
        JSON_UNESCAPED_UNICODE
    );

    exit;
}

/* ============================================================
   VERIFY ADMIN
   ============================================================ */

function verifyAdmin(PDO $pdo, int $userId): array
{
    $stmt = $pdo->prepare("
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

    $stmt->execute([$userId]);

    $user = $stmt->fetch();

    if (!$user) {
        responseJson(
            false,
            "حساب المسؤول غير موجود.",
            [],
            401
        );
    }

    if (
        strtolower((string)$user["role"]) !== "admin"
    ) {
        responseJson(
            false,
            "الوصول مرفوض. هذا الحساب ليس حساب مسؤول.",
            [],
            403
        );
    }

    if (
        strtolower((string)$user["statut"]) !== "actif"
    ) {
        responseJson(
            false,
            "حساب المسؤول غير نشط.",
            [],
            403
        );
    }

    return $user;
}

/* ============================================================
   INPUT
   ============================================================ */

$method = $_SERVER["REQUEST_METHOD"];

if ($method === "GET") {

    $adminId = isset($_GET["user_id"])
        ? (int)$_GET["user_id"]
        : 0;

    if ($adminId <= 0) {
        responseJson(
            false,
            "معرف المسؤول مطلوب.",
            [],
            400
        );
    }

    verifyAdmin($pdo, $adminId);

    $search = trim(
        (string)($_GET["search"] ?? "")
    );

    $statut = trim(
        (string)($_GET["statut"] ?? "")
    );

    $type = trim(
        (string)($_GET["type_investisseur"] ?? "")
    );

    /* ========================================================
       QUERY
       ======================================================== */

    $sql = "
        SELECT
            u.id,
            u.nom,
            u.prenom,
            u.email,
            u.telephone,
            u.statut,
            u.photo,
            u.created_at,
            u.last_login,

            ip.type_investisseur,
            ip.nom_entreprise,
            ip.registre_commerce,
            ip.nif,
            ip.nis,
            ip.wilaya,
            ip.commune,
            ip.adresse,
            ip.site_web,
            ip.secteur_activite

        FROM users u

        LEFT JOIN investor_profiles ip
            ON ip.user_id = u.id

        WHERE u.role = 'investisseur'
    ";

    $params = [];

    /* ========================================================
       SEARCH
       ======================================================== */

    if ($search !== "") {

        $sql .= "
            AND (
                u.nom LIKE ?
                OR u.prenom LIKE ?
                OR u.email LIKE ?
                OR u.telephone LIKE ?
                OR ip.nom_entreprise LIKE ?
                OR ip.registre_commerce LIKE ?
                OR ip.nif LIKE ?
                OR ip.wilaya LIKE ?
                OR ip.commune LIKE ?
                OR ip.secteur_activite LIKE ?
            )
        ";

        $searchValue = "%" . $search . "%";

        for ($i = 0; $i < 10; $i++) {
            $params[] = $searchValue;
        }
    }

    /* ========================================================
       STATUS
       ======================================================== */

    if (
        in_array(
            $statut,
            ["actif", "inactif", "suspendu"],
            true
        )
    ) {

        $sql .= "
            AND u.statut = ?
        ";

        $params[] = $statut;
    }

    /* ========================================================
       TYPE
       ======================================================== */

    if (
        in_array(
            $type,
            [
                "personne_physique",
                "personne_morale",
                "investisseur_etranger"
            ],
            true
        )
    ) {

        $sql .= "
            AND ip.type_investisseur = ?
        ";

        $params[] = $type;
    }

    $sql .= "
        ORDER BY u.created_at DESC
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute($params);

    $investors = $stmt->fetchAll();

    /* ========================================================
       GLOBAL STATS
       ======================================================== */

    $statsStmt = $pdo->query("
        SELECT

            COUNT(*) AS total,

            SUM(
                CASE
                    WHEN u.statut = 'actif'
                    THEN 1
                    ELSE 0
                END
            ) AS actifs,

            SUM(
                CASE
                    WHEN u.statut = 'inactif'
                    THEN 1
                    ELSE 0
                END
            ) AS inactifs,

            SUM(
                CASE
                    WHEN u.statut = 'suspendu'
                    THEN 1
                    ELSE 0
                END
            ) AS suspendus

        FROM users u

        WHERE u.role = 'investisseur'
    ");

    $stats = $statsStmt->fetch();

    $typeStmt = $pdo->query("
        SELECT

            SUM(
                CASE
                    WHEN ip.type_investisseur = 'personne_physique'
                    THEN 1
                    ELSE 0
                END
            ) AS personnes_physiques,

            SUM(
                CASE
                    WHEN ip.type_investisseur = 'personne_morale'
                    THEN 1
                    ELSE 0
                END
            ) AS personnes_morales,

            SUM(
                CASE
                    WHEN ip.type_investisseur = 'investisseur_etranger'
                    THEN 1
                    ELSE 0
                END
            ) AS investisseurs_etrangers

        FROM users u

        LEFT JOIN investor_profiles ip
            ON ip.user_id = u.id

        WHERE u.role = 'investisseur'
    ");

    $typeStats = $typeStmt->fetch();

    $total = (int)($stats["total"] ?? 0);
    $actifs = (int)($stats["actifs"] ?? 0);

    $percentage = $total > 0
        ? round(($actifs / $total) * 100, 1)
        : 0;

    responseJson(
        true,
        "تم تحميل المستثمرين بنجاح.",
        [
            "investors" => $investors,

            "stats" => [
                "total" => $total,
                "actifs" => $actifs,
                "inactifs" => (int)($stats["inactifs"] ?? 0),
                "suspendus" => (int)($stats["suspendus"] ?? 0),

                "personnes_physiques" =>
                    (int)($typeStats["personnes_physiques"] ?? 0),

                "personnes_morales" =>
                    (int)($typeStats["personnes_morales"] ?? 0),

                "investisseurs_etrangers" =>
                    (int)($typeStats["investisseurs_etrangers"] ?? 0),

                "pourcentage_actifs" => $percentage
            ]
        ]
    );
}

/* ============================================================
   POST — UPDATE STATUS
   ============================================================ */

if ($method === "POST") {

    $raw = file_get_contents("php://input");

    $body = json_decode(
        $raw,
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

    $targetUserId =
        (int)($body["target_user_id"] ?? 0);

    $action =
        (string)($body["action"] ?? "");

    $newStatus =
        (string)($body["statut"] ?? "");

    if ($adminId <= 0) {
        responseJson(
            false,
            "معرف المسؤول مطلوب.",
            [],
            400
        );
    }

    verifyAdmin($pdo, $adminId);

    if (
        $action !==
        "update_investor_status"
    ) {
        responseJson(
            false,
            "الإجراء غير مدعوم.",
            [],
            400
        );
    }

    if ($targetUserId <= 0) {
        responseJson(
            false,
            "معرف المستثمر مطلوب.",
            [],
            400
        );
    }

    if (
        !in_array(
            $newStatus,
            ["actif", "inactif", "suspendu"],
            true
        )
    ) {
        responseJson(
            false,
            "حالة المستثمر غير صالحة.",
            [],
            400
        );
    }

    /* تأكد أنه مستثمر وليس admin */

    $check = $pdo->prepare("
        SELECT id, role
        FROM users
        WHERE id = ?
        LIMIT 1
    ");

    $check->execute([
        $targetUserId
    ]);

    $target = $check->fetch();

    if (!$target) {
        responseJson(
            false,
            "المستخدم غير موجود.",
            [],
            404
        );
    }

    if (
        strtolower((string)$target["role"])
        !== "investisseur"
    ) {
        responseJson(
            false,
            "يمكن تعديل حالة المستثمرين فقط.",
            [],
            403
        );
    }

    $update = $pdo->prepare("
        UPDATE users
        SET statut = ?
        WHERE id = ?
        AND role = 'investisseur'
    ");

    $update->execute([
        $newStatus,
        $targetUserId
    ]);

    responseJson(
        true,
        "تم تحديث حالة المستثمر بنجاح."
    );
}

/* ============================================================
   METHOD NOT ALLOWED
   ============================================================ */

responseJson(
    false,
    "طريقة الطلب غير مسموحة.",
    [],
    405
);