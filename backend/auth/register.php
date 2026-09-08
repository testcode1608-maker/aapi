<?php

/**
 * ============================================================
 * AAPI API — INSCRIPTION INVESTISSEUR
 * ============================================================
 */

require_once __DIR__ . "/../config/db.php";

/* ============================================================
   CORS
   ============================================================ */

$origin = $_SERVER["HTTP_ORIGIN"] ?? "";

if (
    preg_match(
        '/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/',
        $origin
    )
) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Vary: Origin");
}

header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

/* ============================================================
   PREFLIGHT
   ============================================================ */

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

/* ============================================================
   METHOD
   ============================================================ */

if ($_SERVER["REQUEST_METHOD"] !== "POST") {

    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "طريقة الطلب غير مسموحة."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

/* ============================================================
   READ JSON
   ============================================================ */

$rawData = file_get_contents("php://input");

$data = json_decode($rawData, true);

if (!is_array($data)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "بيانات الطلب غير صحيحة."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

/* ============================================================
   DATA
   ============================================================ */

$nom = trim($data["nom"] ?? "");
$prenom = trim($data["prenom"] ?? "");
$email = trim($data["email"] ?? "");
$telephone = trim($data["telephone"] ?? "");

$typeInvestisseur = trim(
    $data["type_investisseur"] ?? ""
);

$secteurActivite = trim(
    $data["secteur_activite"] ?? ""
);

$wilaya = trim(
    $data["wilaya"] ?? ""
);

$nomEntreprise = trim(
    $data["nom_entreprise"] ?? ""
);

$description = trim(
    $data["description"] ?? ""
);

$password = $data["password"] ?? "";
$confirmPassword = $data["confirm_password"] ?? "";

/* ============================================================
   VALIDATION
   ============================================================ */

if (
    $nom === "" ||
    $prenom === "" ||
    $email === "" ||
    $password === "" ||
    $confirmPassword === ""
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "يرجى ملء جميع الحقول المطلوبة."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

/* ============================================================
   EMAIL
   ============================================================ */

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "عنوان البريد الإلكتروني غير صحيح."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

/* ============================================================
   PASSWORD
   ============================================================ */

if (strlen($password) < 8) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

if ($password !== $confirmPassword) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "كلمتا المرور غير متطابقتين."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

/* ============================================================
   TYPE INVESTISSEUR
   ============================================================ */

$allowedTypes = [
    "personne_physique",
    "personne_morale",
    "institution",
    "investisseur_etranger"
];

if (
    $typeInvestisseur !== "" &&
    !in_array($typeInvestisseur, $allowedTypes, true)
) {

    http_response_code(400);

    echo json_encode([
        "success" => false,
        "message" => "نوع المستثمر غير صحيح."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

/* ============================================================
   DATABASE
   ============================================================ */

try {

    /* --------------------------------------------------------
       Vérifier email
       -------------------------------------------------------- */

    $checkStmt = $pdo->prepare("
        SELECT id
        FROM users
        WHERE email = ?
        LIMIT 1
    ");

    $checkStmt->execute([
        $email
    ]);

    if ($checkStmt->fetch()) {

        http_response_code(409);

        echo json_encode([
            "success" => false,
            "message" => "هذا البريد الإلكتروني مستخدم بالفعل."
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    /* --------------------------------------------------------
       Transaction
       -------------------------------------------------------- */

    $pdo->beginTransaction();

    /* --------------------------------------------------------
       Password hash
       -------------------------------------------------------- */

    $passwordHash = password_hash(
        $password,
        PASSWORD_DEFAULT
    );

    /* --------------------------------------------------------
       USER
       -------------------------------------------------------- */

    $userStmt = $pdo->prepare("
        INSERT INTO users (
            nom,
            prenom,
            email,
            password,
            telephone,
            role,
            statut,
            created_at,
            updated_at
        )
        VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            'investisseur',
            'actif',
            NOW(),
            NOW()
        )
    ");

    $userStmt->execute([
        $nom,
        $prenom,
        $email,
        $passwordHash,
        $telephone
    ]);

    $userId = (int) $pdo->lastInsertId();

    /* --------------------------------------------------------
       INVESTOR PROFILE
       -------------------------------------------------------- */

    $profileStmt = $pdo->prepare("
        INSERT INTO investor_profiles (
            user_id,
            type_investisseur,
            nom_entreprise,
            wilaya,
            secteur_activite,
            description,
            created_at,
            updated_at
        )
        VALUES (
            ?,
            ?,
            ?,
            ?,
            ?,
            ?,
            NOW(),
            NOW()
        )
    ");

    $profileStmt->execute([
        $userId,
        $typeInvestisseur !== "" ? $typeInvestisseur : null,
        $nomEntreprise !== "" ? $nomEntreprise : null,
        $wilaya !== "" ? $wilaya : null,
        $secteurActivite !== "" ? $secteurActivite : null,
        $description !== "" ? $description : null
    ]);

    /* --------------------------------------------------------
       PROJECT
       -------------------------------------------------------- */

    if ($nomEntreprise !== "") {

        $slug = strtolower(
            trim(
                preg_replace(
                    '/[^a-zA-Z0-9]+/',
                    '-',
                    $nomEntreprise
                ),
                '-'
            )
        );

        if ($slug === "") {
            $slug = "projet-" . $userId;
        }

        $slug .= "-" . $userId;

        $projectStmt = $pdo->prepare("
            INSERT INTO projects (
                user_id,
                titre,
                slug,
                description,
                wilaya,
                statut,
                created_at,
                updated_at
            )
            VALUES (
                ?,
                ?,
                ?,
                ?,
                ?,
                'brouillon',
                NOW(),
                NOW()
            )
        ");

        $projectStmt->execute([
            $userId,
            $nomEntreprise,
            $slug,
            $description !== "" ? $description : null,
            $wilaya !== "" ? $wilaya : null
        ]);
    }

    /* --------------------------------------------------------
       COMMIT
       -------------------------------------------------------- */

    $pdo->commit();

    /* --------------------------------------------------------
       RESPONSE
       -------------------------------------------------------- */

    echo json_encode([
        "success" => true,
        "message" => "تم إنشاء حساب المستثمر بنجاح.",
        "user" => [
            "id" => $userId,
            "nom" => $nom,
            "prenom" => $prenom,
            "email" => $email,
            "telephone" => $telephone,
            "role" => "investisseur",
            "statut" => "actif"
        ]
    ], JSON_UNESCAPED_UNICODE);

    exit;

} catch (Throwable $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);

    echo json_encode([
        "success" => false,
        "message" => "حدث خطأ أثناء إنشاء الحساب.",
        "error" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);

    exit;
}