<?php

/**
 * ============================================================
 * AAPI API
 * INVESTOR DASHBOARD
 * ============================================================
 *
 * URL:
 * http://localhost/aapi-api/investor/dashboard.php
 *
 * METHOD:
 * POST
 *
 * BODY:
 * {
 *   "user_id": 2
 * }
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
    "Access-Control-Allow-Methods: POST, OPTIONS"
);

header(
    "Content-Type: application/json; charset=UTF-8"
);


/* ============================================================
   OPTIONS / PREFLIGHT
   ============================================================ */

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {

    http_response_code(200);

    echo json_encode(
        [
            "success" => true,
            "message" => "CORS OK"
        ],
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


/* ============================================================
   METHOD
   ============================================================ */

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode(
        [
            "success" => false,
            "message" => "طريقة الطلب غير مسموحة."
        ],
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


/* ============================================================
   DATABASE
   ============================================================ */

require_once __DIR__ . "/../../config/db.php";


/* ============================================================
   READ JSON
   ============================================================ */

$rawInput = file_get_contents("php://input");

$input = json_decode(
    $rawInput,
    true
);

if (!is_array($input)) {

    http_response_code(400);

    echo json_encode(
        [
            "success" => false,
            "message" => "بيانات الطلب غير صالحة."
        ],
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


/* ============================================================
   USER ID
   ============================================================ */

$userId = isset($input["user_id"])
    ? (int) $input["user_id"]
    : 0;

if ($userId <= 0) {

    http_response_code(400);

    echo json_encode(
        [
            "success" => false,
            "message" => "معرف المستثمر غير صالح."
        ],
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


/* ============================================================
   HELPERS
   ============================================================ */

function jsonNumber($value): float
{
    return $value !== null ? (float) $value : 0.0;
}

function jsonInt($value): int
{
    return $value !== null ? (int) $value : 0;
}


/* ============================================================
   DATABASE OPERATIONS
   ============================================================ */

try {

    /* ========================================================
       USER
       ======================================================== */

    $userStmt = $pdo->prepare("
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

    $userStmt->execute([$userId]);

    $user = $userStmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {

        http_response_code(404);

        echo json_encode(
            [
                "success" => false,
                "message" => "المستثمر غير موجود."
            ],
            JSON_UNESCAPED_UNICODE
        );

        exit;
    }


    /* ========================================================
       PROFILE
       ======================================================== */

    $profileStmt = $pdo->prepare("
        SELECT
            id,
            user_id,
            type_investisseur,
            nom_entreprise,
            registre_commerce,
            nif,
            nis,
            wilaya,
            commune,
            adresse,
            site_web,
            secteur_activite,
            description,
            created_at,
            updated_at
        FROM investor_profiles
        WHERE user_id = ?
        LIMIT 1
    ");

    $profileStmt->execute([$userId]);

    $profile = $profileStmt->fetch(PDO::FETCH_ASSOC);


    /* ========================================================
       PROJECTS
       ======================================================== */

    $projectsStmt = $pdo->prepare("
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

            GROUP_CONCAT(
                DISTINCT s.nom
                ORDER BY s.nom
                SEPARATOR ', '
            ) AS secteurs

        FROM projects p

        LEFT JOIN project_sectors ps
            ON ps.project_id = p.id

        LEFT JOIN sectors s
            ON s.id = ps.sector_id

        WHERE p.user_id = ?

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
            p.updated_at

        ORDER BY p.created_at DESC
    ");

    $projectsStmt->execute([$userId]);

    $projects = $projectsStmt->fetchAll(PDO::FETCH_ASSOC);


    foreach ($projects as &$project) {

        $project["id"] =
            jsonInt($project["id"]);

        $project["user_id"] =
            jsonInt($project["user_id"]);

        $project["montant_investissement"] =
            jsonNumber($project["montant_investissement"]);

        $project["nombre_emplois"] =
            jsonInt($project["nombre_emplois"]);

        $project["superficie"] =
            $project["superficie"] !== null
                ? (float) $project["superficie"]
                : null;
    }

    unset($project);


    /* ========================================================
       INVESTMENTS
       ======================================================== */

    $investmentsStmt = $pdo->prepare("
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
            i.updated_at,

            p.titre AS projet_titre,
            p.wilaya AS projet_wilaya,
            p.statut AS projet_statut,
            p.montant_investissement AS projet_montant

        FROM investments i

        LEFT JOIN projects p
            ON p.id = i.project_id

        WHERE i.user_id = ?

        ORDER BY i.created_at DESC
    ");

    $investmentsStmt->execute([$userId]);

    $investments =
        $investmentsStmt->fetchAll(PDO::FETCH_ASSOC);


    foreach ($investments as &$investment) {

        $investment["id"] =
            jsonInt($investment["id"]);

        $investment["user_id"] =
            jsonInt($investment["user_id"]);

        $investment["project_id"] =
            $investment["project_id"] !== null
                ? jsonInt($investment["project_id"])
                : null;

        $investment["montant"] =
            jsonNumber($investment["montant"]);

        $investment["projet_montant"] =
            jsonNumber($investment["projet_montant"]);
    }

    unset($investment);


    /* ========================================================
       INVESTMENT REQUESTS
       ======================================================== */

    $requestsStmt = $pdo->prepare("
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

            p.titre AS projet_titre

        FROM investment_requests r

        LEFT JOIN projects p
            ON p.id = r.projet_id

        WHERE r.user_id = ?

        ORDER BY r.created_at DESC
    ");

    $requestsStmt->execute([$userId]);

    $requests =
        $requestsStmt->fetchAll(PDO::FETCH_ASSOC);


    foreach ($requests as &$request) {

        $request["id"] =
            jsonInt($request["id"]);

        $request["user_id"] =
            jsonInt($request["user_id"]);

        $request["projet_id"] =
            $request["projet_id"] !== null
                ? jsonInt($request["projet_id"])
                : null;

        $request["montant_demande"] =
            $request["montant_demande"] !== null
                ? (float) $request["montant_demande"]
                : null;

        $request["traite_par"] =
            $request["traite_par"] !== null
                ? jsonInt($request["traite_par"])
                : null;
    }

    unset($request);


    /* ========================================================
       DOCUMENTS
       ======================================================== */

    $documentsStmt = $pdo->prepare("
        SELECT
            d.id,
            d.user_id,
            d.project_id,
            d.request_id,
            d.titre,
            d.type_document,
            d.fichier,
            d.nom_original,
            d.extension,
            d.taille,
            d.statut,
            d.commentaire,
            d.uploaded_at,

            p.titre AS projet_titre

        FROM documents d

        LEFT JOIN projects p
            ON p.id = d.project_id

        WHERE d.user_id = ?

        ORDER BY d.uploaded_at DESC
    ");

    $documentsStmt->execute([$userId]);

    $documents =
        $documentsStmt->fetchAll(PDO::FETCH_ASSOC);


    foreach ($documents as &$document) {

        $document["id"] =
            jsonInt($document["id"]);

        $document["user_id"] =
            jsonInt($document["user_id"]);

        $document["project_id"] =
            $document["project_id"] !== null
                ? jsonInt($document["project_id"])
                : null;

        $document["request_id"] =
            $document["request_id"] !== null
                ? jsonInt($document["request_id"])
                : null;

        $document["taille"] =
            $document["taille"] !== null
                ? jsonInt($document["taille"])
                : null;
    }

    unset($document);


    /* ========================================================
       MESSAGES
       ======================================================== */

    $messagesStmt = $pdo->prepare("
        SELECT
            m.id,
            m.sender_id,
            m.receiver_id,
            m.sujet,
            m.contenu,
            m.lu,
            m.date_lecture,
            m.created_at,

            u.nom AS sender_nom,
            u.prenom AS sender_prenom,
            u.email AS sender_email

        FROM messages m

        LEFT JOIN users u
            ON u.id = m.sender_id

        WHERE m.receiver_id = ?

        ORDER BY m.created_at DESC
    ");

    $messagesStmt->execute([$userId]);

    $messages =
        $messagesStmt->fetchAll(PDO::FETCH_ASSOC);


    foreach ($messages as &$message) {

        $message["id"] =
            jsonInt($message["id"]);

        $message["sender_id"] =
            $message["sender_id"] !== null
                ? jsonInt($message["sender_id"])
                : null;

        $message["receiver_id"] =
            $message["receiver_id"] !== null
                ? jsonInt($message["receiver_id"])
                : null;

        $message["lu"] =
            jsonInt($message["lu"]);
    }

    unset($message);


    /* ========================================================
       NOTIFICATIONS
       ======================================================== */

    $notificationsStmt = $pdo->prepare("
        SELECT
            id,
            user_id,
            titre,
            message,
            type,
            lien,
            lu,
            date_lecture,
            created_at

        FROM notifications

        WHERE user_id = ?

        ORDER BY created_at DESC
    ");

    $notificationsStmt->execute([$userId]);

    $notifications =
        $notificationsStmt->fetchAll(PDO::FETCH_ASSOC);


    foreach ($notifications as &$notification) {

        $notification["id"] =
            jsonInt($notification["id"]);

        $notification["user_id"] =
            jsonInt($notification["user_id"]);

        $notification["lu"] =
            jsonInt($notification["lu"]);
    }

    unset($notification);


    /* ========================================================
       PROJECT STATISTICS
       ======================================================== */

    $projectsTotal =
        count($projects);

    $projectsActive = 0;

    $projectsCompleted = 0;

    $projectsInStudy = 0;

    $projectsSubmitted = 0;

    $projectsApproved = 0;

    $projectsRejected = 0;

    $projectsValue = 0;

    $totalJobs = 0;


    foreach ($projects as $project) {

        $status =
            (string) ($project["statut"] ?? "");

        $projectsValue +=
            (float) $project["montant_investissement"];

        $totalJobs +=
            (int) $project["nombre_emplois"];


        if (
            in_array(
                $status,
                [
                    "soumis",
                    "en_etude",
                    "approuve",
                    "en_cours"
                ],
                true
            )
        ) {
            $projectsActive++;
        }


        if ($status === "en_etude") {
            $projectsInStudy++;
        }


        if ($status === "soumis") {
            $projectsSubmitted++;
        }


        if ($status === "approuve") {
            $projectsApproved++;
        }


        if ($status === "realise") {
            $projectsCompleted++;
        }


        if ($status === "rejete") {
            $projectsRejected++;
        }
    }


    /* ========================================================
       INVESTMENT STATISTICS
       ======================================================== */

    $investmentsTotal =
        count($investments);

    $investmentsActive = 0;

    $investmentsCompleted = 0;

    $investmentsPending = 0;

    $investmentsCancelled = 0;

    $totalInvestment = 0;


    foreach ($investments as $investment) {

        $amount =
            (float) $investment["montant"];

        $status =
            (string) ($investment["statut"] ?? "");

        $totalInvestment +=
            $amount;


        if (
            in_array(
                $status,
                [
                    "valide",
                    "en_cours"
                ],
                true
            )
        ) {
            $investmentsActive++;
        }


        if ($status === "termine") {
            $investmentsCompleted++;
        }


        if ($status === "en_attente") {
            $investmentsPending++;
        }


        if ($status === "annule") {
            $investmentsCancelled++;
        }
    }


    /* ========================================================
       REQUEST STATISTICS
       ======================================================== */

    $requestsTotal =
        count($requests);

    $requestsPending = 0;

    $requestsAccepted = 0;

    $requestsRejected = 0;


    foreach ($requests as $request) {

        $status =
            (string) ($request["statut"] ?? "");


        if (
            in_array(
                $status,
                [
                    "nouvelle",
                    "en_cours",
                    "en_attente"
                ],
                true
            )
        ) {
            $requestsPending++;
        }


        if ($status === "acceptee") {
            $requestsAccepted++;
        }


        if ($status === "refusee") {
            $requestsRejected++;
        }
    }


    /* ========================================================
       DOCUMENT STATISTICS
       ======================================================== */

    $documentsTotal =
        count($documents);

    $documentsValidated = 0;

    $documentsPending = 0;

    $documentsRejected = 0;


    foreach ($documents as $document) {

        $status =
            (string) ($document["statut"] ?? "");


        if ($status === "valide") {
            $documentsValidated++;
        }


        if ($status === "en_attente") {
            $documentsPending++;
        }


        if ($status === "rejete") {
            $documentsRejected++;
        }
    }


    /* ========================================================
       MESSAGE STATISTICS
       ======================================================== */

    $messagesTotal =
        count($messages);

    $messagesUnread = 0;


    foreach ($messages as $message) {

        if (
            (int) $message["lu"] === 0
        ) {
            $messagesUnread++;
        }
    }


    /* ========================================================
       NOTIFICATION STATISTICS
       ======================================================== */

    $notificationsTotal =
        count($notifications);

    $notificationsUnread = 0;


    foreach ($notifications as $notification) {

        if (
            (int) $notification["lu"] === 0
        ) {
            $notificationsUnread++;
        }
    }


    /* ========================================================
       INVESTMENT RATIO
       ======================================================== */

    $investmentRatio = 0;

    if ($projectsValue > 0) {

        $investmentRatio =
            ($totalInvestment / $projectsValue) * 100;
    }

    $investmentRatio =
        round(
            min($investmentRatio, 100),
            2
        );


    /* ========================================================
       ACCOUNT COMPLETION
       ======================================================== */

    $profileCompletion = 0;

    if ($profile) {

        $profileFields = [
            "type_investisseur",
            "nom_entreprise",
            "wilaya",
            "commune",
            "adresse",
            "secteur_activite",
            "description"
        ];

        $filled = 0;

        foreach ($profileFields as $field) {

            if (
                isset($profile[$field]) &&
                trim((string) $profile[$field]) !== ""
            ) {
                $filled++;
            }
        }

        $profileCompletion =
            round(
                ($filled / count($profileFields)) * 100
            );
    }


    /* ========================================================
       LAST INVESTMENT
       ======================================================== */

    $lastInvestment =
        !empty($investments)
            ? $investments[0]
            : null;


    /* ========================================================
       LAST PROJECT
       ======================================================== */

    $lastProject =
        !empty($projects)
            ? $projects[0]
            : null;


    /* ========================================================
       LAST REQUEST
       ======================================================== */

    $lastRequest =
        !empty($requests)
            ? $requests[0]
            : null;


    /* ========================================================
       LAST MESSAGE
       ======================================================== */

    $lastMessage =
        !empty($messages)
            ? $messages[0]
            : null;


    /* ========================================================
       LAST NOTIFICATION
       ======================================================== */

    $lastNotification =
        !empty($notifications)
            ? $notifications[0]
            : null;


    /* ========================================================
       RECENT ACTIVITY
       ======================================================== */

    $activities = [];


    foreach (array_slice($projects, 0, 5) as $project) {

        $activities[] = [

            "type" =>
                "project",

            "title" =>
                "مشروع: " . $project["titre"],

            "description" =>
                "تم تسجيل المشروع في فضاء المستثمر.",

            "status" =>
                $project["statut"],

            "date" =>
                $project["created_at"]
        ];
    }


    foreach (array_slice($investments, 0, 5) as $investment) {

        $activities[] = [

            "type" =>
                "investment",

            "title" =>
                "استثمار: " .
                ($investment["projet_titre"] ?? "مشروع"),

            "description" =>
                "مبلغ الاستثمار: " .
                number_format(
                    (float) $investment["montant"],
                    2,
                    ",",
                    " "
                ) .
                " دج",

            "status" =>
                $investment["statut"],

            "date" =>
                $investment["created_at"]
        ];
    }


    foreach (array_slice($requests, 0, 5) as $request) {

        $activities[] = [

            "type" =>
                "request",

            "title" =>
                $request["objet"],

            "description" =>
                "طلب استثمار",

            "status" =>
                $request["statut"],

            "date" =>
                $request["created_at"]
        ];
    }


    foreach (array_slice($messages, 0, 5) as $message) {

        $activities[] = [

            "type" =>
                "message",

            "title" =>
                $message["sujet"],

            "description" =>
                "رسالة من " .
                trim(
                    ($message["sender_prenom"] ?? "") .
                    " " .
                    ($message["sender_nom"] ?? "")
                ),

            "status" =>
                ((int) $message["lu"] === 0)
                    ? "non_lu"
                    : "lu",

            "date" =>
                $message["created_at"]
        ];
    }


    foreach (array_slice($notifications, 0, 5) as $notification) {

        $activities[] = [

            "type" =>
                "notification",

            "title" =>
                $notification["titre"],

            "description" =>
                $notification["message"],

            "status" =>
                ((int) $notification["lu"] === 0)
                    ? "non_lu"
                    : "lu",

            "date" =>
                $notification["created_at"]
        ];
    }


    /* ========================================================
       SORT ACTIVITIES
       ======================================================== */

    usort(
        $activities,
        function ($a, $b) {

            return strtotime($b["date"])
                <=> strtotime($a["date"]);
        }
    );


    $activities =
        array_slice(
            $activities,
            0,
            10
        );


    /* ========================================================
       RESPONSE
       ======================================================== */

    echo json_encode(
        [
            "success" => true,

            "message" =>
                "تم تحميل بيانات فضاء المستثمر بنجاح.",


            /* ==================================================
               INVESTOR
               ================================================== */

            "user" => $user,

            "profile" =>
                $profile ?: null,


            /* ==================================================
               REAL STATISTICS
               ================================================== */

            "stats" => [

                "projects_total" =>
                    $projectsTotal,

                "projects_active" =>
                    $projectsActive,

                "projects_completed" =>
                    $projectsCompleted,

                "projects_in_study" =>
                    $projectsInStudy,

                "projects_submitted" =>
                    $projectsSubmitted,

                "projects_approved" =>
                    $projectsApproved,

                "projects_rejected" =>
                    $projectsRejected,

                "projects_value" =>
                    $projectsValue,

                "total_jobs" =>
                    $totalJobs,


                "investments_total" =>
                    $investmentsTotal,

                "investments_active" =>
                    $investmentsActive,

                "investments_completed" =>
                    $investmentsCompleted,

                "investments_pending" =>
                    $investmentsPending,

                "investments_cancelled" =>
                    $investmentsCancelled,

                "total_investment" =>
                    $totalInvestment,

                "investment_ratio" =>
                    $investmentRatio,


                "requests_total" =>
                    $requestsTotal,

                "requests_pending" =>
                    $requestsPending,

                "requests_accepted" =>
                    $requestsAccepted,

                "requests_rejected" =>
                    $requestsRejected,


                "documents_total" =>
                    $documentsTotal,

                "documents_validated" =>
                    $documentsValidated,

                "documents_pending" =>
                    $documentsPending,

                "documents_rejected" =>
                    $documentsRejected,


                "messages_total" =>
                    $messagesTotal,

                "messages_unread" =>
                    $messagesUnread,


                "notifications_total" =>
                    $notificationsTotal,

                "notifications_unread" =>
                    $notificationsUnread,


                "profile_completion" =>
                    $profileCompletion
            ],


            /* ==================================================
               LAST DATA
               ================================================== */

            "last" => [

                "project" =>
                    $lastProject,

                "investment" =>
                    $lastInvestment,

                "request" =>
                    $lastRequest,

                "message" =>
                    $lastMessage,

                "notification" =>
                    $lastNotification
            ],


            /* ==================================================
               DATA
               ================================================== */

            "projects" =>
                $projects,

            "investments" =>
                $investments,

            "requests" =>
                $requests,

            "documents" =>
                $documents,

            "messages" =>
                $messages,

            "notifications" =>
                $notifications,

            "activities" =>
                $activities
        ],

        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;


} catch (Throwable $e) {

    http_response_code(500);

    echo json_encode(
        [
            "success" => false,

            "message" =>
                "حدث خطأ أثناء تحميل بيانات المستثمر.",

            "error" =>
                $e->getMessage()
        ],

        JSON_UNESCAPED_UNICODE |
        JSON_UNESCAPED_SLASHES
    );

    exit;
}