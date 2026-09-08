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

function jsonOut(
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

function checkAdmin(PDO $pdo, int $id)
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
        jsonOut(
            false,
            "Accès administrateur refusé.",
            [],
            403
        );
    }

    if ($user["statut"] !== "actif") {
        jsonOut(
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

    $adminId =
        (int)($_GET["user_id"] ?? 0);

    checkAdmin($pdo, $adminId);

    $search = trim(
        $_GET["search"] ?? ""
    );

    $statut = trim(
        $_GET["statut"] ?? ""
    );

    $priorite = trim(
        $_GET["priorite"] ?? ""
    );

    $sql = "
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

            u.nom,
            u.prenom,
            u.email,

            p.titre AS titre_projet,

            a.nom AS admin_nom,
            a.prenom AS admin_prenom

        FROM investment_requests r

        INNER JOIN users u
            ON u.id = r.user_id

        LEFT JOIN projects p
            ON p.id = r.projet_id

        LEFT JOIN users a
            ON a.id = r.traite_par

        WHERE 1 = 1
    ";

    $params = [];

    if ($search !== "") {

        $sql .= "
            AND (
                r.objet LIKE ?
                OR r.description LIKE ?
                OR r.type_demande LIKE ?
                OR r.wilaya LIKE ?
                OR u.nom LIKE ?
                OR u.prenom LIKE ?
                OR u.email LIKE ?
                OR p.titre LIKE ?
            )
        ";

        $value = "%" . $search . "%";

        for ($i = 0; $i < 8; $i++) {
            $params[] = $value;
        }
    }

    if (
        in_array(
            $statut,
            [
                "nouvelle",
                "en_cours",
                "en_attente",
                "acceptee",
                "refusee",
                "terminee"
            ],
            true
        )
    ) {

        $sql .= " AND r.statut = ? ";

        $params[] = $statut;
    }

    if (
        in_array(
            $priorite,
            [
                "basse",
                "normale",
                "haute",
                "urgente"
            ],
            true
        )
    ) {

        $sql .= " AND r.priorite = ? ";

        $params[] = $priorite;
    }

    $sql .= "
        ORDER BY
            CASE
                WHEN r.priorite = 'urgente'
                THEN 1
                WHEN r.priorite = 'haute'
                THEN 2
                WHEN r.priorite = 'normale'
                THEN 3
                ELSE 4
            END,
            r.created_at DESC
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute($params);

    $requests = $stmt->fetchAll();

    /* ========================================================
       STATS
       ======================================================== */

    $statsStmt = $pdo->query("
        SELECT

            COUNT(*) AS total,

            SUM(statut = 'nouvelle')
                AS nouvelle,

            SUM(statut = 'en_cours')
                AS en_cours,

            SUM(statut = 'en_attente')
                AS en_attente,

            SUM(statut = 'acceptee')
                AS acceptee,

            SUM(statut = 'refusee')
                AS refusee,

            SUM(statut = 'terminee')
                AS terminee,

            SUM(priorite = 'urgente')
                AS urgentes

        FROM investment_requests
    ");

    $stats = $statsStmt->fetch();

    jsonOut(
        true,
        "Demandes chargées avec succès.",
        [
            "requests" => $requests,

            "stats" => [
                "total" => (int)($stats["total"] ?? 0),
                "nouvelle" => (int)($stats["nouvelle"] ?? 0),
                "en_cours" => (int)($stats["en_cours"] ?? 0),
                "en_attente" => (int)($stats["en_attente"] ?? 0),
                "acceptee" => (int)($stats["acceptee"] ?? 0),
                "refusee" => (int)($stats["refusee"] ?? 0),
                "terminee" => (int)($stats["terminee"] ?? 0),
                "urgentes" => (int)($stats["urgentes"] ?? 0)
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
        jsonOut(
            false,
            "Données invalides.",
            [],
            400
        );
    }

    $adminId =
        (int)($body["user_id"] ?? 0);

    checkAdmin($pdo, $adminId);

    if (
        ($body["action"] ?? "") !==
        "update_request_status"
    ) {
        jsonOut(
            false,
            "Action non supportée.",
            [],
            400
        );
    }

    $requestId =
        (int)($body["request_id"] ?? 0);

    $status =
        (string)($body["statut"] ?? "");

    $allowed = [
        "nouvelle",
        "en_cours",
        "en_attente",
        "acceptee",
        "refusee",
        "terminee"
    ];

    if ($requestId <= 0) {
        jsonOut(
            false,
            "request_id obligatoire.",
            [],
            400
        );
    }

    if (!in_array($status, $allowed, true)) {
        jsonOut(
            false,
            "Statut invalide.",
            [],
            400
        );
    }

    $stmt = $pdo->prepare("
        UPDATE investment_requests

        SET
            statut = ?,

            traite_par = ?,

            date_traitement =
                CASE
                    WHEN ? IN (
                        'acceptee',
                        'refusee',
                        'terminee'
                    )
                    THEN NOW()
                    ELSE date_traitement
                END

        WHERE id = ?
    ");

    $stmt->execute([
        $status,
        $adminId,
        $status,
        $requestId
    ]);

    jsonOut(
        true,
        "Statut de la demande mis à jour."
    );
}

jsonOut(
    false,
    "Méthode non autorisée.",
    [],
    405
);