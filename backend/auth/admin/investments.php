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

function response(
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

function admin(PDO $pdo, int $id)
{
    $stmt = $pdo->prepare("
        SELECT id, role, statut
        FROM users
        WHERE id = ?
        LIMIT 1
    ");

    $stmt->execute([$id]);

    $user = $stmt->fetch();

    if (!$user || $user["role"] !== "admin") {
        response(
            false,
            "Accès administrateur refusé.",
            [],
            403
        );
    }

    if ($user["statut"] !== "actif") {
        response(
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

    admin($pdo, $adminId);

    $search = trim(
        $_GET["search"] ?? ""
    );

    $statut = trim(
        $_GET["statut"] ?? ""
    );

    $sql = "
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

            p.titre AS titre_projet,
            p.wilaya,
            p.statut AS projet_statut

        FROM investments i

        INNER JOIN users u
            ON u.id = i.user_id

        INNER JOIN projects p
            ON p.id = i.project_id

        WHERE 1 = 1
    ";

    $params = [];

    if ($search !== "") {

        $sql .= "
            AND (
                i.reference LIKE ?
                OR u.nom LIKE ?
                OR u.prenom LIKE ?
                OR u.email LIKE ?
                OR p.titre LIKE ?
                OR p.wilaya LIKE ?
            )
        ";

        $value = "%" . $search . "%";

        for ($i = 0; $i < 6; $i++) {
            $params[] = $value;
        }
    }

    if (
        in_array(
            $statut,
            [
                "en_attente",
                "valide",
                "en_cours",
                "termine",
                "annule"
            ],
            true
        )
    ) {

        $sql .= " AND i.statut = ? ";

        $params[] = $statut;
    }

    $sql .= "
        ORDER BY i.created_at DESC
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute($params);

    $investments = $stmt->fetchAll();

    /* ========================================================
       STATS
       ======================================================== */

    $statsStmt = $pdo->query("
        SELECT

            COUNT(*) AS total,

            SUM(statut = 'en_attente')
                AS en_attente,

            SUM(statut = 'valide')
                AS valide,

            SUM(statut = 'en_cours')
                AS en_cours,

            SUM(statut = 'termine')
                AS termine,

            SUM(statut = 'annule')
                AS annule,

            COALESCE(
                SUM(
                    CASE
                        WHEN statut <> 'annule'
                        THEN montant
                        ELSE 0
                    END
                ),
                0
            ) AS montant_total

        FROM investments
    ");

    $stats = $statsStmt->fetch();

    response(
        true,
        "Investissements chargés avec succès.",
        [
            "investments" => $investments,

            "stats" => [
                "total" => (int)($stats["total"] ?? 0),
                "en_attente" => (int)($stats["en_attente"] ?? 0),
                "valide" => (int)($stats["valide"] ?? 0),
                "en_cours" => (int)($stats["en_cours"] ?? 0),
                "termine" => (int)($stats["termine"] ?? 0),
                "annule" => (int)($stats["annule"] ?? 0),
                "montant_total" => (float)($stats["montant_total"] ?? 0)
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
        response(
            false,
            "Données invalides.",
            [],
            400
        );
    }

    $adminId =
        (int)($body["user_id"] ?? 0);

    admin($pdo, $adminId);

    if (
        ($body["action"] ?? "") !==
        "update_investment_status"
    ) {
        response(
            false,
            "Action non supportée.",
            [],
            400
        );
    }

    $investmentId =
        (int)($body["investment_id"] ?? 0);

    $status =
        (string)($body["statut"] ?? "");

    $allowed = [
        "en_attente",
        "valide",
        "en_cours",
        "termine",
        "annule"
    ];

    if ($investmentId <= 0) {
        response(
            false,
            "investment_id obligatoire.",
            [],
            400
        );
    }

    if (!in_array($status, $allowed, true)) {
        response(
            false,
            "Statut invalide.",
            [],
            400
        );
    }

    $stmt = $pdo->prepare("
        UPDATE investments
        SET statut = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $status,
        $investmentId
    ]);

    response(
        true,
        "Statut de l'investissement mis à jour."
    );
}

response(
    false,
    "Méthode non autorisée.",
    [],
    405
);