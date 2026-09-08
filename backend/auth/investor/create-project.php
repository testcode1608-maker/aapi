<?php

/**
 * ============================================================
 * AAPI — INVESTOR CREATE PROJECT API
 * ============================================================
 */

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

header("Content-Type: application/json; charset=UTF-8");

$origin = $_SERVER["HTTP_ORIGIN"] ?? "";

$allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5176",
    "http://127.0.0.1:5176",
];

if ($origin !== "" && in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Access-Control-Allow-Credentials: true");
} else {
    /*
     * Pour le développement local.
     */
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");

/*
|--------------------------------------------------------------------------
| OPTIONS — CORS
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);

    echo json_encode([
        "success" => true,
        "message" => "CORS OK"
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

/*
|--------------------------------------------------------------------------
| POST uniquement
|--------------------------------------------------------------------------
*/

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Méthode non autorisée."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

/*
|--------------------------------------------------------------------------
| Tout le traitement dans try
|--------------------------------------------------------------------------
*/

try {

    /*
    |--------------------------------------------------------------------------
    | Connexion DB
    |--------------------------------------------------------------------------
    */

    require_once __DIR__ . "/../../config/db.php";

    if (!isset($pdo) || !($pdo instanceof PDO)) {
        throw new Exception(
            "La connexion à la base de données n'est pas disponible."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Lecture JSON
    |--------------------------------------------------------------------------
    */

    $rawInput = file_get_contents("php://input");

    if ($rawInput === false || trim($rawInput) === "") {
        throw new Exception("Aucune donnée reçue.");
    }

    $data = json_decode($rawInput, true);

    if (!is_array($data)) {
        throw new Exception("Données JSON invalides.");
    }

    /*
    |--------------------------------------------------------------------------
    | Récupération des données
    |--------------------------------------------------------------------------
    */

    $userId = isset($data["user_id"])
        ? (int)$data["user_id"]
        : 0;

    $titre = trim((string)($data["titre"] ?? ""));
    $description = trim((string)($data["description"] ?? ""));
    $wilaya = trim((string)($data["wilaya"] ?? ""));
    $commune = trim((string)($data["commune"] ?? ""));
    $adresse = trim((string)($data["adresse"] ?? ""));

    $montantInvestissement =
        $data["montant_investissement"] ?? 0;

    $nombreEmplois =
        $data["nombre_emplois"] ?? 0;

    $superficie =
        $data["superficie"] ?? null;

    $uniteSuperficie =
        trim((string)($data["unite_superficie"] ?? "m²"));

    $sectorId =
        isset($data["sector_id"]) &&
        $data["sector_id"] !== null &&
        $data["sector_id"] !== ""
            ? (int)$data["sector_id"]
            : 0;

    $dateDebut =
        trim((string)($data["date_debut"] ?? ""));

    $dateFin =
        trim((string)($data["date_fin"] ?? ""));

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if ($userId <= 0) {
        throw new Exception(
            "Identifiant investisseur invalide."
        );
    }

    if ($titre === "") {
        throw new Exception(
            "Le titre du projet est obligatoire."
        );
    }

    if ($description === "") {
        throw new Exception(
            "La description du projet est obligatoire."
        );
    }

    if ($wilaya === "") {
        throw new Exception(
            "La wilaya est obligatoire."
        );
    }

    if (
        !is_numeric($montantInvestissement) ||
        (float)$montantInvestissement <= 0
    ) {
        throw new Exception(
            "Le montant d'investissement doit être supérieur à zéro."
        );
    }

    if (
        !is_numeric($nombreEmplois) ||
        (int)$nombreEmplois < 0
    ) {
        throw new Exception(
            "Le nombre d'emplois est invalide."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Superficie
    |--------------------------------------------------------------------------
    */

    if (
        $superficie === null ||
        $superficie === ""
    ) {
        $superficie = null;
    } else {

        if (
            !is_numeric($superficie) ||
            (float)$superficie < 0
        ) {
            throw new Exception(
                "La superficie est invalide."
            );
        }

        $superficie = (float)$superficie;
    }

    /*
    |--------------------------------------------------------------------------
    | Dates
    |--------------------------------------------------------------------------
    */

    $dateDebut =
        $dateDebut !== ""
            ? $dateDebut
            : null;

    $dateFin =
        $dateFin !== ""
            ? $dateFin
            : null;

    if (
        $dateDebut !== null &&
        $dateFin !== null &&
        strtotime($dateFin) < strtotime($dateDebut)
    ) {
        throw new Exception(
            "La date de fin doit être supérieure ou égale à la date de début."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Conversion
    |--------------------------------------------------------------------------
    */

    $montantInvestissement =
        (float)$montantInvestissement;

    $nombreEmplois =
        (int)$nombreEmplois;

    if ($uniteSuperficie === "") {
        $uniteSuperficie = "m²";
    }

    /*
    |--------------------------------------------------------------------------
    | Vérification investisseur
    |--------------------------------------------------------------------------
    */

    $stmtUser = $pdo->prepare("
        SELECT
            id,
            nom,
            prenom,
            email,
            role,
            statut
        FROM users
        WHERE id = :id
        LIMIT 1
    ");

    $stmtUser->execute([
        ":id" => $userId
    ]);

    $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception(
            "Investisseur introuvable."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Vérification rôle
    |--------------------------------------------------------------------------
    */

    if (($user["role"] ?? "") !== "investisseur") {
        throw new Exception(
            "Cet utilisateur n'est pas autorisé à créer un projet."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Vérification statut
    |--------------------------------------------------------------------------
    */

    if (
        isset($user["statut"]) &&
        $user["statut"] !== "actif"
    ) {
        throw new Exception(
            "Votre compte investisseur n'est pas actif."
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Vérification secteur
    |--------------------------------------------------------------------------
    */

    if ($sectorId > 0) {

        $stmtSector = $pdo->prepare("
            SELECT
                id,
                nom
            FROM sectors
            WHERE id = :id
              AND statut = 'actif'
            LIMIT 1
        ");

        $stmtSector->execute([
            ":id" => $sectorId
        ]);

        $sector = $stmtSector->fetch(PDO::FETCH_ASSOC);

        if (!$sector) {
            throw new Exception(
                "Le secteur sélectionné est invalide."
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Génération du slug
    |--------------------------------------------------------------------------
    */

    $slugBase = strtolower($titre);

    if (function_exists("iconv")) {
        $converted = iconv(
            "UTF-8",
            "ASCII//TRANSLIT//IGNORE",
            $slugBase
        );

        if ($converted !== false) {
            $slugBase = $converted;
        }
    }

    $slugBase = preg_replace(
        "/[^a-zA-Z0-9]+/",
        "-",
        $slugBase
    );

    $slugBase = trim(
        $slugBase,
        "-"
    );

    if ($slugBase === "") {
        $slugBase = "projet";
    }

    $slug =
        $slugBase .
        "-" .
        $userId .
        "-" .
        time();

    /*
    |--------------------------------------------------------------------------
    | Transaction
    |--------------------------------------------------------------------------
    */

    $pdo->beginTransaction();

    /*
    |--------------------------------------------------------------------------
    | Création du projet
    |--------------------------------------------------------------------------
    */

    $stmtProject = $pdo->prepare("
        INSERT INTO projects (
            user_id,
            titre,
            slug,
            description,
            wilaya,
            commune,
            adresse,
            montant_investissement,
            nombre_emplois,
            superficie,
            unite_superficie,
            statut,
            image,
            date_debut,
            date_fin,
            created_at,
            updated_at
        )
        VALUES (
            :user_id,
            :titre,
            :slug,
            :description,
            :wilaya,
            :commune,
            :adresse,
            :montant_investissement,
            :nombre_emplois,
            :superficie,
            :unite_superficie,
            'soumis',
            NULL,
            :date_debut,
            :date_fin,
            NOW(),
            NOW()
        )
    ");

    $stmtProject->execute([
        ":user_id" =>
            $userId,

        ":titre" =>
            $titre,

        ":slug" =>
            $slug,

        ":description" =>
            $description,

        ":wilaya" =>
            $wilaya,

        ":commune" =>
            $commune !== ""
                ? $commune
                : null,

        ":adresse" =>
            $adresse !== ""
                ? $adresse
                : null,

        ":montant_investissement" =>
            $montantInvestissement,

        ":nombre_emplois" =>
            $nombreEmplois,

        ":superficie" =>
            $superficie,

        ":unite_superficie" =>
            $uniteSuperficie,

        ":date_debut" =>
            $dateDebut,

        ":date_fin" =>
            $dateFin
    ]);

    $projectId =
        (int)$pdo->lastInsertId();

    /*
    |--------------------------------------------------------------------------
    | Liaison secteur
    |--------------------------------------------------------------------------
    */

    if ($sectorId > 0) {

        $stmtProjectSector = $pdo->prepare("
            INSERT INTO project_sectors (
                project_id,
                sector_id
            )
            VALUES (
                :project_id,
                :sector_id
            )
        ");

        $stmtProjectSector->execute([
            ":project_id" =>
                $projectId,

            ":sector_id" =>
                $sectorId
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Notification
    |--------------------------------------------------------------------------
    |
    | La notification ne doit pas empêcher
    | la création du projet si la table possède
    | une structure différente.
    |
    */

    try {

        $stmtNotification = $pdo->prepare("
            INSERT INTO notifications (
                user_id,
                titre,
                message,
                type,
                lien,
                lu,
                created_at
            )
            VALUES (
                :user_id,
                :titre,
                :message,
                'projet',
                :lien,
                0,
                NOW()
            )
        ");

        $stmtNotification->execute([
            ":user_id" =>
                $userId,

            ":titre" =>
                "Projet soumis",

            ":message" =>
                "Votre projet « " .
                $titre .
                " » a été soumis avec succès et sera examiné par l'administration.",

            ":lien" =>
                "/investor/dashboard/projects"
        ]);

    } catch (Throwable $notificationError) {

        /*
         * On ne bloque pas la création du projet
         * si la notification échoue.
         */
    }

    /*
    |--------------------------------------------------------------------------
    | Commit
    |--------------------------------------------------------------------------
    */

    $pdo->commit();

    /*
    |--------------------------------------------------------------------------
    | Réponse succès
    |--------------------------------------------------------------------------
    */

    http_response_code(200);

    echo json_encode([
        "success" => true,
        "message" =>
            "Votre projet a été créé et soumis avec succès.",

        "project_id" =>
            $projectId,

        "project" => [
            "id" =>
                $projectId,

            "user_id" =>
                $userId,

            "titre" =>
                $titre,

            "slug" =>
                $slug,

            "description" =>
                $description,

            "wilaya" =>
                $wilaya,

            "commune" =>
                $commune,

            "adresse" =>
                $adresse,

            "montant_investissement" =>
                $montantInvestissement,

            "nombre_emplois" =>
                $nombreEmplois,

            "superficie" =>
                $superficie,

            "unite_superficie" =>
                $uniteSuperficie,

            "sector_id" =>
                $sectorId > 0
                    ? $sectorId
                    : null,

            "statut" =>
                "soumis",

            "date_debut" =>
                $dateDebut,

            "date_fin" =>
                $dateFin
        ]

    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (Throwable $e) {

    /*
    |--------------------------------------------------------------------------
    | Rollback
    |--------------------------------------------------------------------------
    */

    if (
        isset($pdo) &&
        $pdo instanceof PDO &&
        $pdo->inTransaction()
    ) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" =>
            "Erreur lors de la création du projet.",

        "error" =>
            $e->getMessage()
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    exit;
}