<?php

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
    exit;
}

require_once __DIR__ . "/../../config/db.php";

function jsonResponse(
    bool $success,
    string $message,
    array $data = [],
    int $status = 200
) {
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

function verifyAdmin(PDO $pdo, int $userId)
{
    $stmt = $pdo->prepare("
        SELECT id, role, statut
        FROM users
        WHERE id = ?
        LIMIT 1
    ");

    $stmt->execute([$userId]);

    $user = $stmt->fetch();

    if (!$user) {
        jsonResponse(
            false,
            "Administrateur introuvable.",
            [],
            401
        );
    }

    if ($user["role"] !== "admin") {
        jsonResponse(
            false,
            "Accès administrateur refusé.",
            [],
            403
        );
    }

    if ($user["statut"] !== "actif") {
        jsonResponse(
            false,
            "Compte administrateur inactif.",
            [],
            403
        );
    }

    return $user;
}

/* ============================================================
   GET
   ============================================================ */

if ($_SERVER["REQUEST_METHOD"] === "GET") {

    $adminId = (int)($_GET["user_id"] ?? 0);

    if ($adminId <= 0) {
        jsonResponse(
            false,
            "user_id est obligatoire.",
            [],
            400
        );
    }

    verifyAdmin($pdo, $adminId);

    $search = trim(
        $_GET["search"] ?? ""
    );

    $statut = trim(
        $_GET["statut"] ?? ""
    );

    $sql = "
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

            u.nom,
            u.prenom,
            u.email,

            GROUP_CONCAT(
                DISTINCT s.nom
                ORDER BY s.nom
                SEPARATOR ', '
            ) AS secteurs

        FROM projects p

        INNER JOIN users u
            ON u.id = p.user_id

        LEFT JOIN project_sectors ps
            ON ps.project_id = p.id

        LEFT JOIN sectors s
            ON s.id = ps.sector_id

        WHERE 1 = 1
    ";

    $params = [];

    if ($search !== "") {

        $sql .= "
            AND (
                p.titre LIKE ?
                OR p.description LIKE ?
                OR p.wilaya LIKE ?
                OR p.commune LIKE ?
                OR u.nom LIKE ?
                OR u.prenom LIKE ?
                OR u.email LIKE ?
            )
        ";

        $value = "%" . $search . "%";

        for ($i = 0; $i < 7; $i++) {
            $params[] = $value;
        }
    }

    if (
        in_array(
            $statut,
            [
                "brouillon",
                "soumis",
                "en_etude",
                "approuve",
                "en_cours",
                "realise",
                "rejete",
                "archive"
            ],
            true
        )
    ) {

        $sql .= " AND p.statut = ? ";

        $params[] = $statut;
    }

    $sql .= "
        GROUP BY p.id
        ORDER BY p.created_at DESC
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute($params);

    $projects = $stmt->fetchAll();

    /* ========================================================
       STATS
       ======================================================== */

    $statsStmt = $pdo->query("
        SELECT

            COUNT(*) AS total,

            SUM(statut = 'brouillon') AS brouillon,
            SUM(statut = 'soumis') AS soumis,
            SUM(statut = 'en_etude') AS en_etude,
            SUM(statut = 'approuve') AS approuve,
            SUM(statut = 'en_cours') AS en_cours,
            SUM(statut = 'realise') AS realise,
            SUM(statut = 'rejete') AS rejete,
            SUM(statut = 'archive') AS archive,

            COALESCE(
                SUM(montant_investissement),
                0
            ) AS montant_total,

            COALESCE(
                SUM(nombre_emplois),
                0
            ) AS emplois_total

        FROM projects
    ");

    $stats = $statsStmt->fetch();

    jsonResponse(
        true,
        "Projets chargés avec succès.",
        [
            "projects" => $projects,

            "stats" => [
                "total" => (int)($stats["total"] ?? 0),
                "brouillon" => (int)($stats["brouillon"] ?? 0),
                "soumis" => (int)($stats["soumis"] ?? 0),
                "en_etude" => (int)($stats["en_etude"] ?? 0),
                "approuve" => (int)($stats["approuve"] ?? 0),
                "en_cours" => (int)($stats["en_cours"] ?? 0),
                "realise" => (int)($stats["realise"] ?? 0),
                "rejete" => (int)($stats["rejete"] ?? 0),
                "archive" => (int)($stats["archive"] ?? 0),
                "montant_total" => (float)($stats["montant_total"] ?? 0),
                "emplois_total" => (int)($stats["emplois_total"] ?? 0)
            ]
        ]
    );
}

/* ============================================================
   POST
   ============================================================ */

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $body = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (!is_array($body)) {
        jsonResponse(
            false,
            "Données invalides.",
            [],
            400
        );
    }

    $adminId = (int)($body["user_id"] ?? 0);

    verifyAdmin($pdo, $adminId);

    $action = $body["action"] ?? "";

    if ($action !== "update_project_status") {
        jsonResponse(
            false,
            "Action non supportée.",
            [],
            400
        );
    }

    $projectId =
        (int)($body["project_id"] ?? 0);

    $newStatus =
        (string)($body["statut"] ?? "");

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

    if ($projectId <= 0) {
        jsonResponse(
            false,
            "project_id est obligatoire.",
            [],
            400
        );
    }

    if (
        !in_array(
            $newStatus,
            $allowedStatuses,
            true
        )
    ) {
        jsonResponse(
            false,
            "Statut du projet invalide.",
            [],
            400
        );
    }

    $stmt = $pdo->prepare("
        UPDATE projects
        SET statut = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $newStatus,
        $projectId
    ]);

    jsonResponse(
        true,
        "Statut du projet mis à jour avec succès."
    );
}

jsonResponse(
    false,
    "Méthode non autorisée.",
    [],
    405
);