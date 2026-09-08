<?php

/**
 * ============================================================
 * AAPI API — ADMIN DASHBOARD
 * ============================================================
 *
 * GET:
 * http://localhost/aapi-api/auth/admin/dashboard.php?user_id=1
 *
 * POST:
 * update_project_status
 *
 * ============================================================
 */

/* ============================================================
   CORS
   ============================================================ */

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
header(
    "Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With"
);
header(
    "Access-Control-Allow-Methods: GET, POST, OPTIONS"
);
header("Content-Type: application/json; charset=UTF-8");


/* ============================================================
   OPTIONS
   ============================================================ */

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {

    http_response_code(200);

    echo json_encode(
        [
            "success" => true,
            "message" => "CORS OK"
        ],
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;
}


/* ============================================================
   DATABASE
   ============================================================ */

require_once __DIR__ . "/../../config/db.php";


/* ============================================================
   HELPERS
   ============================================================ */

function adminJsonResponse(
    bool $success,
    string $message,
    array $data = [],
    int $statusCode = 200
): void {

    http_response_code($statusCode);

    echo json_encode(
        array_merge(
            [
                "success" => $success,
                "message" => $message
            ],
            $data
        ),
        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;
}


function jsonInt($value): int
{
    return $value !== null ? (int) $value : 0;
}


function jsonNumber($value): float
{
    return $value !== null ? (float) $value : 0.0;
}


function percentage($value, $total): float
{
    $value = (float) $value;
    $total = (float) $total;

    if ($total <= 0) {
        return 0.0;
    }

    return round(($value / $total) * 100, 2);
}


/* ============================================================
   READ INPUT
   ============================================================ */

$method = $_SERVER["REQUEST_METHOD"];

$input = [];

if ($method === "POST") {

    $rawInput = file_get_contents("php://input");

    $input = json_decode(
        $rawInput,
        true
    );

    if (!is_array($input)) {

        adminJsonResponse(
            false,
            "بيانات الطلب غير صالحة.",
            [],
            400
        );
    }

} elseif ($method === "GET") {

    $input = $_GET;

} else {

    adminJsonResponse(
        false,
        "طريقة الطلب غير مسموحة.",
        [],
        405
    );
}


/* ============================================================
   ADMIN USER ID
   ============================================================ */

$userId = isset($input["user_id"])
    ? (int) $input["user_id"]
    : 0;


if ($userId <= 0) {

    adminJsonResponse(
        false,
        "معرف المسؤول غير صالح.",
        [],
        400
    );
}


/* ============================================================
   MAIN
   ============================================================ */

try {

    /* ========================================================
       VERIFY ADMIN
       ======================================================== */

    $adminStmt = $pdo->prepare("
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
          AND role = 'admin'
        LIMIT 1
    ");

    $adminStmt->execute([
        $userId
    ]);

    $admin = $adminStmt->fetch(PDO::FETCH_ASSOC);


    if (!$admin) {

        adminJsonResponse(
            false,
            "الوصول مرفوض. هذا الحساب ليس حساب مسؤول.",
            [],
            403
        );
    }


    if (($admin["statut"] ?? "") !== "actif") {

        adminJsonResponse(
            false,
            "حساب المسؤول غير مفعل.",
            [],
            403
        );
    }


    $admin["id"] = jsonInt($admin["id"]);


    /* ========================================================
       POST ACTIONS
       ======================================================== */

    if ($method === "POST") {

        $action = trim(
            (string) ($input["action"] ?? "")
        );


        /* ====================================================
           UPDATE PROJECT STATUS
           ==================================================== */

        if ($action === "update_project_status") {

            $projectId = isset($input["project_id"])
                ? (int) $input["project_id"]
                : 0;

            $newStatus = trim(
                (string) ($input["statut"] ?? "")
            );


            if ($projectId <= 0) {

                adminJsonResponse(
                    false,
                    "معرف المشروع غير صالح.",
                    [],
                    400
                );
            }


            $allowedStatuses = [
                "brouillon",
                "soumis",
                "en_etude",
                "approuve",
                "en_cours",
                "realise",
                "rejete",
                "archive"
            ];


            if (!in_array(
                $newStatus,
                $allowedStatuses,
                true
            )) {

                adminJsonResponse(
                    false,
                    "حالة المشروع غير صحيحة.",
                    [],
                    400
                );
            }


            /* ------------------------------------------------
               CHECK PROJECT
               ------------------------------------------------ */

            $projectCheckStmt = $pdo->prepare("
                SELECT
                    id,
                    titre,
                    statut,
                    user_id
                FROM projects
                WHERE id = ?
                LIMIT 1
            ");

            $projectCheckStmt->execute([
                $projectId
            ]);

            $projectCheck =
                $projectCheckStmt->fetch(PDO::FETCH_ASSOC);


            if (!$projectCheck) {

                adminJsonResponse(
                    false,
                    "المشروع غير موجود.",
                    [],
                    404
                );
            }


            $oldStatus =
                (string) ($projectCheck["statut"] ?? "");


            /* ------------------------------------------------
               UPDATE
               ------------------------------------------------ */

            $updateStmt = $pdo->prepare("
                UPDATE projects
                SET
                    statut = ?,
                    updated_at = NOW()
                WHERE id = ?
                LIMIT 1
            ");

            $updateStmt->execute([
                $newStatus,
                $projectId
            ]);


            /* ------------------------------------------------
               NOTIFICATION FOR INVESTOR
               ------------------------------------------------ */

            try {

                $notificationTitle =
                    "تحديث حالة المشروع";

                $notificationMessage =
                    "تم تحديث حالة مشروعك «" .
                    ($projectCheck["titre"] ?? "") .
                    "» إلى: " .
                    $newStatus;

                $notificationStmt = $pdo->prepare("
                    INSERT INTO notifications
                    (
                        user_id,
                        titre,
                        message,
                        type,
                        lien,
                        lu,
                        created_at
                    )
                    VALUES
                    (
                        ?,
                        ?,
                        ?,
                        'projet',
                        ?,
                        0,
                        NOW()
                    )
                ");

                $notificationStmt->execute([
                    (int) $projectCheck["user_id"],
                    $notificationTitle,
                    $notificationMessage,
                    "/investor/dashboard/projects/" . $projectId
                ]);

            } catch (Throwable $notificationException) {
                /* لا نوقف تحديث المشروع */
            }


            adminJsonResponse(
                true,
                "تم تحديث حالة المشروع بنجاح.",
                [
                    "project" => [
                        "id" => $projectId,
                        "titre" => $projectCheck["titre"],
                        "old_statut" => $oldStatus,
                        "statut" => $newStatus
                    ]
                ]
            );
        }


        /* ====================================================
           UNKNOWN ACTION
           ==================================================== */

        adminJsonResponse(
            false,
            "الإجراء المطلوب غير معروف.",
            [],
            400
        );
    }


    /* ========================================================
       GET DASHBOARD
       ======================================================== */


    /* ========================================================
       1. PROJECT STATISTICS
       ======================================================== */

    $statsStmt = $pdo->query("
        SELECT

            COUNT(*) AS total,

            SUM(
                CASE
                    WHEN statut = 'brouillon'
                    THEN 1 ELSE 0
                END
            ) AS brouillon,

            SUM(
                CASE
                    WHEN statut = 'soumis'
                    THEN 1 ELSE 0
                END
            ) AS soumis,

            SUM(
                CASE
                    WHEN statut = 'en_etude'
                    THEN 1 ELSE 0
                END
            ) AS en_etude,

            SUM(
                CASE
                    WHEN statut = 'approuve'
                    THEN 1 ELSE 0
                END
            ) AS approuve,

            SUM(
                CASE
                    WHEN statut = 'en_cours'
                    THEN 1 ELSE 0
                END
            ) AS en_cours,

            SUM(
                CASE
                    WHEN statut = 'realise'
                    THEN 1 ELSE 0
                END
            ) AS realise,

            SUM(
                CASE
                    WHEN statut = 'rejete'
                    THEN 1 ELSE 0
                END
            ) AS rejete,

            SUM(
                CASE
                    WHEN statut = 'archive'
                    THEN 1 ELSE 0
                END
            ) AS archive

        FROM projects
    ");

    $projectStats =
        $statsStmt->fetch(PDO::FETCH_ASSOC) ?: [];


    $projectsTotal =
        jsonInt($projectStats["total"] ?? 0);


    /* ========================================================
       2. USERS STATISTICS
       ======================================================== */

    $usersStatsStmt = $pdo->query("
        SELECT

            COUNT(*) AS total,

            SUM(
                CASE
                    WHEN role = 'investisseur'
                    THEN 1 ELSE 0
                END
            ) AS investors,

            SUM(
                CASE
                    WHEN role = 'admin'
                    THEN 1 ELSE 0
                END
            ) AS admins,

            SUM(
                CASE
                    WHEN role = 'agent'
                    THEN 1 ELSE 0
                END
            ) AS agents,

            SUM(
                CASE
                    WHEN statut = 'actif'
                    THEN 1 ELSE 0
                END
            ) AS active,

            SUM(
                CASE
                    WHEN statut = 'inactif'
                    THEN 1 ELSE 0
                END
            ) AS inactive,

            SUM(
                CASE
                    WHEN statut = 'suspendu'
                    THEN 1 ELSE 0
                END
            ) AS suspended

        FROM users
    ");

    $usersStats =
        $usersStatsStmt->fetch(PDO::FETCH_ASSOC) ?: [];


    /* ========================================================
       3. PROJECT FINANCIAL STATISTICS
       ======================================================== */

    $projectFinancialStmt = $pdo->query("
        SELECT

            COALESCE(
                SUM(montant_investissement),
                0
            ) AS total_value,

            COALESCE(
                SUM(nombre_emplois),
                0
            ) AS total_jobs

        FROM projects
        WHERE statut <> 'archive'
    ");

    $projectFinancial =
        $projectFinancialStmt->fetch(PDO::FETCH_ASSOC) ?: [];


    /* ========================================================
       4. INVESTMENTS STATISTICS
       ======================================================== */

    $investmentsStmt = $pdo->query("
        SELECT

            COUNT(*) AS total,

            COALESCE(
                SUM(montant),
                0
            ) AS montant_total,

            COALESCE(
                SUM(
                    CASE
                        WHEN statut IN
                        (
                            'valide',
                            'en_cours',
                            'termine'
                        )
                        THEN montant
                        ELSE 0
                    END
                ),
                0
            ) AS montant_effectif,

            COALESCE(
                SUM(
                    CASE
                        WHEN statut = 'en_attente'
                        THEN montant
                        ELSE 0
                    END
                ),
                0
            ) AS montant_pending,

            SUM(
                CASE
                    WHEN statut = 'en_attente'
                    THEN 1 ELSE 0
                END
            ) AS en_attente,

            SUM(
                CASE
                    WHEN statut = 'valide'
                    THEN 1 ELSE 0
                END
            ) AS valide,

            SUM(
                CASE
                    WHEN statut = 'en_cours'
                    THEN 1 ELSE 0
                END
            ) AS en_cours,

            SUM(
                CASE
                    WHEN statut = 'termine'
                    THEN 1 ELSE 0
                END
            ) AS termine,

            SUM(
                CASE
                    WHEN statut = 'annule'
                    THEN 1 ELSE 0
                END
            ) AS annule

        FROM investments
    ");

    $investmentStats =
        $investmentsStmt->fetch(PDO::FETCH_ASSOC) ?: [];


    /* ========================================================
       5. INVESTMENT REQUESTS
       ======================================================== */

    $requestsStatsStmt = $pdo->query("
        SELECT

            COUNT(*) AS total,

            SUM(
                CASE
                    WHEN statut = 'nouvelle'
                    THEN 1 ELSE 0
                END
            ) AS nouvelle,

            SUM(
                CASE
                    WHEN statut = 'en_cours'
                    THEN 1 ELSE 0
                END
            ) AS en_cours,

            SUM(
                CASE
                    WHEN statut = 'en_attente'
                    THEN 1 ELSE 0
                END
            ) AS en_attente,

            SUM(
                CASE
                    WHEN statut = 'acceptee'
                    THEN 1 ELSE 0
                END
            ) AS acceptee,

            SUM(
                CASE
                    WHEN statut = 'refusee'
                    THEN 1 ELSE 0
                END
            ) AS refusee,

            SUM(
                CASE
                    WHEN statut = 'terminee'
                    THEN 1 ELSE 0
                END
            ) AS terminee

        FROM investment_requests
    ");

    $requestStats =
        $requestsStatsStmt->fetch(PDO::FETCH_ASSOC) ?: [];


    /* ========================================================
       6. DOCUMENT STATISTICS
       ======================================================== */

    $documentsStats = [
        "total" => 0,
        "en_attente" => 0,
        "valide" => 0,
        "rejete" => 0
    ];

    try {

        $documentsStmt = $pdo->query("
            SELECT

                COUNT(*) AS total,

                SUM(
                    CASE
                        WHEN statut = 'en_attente'
                        THEN 1 ELSE 0
                    END
                ) AS en_attente,

                SUM(
                    CASE
                        WHEN statut = 'valide'
                        THEN 1 ELSE 0
                    END
                ) AS valide,

                SUM(
                    CASE
                        WHEN statut = 'rejete'
                        THEN 1 ELSE 0
                    END
                ) AS rejete

            FROM documents
        ");

        $result =
            $documentsStmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            $documentsStats = $result;
        }

    } catch (Throwable $e) {
        /* Table unavailable */
    }


    /* ========================================================
       7. MESSAGES
       ======================================================== */

    $messagesStats = [
        "total" => 0,
        "unread" => 0
    ];

    try {

        $messagesStmt = $pdo->query("
            SELECT

                COUNT(*) AS total,

                SUM(
                    CASE
                        WHEN lu = 0
                        THEN 1 ELSE 0
                    END
                ) AS unread

            FROM messages
        ");

        $result =
            $messagesStmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            $messagesStats = $result;
        }

    } catch (Throwable $e) {
        /* Table unavailable */
    }


    /* ========================================================
       8. NOTIFICATIONS
       ======================================================== */

    $notificationsStats = [
        "total" => 0,
        "unread" => 0
    ];

    try {

        $notificationsStmt = $pdo->query("
            SELECT

                COUNT(*) AS total,

                SUM(
                    CASE
                        WHEN lu = 0
                        THEN 1 ELSE 0
                    END
                ) AS unread

            FROM notifications
        ");

        $result =
            $notificationsStmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            $notificationsStats = $result;
        }

    } catch (Throwable $e) {
        /* Table unavailable */
    }


    /* ========================================================
       9. NEWS / ANNOUNCEMENTS / EVENTS
       ======================================================== */

    $newsTotal = 0;
    $announcementsTotal = 0;
    $upcomingEvents = 0;


    try {

        $stmt = $pdo->query("
            SELECT COUNT(*)
            FROM news
        ");

        $newsTotal =
            jsonInt($stmt->fetchColumn());

    } catch (Throwable $e) {}


    try {

        $stmt = $pdo->query("
            SELECT COUNT(*)
            FROM announcements
        ");

        $announcementsTotal =
            jsonInt($stmt->fetchColumn());

    } catch (Throwable $e) {}


    try {

        $stmt = $pdo->query("
            SELECT COUNT(*)
            FROM events
            WHERE date_debut >= NOW()
              AND statut = 'actif'
        ");

        $upcomingEvents =
            jsonInt($stmt->fetchColumn());

    } catch (Throwable $e) {}


    /* ========================================================
       10. PROJECTS BY STATUS
       ======================================================== */

    $projectStatus = [];

    $statusLabels = [
        "brouillon" => "مسودة",
        "soumis" => "مُرسل",
        "en_etude" => "قيد الدراسة",
        "approuve" => "مقبول",
        "en_cours" => "قيد الإنجاز",
        "realise" => "منجز",
        "rejete" => "مرفوض",
        "archive" => "مؤرشف"
    ];


    foreach ($statusLabels as $status => $label) {

        $count = jsonInt(
            $projectStats[$status] ?? 0
        );

        $projectStatus[] = [

            "status" => $status,

            "label" => $label,

            "count" => $count,

            "percentage" =>
                percentage(
                    $count,
                    $projectsTotal
                )
        ];
    }


    /* ========================================================
       11. PROJECTS BY SECTOR
       ======================================================== */

    $projectsBySector = [];

    try {

        $sectorStmt = $pdo->query("
            SELECT

                s.id,

                s.nom AS sector,

                COUNT(
                    DISTINCT ps.project_id
                ) AS projects_count

            FROM sectors s

            LEFT JOIN project_sectors ps
                ON ps.sector_id = s.id

            GROUP BY
                s.id,
                s.nom

            ORDER BY
                projects_count DESC,
                s.nom ASC
        ");

        $sectorRows =
            $sectorStmt->fetchAll(PDO::FETCH_ASSOC);


        foreach ($sectorRows as $row) {

            $count =
                jsonInt(
                    $row["projects_count"] ?? 0
                );

            $projectsBySector[] = [

                "id" =>
                    jsonInt($row["id"]),

                "sector" =>
                    $row["sector"] ?? "",

                "count" =>
                    $count,

                "percentage" =>
                    percentage(
                        $count,
                        $projectsTotal
                    )
            ];
        }

    } catch (Throwable $e) {

        $projectsBySector = [];
    }


    /* ========================================================
       12. INVESTMENTS BY MONTH
       ======================================================== */

    $investmentsByMonth = [];

    try {

        $investmentMonthStmt = $pdo->query("
            SELECT

                DATE_FORMAT(
                    COALESCE(
                        date_investissement,
                        created_at
                    ),
                    '%Y-%m'
                ) AS month,

                COUNT(*) AS investments_count,

                COALESCE(
                    SUM(
                        CASE
                            WHEN statut IN
                            (
                                'valide',
                                'en_cours',
                                'termine'
                            )
                            THEN montant
                            ELSE 0
                        END
                    ),
                    0
                ) AS amount

            FROM investments

            WHERE COALESCE(
                date_investissement,
                created_at
            ) >= DATE_SUB(
                CURDATE(),
                INTERVAL 11 MONTH
            )

            GROUP BY
                DATE_FORMAT(
                    COALESCE(
                        date_investissement,
                        created_at
                    ),
                    '%Y-%m'
                )

            ORDER BY month ASC
        ");

        $rows =
            $investmentMonthStmt->fetchAll(PDO::FETCH_ASSOC);


        foreach ($rows as $row) {

            $investmentsByMonth[] = [

                "month" =>
                    $row["month"],

                "count" =>
                    jsonInt(
                        $row["investments_count"]
                    ),

                "amount" =>
                    jsonNumber(
                        $row["amount"]
                    )
            ];
        }

    } catch (Throwable $e) {

        $investmentsByMonth = [];
    }


    /* ========================================================
       13. ALL PROJECTS
       ======================================================== */

    $projects = [];

    try {

        $projectsStmt = $pdo->query("
            SELECT

                p.id,
                p.user_id,
                p.titre,
                p.slug,
                p.description,
                p.wilaya,
                p.commune,
                p.adresse,
                p.montant_investissement,
                p.nombre_emplois,
                p.superficie,
                p.unite_superficie,
                p.statut,
                p.image,
                p.date_debut,
                p.date_fin,
                p.created_at,
                p.updated_at,

                u.nom AS investor_nom,
                u.prenom AS investor_prenom,
                u.email AS investor_email,
                u.telephone AS investor_telephone,

                ip.nom_entreprise,
                ip.type_investisseur,

                GROUP_CONCAT(
                    DISTINCT s.nom
                    ORDER BY s.nom
                    SEPARATOR ', '
                ) AS secteurs

            FROM projects p

            LEFT JOIN users u
                ON u.id = p.user_id

            LEFT JOIN investor_profiles ip
                ON ip.user_id = p.user_id

            LEFT JOIN project_sectors ps
                ON ps.project_id = p.id

            LEFT JOIN sectors s
                ON s.id = ps.sector_id

            GROUP BY

                p.id,
                p.user_id,
                p.titre,
                p.slug,
                p.description,
                p.wilaya,
                p.commune,
                p.adresse,
                p.montant_investissement,
                p.nombre_emplois,
                p.superficie,
                p.unite_superficie,
                p.statut,
                p.image,
                p.date_debut,
                p.date_fin,
                p.created_at,
                p.updated_at,

                u.nom,
                u.prenom,
                u.email,
                u.telephone,

                ip.nom_entreprise,
                ip.type_investisseur

            ORDER BY
                p.created_at DESC,
                p.id DESC
        ");

        $projects =
            $projectsStmt->fetchAll(PDO::FETCH_ASSOC);


        foreach ($projects as &$project) {

            $project["id"] =
                jsonInt($project["id"]);

            $project["user_id"] =
                jsonInt($project["user_id"]);

            $project["montant_investissement"] =
                jsonNumber(
                    $project["montant_investissement"]
                );

            $project["nombre_emplois"] =
                jsonInt(
                    $project["nombre_emplois"]
                );

            $project["superficie"] =
                $project["superficie"] !== null
                    ? (float) $project["superficie"]
                    : null;


            $project["investor"] = [

                "id" =>
                    $project["user_id"],

                "nom" =>
                    $project["investor_nom"] ?? "",

                "prenom" =>
                    $project["investor_prenom"] ?? "",

                "email" =>
                    $project["investor_email"] ?? "",

                "telephone" =>
                    $project["investor_telephone"] ?? null,

                "nom_entreprise" =>
                    $project["nom_entreprise"] ?? null,

                "type_investisseur" =>
                    $project["type_investisseur"] ?? null
            ];


            $project["sector"] =
                $project["secteurs"] ?? null;


            unset(
                $project["investor_nom"],
                $project["investor_prenom"],
                $project["investor_email"],
                $project["investor_telephone"],
                $project["nom_entreprise"],
                $project["type_investisseur"]
            );
        }

        unset($project);

    } catch (Throwable $e) {

        $projects = [];
    }


    /* ========================================================
       14. RECENT PROJECTS
       ======================================================== */

    $recentProjects =
        array_slice(
            $projects,
            0,
            10
        );


    /* ========================================================
       15. RECENT INVESTMENTS
       ======================================================== */

    $recentInvestments = [];

    try {

        $stmt = $pdo->query("
            SELECT

                i.id,
                i.user_id,
                i.project_id,
                i.montant,
                i.date_investissement,
                i.statut,
                i.reference,
                i.notes,
                i.created_at,

                u.nom,
                u.prenom,
                u.email,

                p.titre AS projet_titre

            FROM investments i

            LEFT JOIN users u
                ON u.id = i.user_id

            LEFT JOIN projects p
                ON p.id = i.project_id

            ORDER BY
                COALESCE(
                    i.date_investissement,
                    i.created_at
                ) DESC,
                i.id DESC

            LIMIT 10
        ");

        $rows =
            $stmt->fetchAll(PDO::FETCH_ASSOC);


        foreach ($rows as $row) {

            $recentInvestments[] = [

                "id" =>
                    jsonInt($row["id"]),

                "user_id" =>
                    jsonInt($row["user_id"]),

                "project_id" =>
                    jsonInt($row["project_id"]),

                "montant" =>
                    jsonNumber($row["montant"]),

                "date_investissement" =>
                    $row["date_investissement"],

                "statut" =>
                    $row["statut"],

                "reference" =>
                    $row["reference"],

                "notes" =>
                    $row["notes"],

                "created_at" =>
                    $row["created_at"],

                "investor" => [

                    "nom" =>
                        $row["nom"] ?? "",

                    "prenom" =>
                        $row["prenom"] ?? "",

                    "email" =>
                        $row["email"] ?? ""
                ],

                "project" => [

                    "id" =>
                        jsonInt($row["project_id"]),

                    "titre" =>
                        $row["projet_titre"] ?? ""
                ]
            ];
        }

    } catch (Throwable $e) {

        $recentInvestments = [];
    }


    /* ========================================================
       16. RECENT REQUESTS
       ======================================================== */

    $recentRequests = [];

    try {

        $stmt = $pdo->query("
            SELECT

                r.id,
                r.user_id,
                r.projet_id,
                r.type_demande,
                r.objet,
                r.description,
                r.montant_demande,
                r.wilaya,
                r.statut,
                r.priorite,
                r.reponse,
                r.traite_par,
                r.date_traitement,
                r.created_at,
                r.updated_at,

                u.nom,
                u.prenom,
                u.email,

                p.titre AS projet_titre

            FROM investment_requests r

            LEFT JOIN users u
                ON u.id = r.user_id

            LEFT JOIN projects p
                ON p.id = r.projet_id

            ORDER BY
                r.created_at DESC,
                r.id DESC

            LIMIT 10
        ");

        $rows =
            $stmt->fetchAll(PDO::FETCH_ASSOC);


        foreach ($rows as $row) {

            $recentRequests[] = [

                "id" =>
                    jsonInt($row["id"]),

                "user_id" =>
                    jsonInt($row["user_id"]),

                "project_id" =>
                    jsonInt($row["projet_id"]),

                "type_demande" =>
                    $row["type_demande"],

                "objet" =>
                    $row["objet"],

                "description" =>
                    $row["description"],

                "montant_demande" =>
                    jsonNumber(
                        $row["montant_demande"]
                    ),

                "wilaya" =>
                    $row["wilaya"],

                "statut" =>
                    $row["statut"],

                "priorite" =>
                    $row["priorite"],

                "reponse" =>
                    $row["reponse"],

                "traite_par" =>
                    $row["traite_par"],

                "date_traitement" =>
                    $row["date_traitement"],

                "created_at" =>
                    $row["created_at"],

                "updated_at" =>
                    $row["updated_at"],

                "investor" => [

                    "nom" =>
                        $row["nom"] ?? "",

                    "prenom" =>
                        $row["prenom"] ?? "",

                    "email" =>
                        $row["email"] ?? ""
                ],

                "project" => [

                    "id" =>
                        jsonInt($row["projet_id"]),

                    "titre" =>
                        $row["projet_titre"] ?? ""
                ]
            ];
        }

    } catch (Throwable $e) {

        $recentRequests = [];
    }


    /* ========================================================
       17. RECENT USERS
       ======================================================== */

    $recentUsers = [];

    try {

        $stmt = $pdo->query("
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
                created_at

            FROM users

            ORDER BY
                created_at DESC,
                id DESC

            LIMIT 10
        ");

        $rows =
            $stmt->fetchAll(PDO::FETCH_ASSOC);


        foreach ($rows as $row) {

            $recentUsers[] = [

                "id" =>
                    jsonInt($row["id"]),

                "nom" =>
                    $row["nom"],

                "prenom" =>
                    $row["prenom"],

                "email" =>
                    $row["email"],

                "telephone" =>
                    $row["telephone"],

                "role" =>
                    $row["role"],

                "statut" =>
                    $row["statut"],

                "photo" =>
                    $row["photo"],

                "last_login" =>
                    $row["last_login"],

                "created_at" =>
                    $row["created_at"]
            ];
        }

    } catch (Throwable $e) {

        $recentUsers = [];
    }


    /* ========================================================
       18. RECENT MESSAGES
       ======================================================== */

    $recentMessages = [];

    try {

        $stmt = $pdo->query("
            SELECT

                m.id,
                m.sender_id,
                m.receiver_id,
                m.sujet,
                m.contenu,
                m.lu,
                m.date_lecture,
                m.created_at,

                sender.nom AS sender_nom,
                sender.prenom AS sender_prenom,
                sender.email AS sender_email,

                receiver.nom AS receiver_nom,
                receiver.prenom AS receiver_prenom,
                receiver.email AS receiver_email

            FROM messages m

            LEFT JOIN users sender
                ON sender.id = m.sender_id

            LEFT JOIN users receiver
                ON receiver.id = m.receiver_id

            ORDER BY
                m.created_at DESC,
                m.id DESC

            LIMIT 10
        ");

        $rows =
            $stmt->fetchAll(PDO::FETCH_ASSOC);


        foreach ($rows as $row) {

            $recentMessages[] = [

                "id" =>
                    jsonInt($row["id"]),

                "sender_id" =>
                    jsonInt($row["sender_id"]),

                "receiver_id" =>
                    jsonInt($row["receiver_id"]),

                "sujet" =>
                    $row["sujet"],

                "contenu" =>
                    $row["contenu"],

                "lu" =>
                    jsonInt($row["lu"]),

                "date_lecture" =>
                    $row["date_lecture"],

                "created_at" =>
                    $row["created_at"],

                "sender" => [

                    "nom" =>
                        $row["sender_nom"] ?? "",

                    "prenom" =>
                        $row["sender_prenom"] ?? "",

                    "email" =>
                        $row["sender_email"] ?? ""
                ],

                "receiver" => [

                    "nom" =>
                        $row["receiver_nom"] ?? "",

                    "prenom" =>
                        $row["receiver_prenom"] ?? "",

                    "email" =>
                        $row["receiver_email"] ?? ""
                ]
            ];
        }

    } catch (Throwable $e) {

        $recentMessages = [];
    }


    /* ========================================================
       19. RECENT ACTIVITIES
       ======================================================== */

    $activities = [];


    foreach (
        array_slice(
            $projects,
            0,
            10
        ) as $project
    ) {

        $investorName = trim(
            ($project["investor"]["prenom"] ?? "") .
            " " .
            ($project["investor"]["nom"] ?? "")
        );


        if ($investorName === "") {
            $investorName = "مستثمر";
        }


        $activities[] = [

            "type" => "project",

            "title" =>
                $project["titre"] ?? "مشروع",

            "description" =>
                "مشروع جديد من " .
                $investorName,

            "status" =>
                $project["statut"] ?? "",

            "date" =>
                $project["created_at"] ?? null
        ];
    }


    foreach (
        array_slice(
            $recentInvestments,
            0,
            5
        ) as $investment
    ) {

        $name = trim(
            ($investment["investor"]["prenom"] ?? "") .
            " " .
            ($investment["investor"]["nom"] ?? "")
        );


        if ($name === "") {
            $name = "مستثمر";
        }


        $activities[] = [

            "type" => "investment",

            "title" =>
                "استثمار جديد",

            "description" =>
                $name,

            "status" =>
                $investment["statut"] ?? "",

            "amount" =>
                $investment["montant"] ?? 0,

            "date" =>
                $investment["created_at"] ?? null
        ];
    }


    foreach (
        array_slice(
            $recentRequests,
            0,
            5
        ) as $request
    ) {

        $name = trim(
            ($request["investor"]["prenom"] ?? "") .
            " " .
            ($request["investor"]["nom"] ?? "")
        );


        if ($name === "") {
            $name = "مستثمر";
        }


        $activities[] = [

            "type" => "request",

            "title" =>
                $request["objet"] ??
                "طلب استثمار",

            "description" =>
                "طلب من " .
                $name,

            "status" =>
                $request["statut"] ?? "",

            "date" =>
                $request["created_at"] ?? null
        ];
    }


    usort(
        $activities,
        function ($a, $b) {

            $dateA =
                strtotime(
                    $a["date"] ?? ""
                );

            $dateB =
                strtotime(
                    $b["date"] ?? ""
                );

            return $dateB <=> $dateA;
        }
    );


    $activities =
        array_slice(
            $activities,
            0,
            15
        );


    /* ========================================================
       20. FINAL STATS
       ======================================================== */

    $finalStats = [

        /* PROJECTS */

        "projects_total" =>
            $projectsTotal,

        "projects_brouillon" =>
            jsonInt(
                $projectStats["brouillon"] ?? 0
            ),

        "projects_submitted" =>
            jsonInt(
                $projectStats["soumis"] ?? 0
            ),

        "projects_in_study" =>
            jsonInt(
                $projectStats["en_etude"] ?? 0
            ),

        "projects_approved" =>
            jsonInt(
                $projectStats["approuve"] ?? 0
            ),

        "projects_active" =>
            jsonInt(
                $projectStats["en_cours"] ?? 0
            ),

        "projects_completed" =>
            jsonInt(
                $projectStats["realise"] ?? 0
            ),

        "projects_rejected" =>
            jsonInt(
                $projectStats["rejete"] ?? 0
            ),

        "projects_archived" =>
            jsonInt(
                $projectStats["archive"] ?? 0
            ),


        /* PROJECT PERCENTAGES */

        "projects_submitted_percentage" =>
            percentage(
                $projectStats["soumis"] ?? 0,
                $projectsTotal
            ),

        "projects_in_study_percentage" =>
            percentage(
                $projectStats["en_etude"] ?? 0,
                $projectsTotal
            ),

        "projects_approved_percentage" =>
            percentage(
                $projectStats["approuve"] ?? 0,
                $projectsTotal
            ),

        "projects_active_percentage" =>
            percentage(
                $projectStats["en_cours"] ?? 0,
                $projectsTotal
            ),

        "projects_completed_percentage" =>
            percentage(
                $projectStats["realise"] ?? 0,
                $projectsTotal
            ),


        /* USERS */

        "users_total" =>
            jsonInt(
                $usersStats["total"] ?? 0
            ),

        "investors_total" =>
            jsonInt(
                $usersStats["investors"] ?? 0
            ),

        "admins_total" =>
            jsonInt(
                $usersStats["admins"] ?? 0
            ),

        "agents_total" =>
            jsonInt(
                $usersStats["agents"] ?? 0
            ),

        "active_users" =>
            jsonInt(
                $usersStats["active"] ?? 0
            ),

        "inactive_users" =>
            jsonInt(
                $usersStats["inactive"] ?? 0
            ),

        "suspended_users" =>
            jsonInt(
                $usersStats["suspended"] ?? 0
            ),


        "active_users_percentage" =>
            percentage(
                $usersStats["active"] ?? 0,
                $usersStats["total"] ?? 0
            ),


        /* PROJECT FINANCE */

        "projects_value" =>
            jsonNumber(
                $projectFinancial["total_value"] ?? 0
            ),

        "total_jobs" =>
            jsonInt(
                $projectFinancial["total_jobs"] ?? 0
            ),


        /* INVESTMENTS */

        "investments_total" =>
            jsonInt(
                $investmentStats["total"] ?? 0
            ),

        "total_investment" =>
            jsonNumber(
                $investmentStats["montant_effectif"] ?? 0
            ),

        "investments_gross_amount" =>
            jsonNumber(
                $investmentStats["montant_total"] ?? 0
            ),

        "investments_pending_amount" =>
            jsonNumber(
                $investmentStats["montant_pending"] ?? 0
            ),

        "investments_pending" =>
            jsonInt(
                $investmentStats["en_attente"] ?? 0
            ),

        "investments_validated" =>
            jsonInt(
                $investmentStats["valide"] ?? 0
            ),

        "investments_active" =>
            jsonInt(
                $investmentStats["en_cours"] ?? 0
            ),

        "investments_completed" =>
            jsonInt(
                $investmentStats["termine"] ?? 0
            ),

        "investments_cancelled" =>
            jsonInt(
                $investmentStats["annule"] ?? 0
            ),


        /* REQUESTS */

        "requests_total" =>
            jsonInt(
                $requestStats["total"] ?? 0
            ),

        "requests_new" =>
            jsonInt(
                $requestStats["nouvelle"] ?? 0
            ),

        "requests_pending" =>
            jsonInt(
                $requestStats["en_attente"] ?? 0
            ),

        "requests_in_progress" =>
            jsonInt(
                $requestStats["en_cours"] ?? 0
            ),

        "requests_accepted" =>
            jsonInt(
                $requestStats["acceptee"] ?? 0
            ),

        "requests_rejected" =>
            jsonInt(
                $requestStats["refusee"] ?? 0
            ),

        "requests_completed" =>
            jsonInt(
                $requestStats["terminee"] ?? 0
            ),


        /* DOCUMENTS */

        "documents_total" =>
            jsonInt(
                $documentsStats["total"] ?? 0
            ),

        "documents_pending" =>
            jsonInt(
                $documentsStats["en_attente"] ?? 0
            ),

        "documents_validated" =>
            jsonInt(
                $documentsStats["valide"] ?? 0
            ),

        "documents_rejected" =>
            jsonInt(
                $documentsStats["rejete"] ?? 0
            ),


        /* MESSAGES */

        "messages_total" =>
            jsonInt(
                $messagesStats["total"] ?? 0
            ),

        "messages_unread" =>
            jsonInt(
                $messagesStats["unread"] ?? 0
            ),


        /* NOTIFICATIONS */

        "notifications_total" =>
            jsonInt(
                $notificationsStats["total"] ?? 0
            ),

        "notifications_unread" =>
            jsonInt(
                $notificationsStats["unread"] ?? 0
            ),


        /* CONTENT */

        "news_total" =>
            $newsTotal,

        "announcements_total" =>
            $announcementsTotal,

        "upcoming_events" =>
            $upcomingEvents
    ];


    /* ========================================================
       FINAL RESPONSE
       ======================================================== */

    adminJsonResponse(
        true,
        "تم تحميل بيانات لوحة الإدارة الحقيقية بنجاح.",
        [

            "admin" =>
                $admin,

            "stats" =>
                $finalStats,

            "project_status" =>
                $projectStatus,

            "projects_by_sector" =>
                $projectsBySector,

            "investments_by_month" =>
                $investmentsByMonth,

            "projects" =>
                $projects,

            "recent_projects" =>
                $recentProjects,

            "recent_investments" =>
                $recentInvestments,

            "recent_requests" =>
                $recentRequests,

            "recent_users" =>
                $recentUsers,

            "recent_messages" =>
                $recentMessages,

            "activities" =>
                $activities
        ]
    );


} catch (Throwable $e) {

    adminJsonResponse(
        false,
        "حدث خطأ أثناء تحميل لوحة الإدارة.",
        [
            "error" =>
                $e->getMessage()
        ],
        500
    );
}
