<?php
/**
 * AAPI API — CREATE INVESTMENT REQUEST
 * POST multipart/form-data
 *
 * Fields:
 * user_id, projet_id, type_demande, objet, description,
 * montant_demande, wilaya, priorite, documents[]
 */

$origin = $_SERVER["HTTP_ORIGIN"] ?? "";
$allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5176",
    "http://127.0.0.1:5176",
];

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: {$origin}");
    header("Vary: Origin");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    echo json_encode(["success" => true, "message" => "CORS OK"], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "طريقة الطلب غير مسموحة."], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once __DIR__ . "/../../config/db.php";

function failRequest(string $message, int $code = 400): void {
    http_response_code($code);
    echo json_encode(["success" => false, "message" => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

$userId = (int)($_POST["user_id"] ?? 0);
$projectId = !empty($_POST["projet_id"]) ? (int)$_POST["projet_id"] : null;
$type = trim((string)($_POST["type_demande"] ?? ""));
$objet = trim((string)($_POST["objet"] ?? ""));
$description = trim((string)($_POST["description"] ?? ""));\$amount = $_POST["montant_demande"] ?? "";
$wilaya = trim((string)($_POST["wilaya"] ?? ""));
$priorite = trim((string)($_POST["priorite"] ?? "normale"));

if ($userId <= 0) failRequest("معرف المستثمر غير صالح.");
if ($type === "" || $objet === "") failRequest("نوع الطلب وموضوع الطلب إجباريان.");
if (!in_array($priorite, ["basse", "normale", "haute", "urgente"], true)) $priorite = "normale";

$amountValue = $amount === "" ? null : (float)$amount;
if ($amountValue !== null && $amountValue < 0) failRequest("مبلغ الطلب غير صالح.");

try {
    $userStmt = $pdo->prepare("SELECT id FROM users WHERE id = ? AND role = 'investisseur' AND statut = 'actif' LIMIT 1");
    $userStmt->execute([$userId]);
    if (!$userStmt->fetch()) failRequest("المستثمر غير موجود أو غير نشط.", 403);

    if ($projectId !== null) {
        $projectStmt = $pdo->prepare("SELECT id, statut FROM projects WHERE id = ? AND user_id = ? LIMIT 1");
        $projectStmt->execute([$projectId, $userId]);
        if (!$projectStmt->fetch()) failRequest("المشروع sélectionné n'appartient pas à cet investisseur.", 403);
    }

    $pdo->beginTransaction();

    $reference = "DEM-" . date("Ymd") . "-" . strtoupper(bin2hex(random_bytes(4)));

    $requestStmt = $pdo->prepare("INSERT INTO investment_requests
        (user_id, projet_id, type_demande, objet, description, montant_demande, wilaya, statut, priorite)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'nouvelle', ?)");
    $requestStmt->execute([
        $userId,
        $projectId,
        $type,
        $objet,
        $description !== "" ? $description : null,
        $amountValue,
        $wilaya !== "" ? $wilaya : null,
        $priorite,
    ]);

    $requestId = (int)$pdo->lastInsertId();

    $uploadDir = __DIR__ . "/../../../uploads/documents";
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
        throw new RuntimeException("Impossible de créer le dossier des documents.");
    }

    if (isset($_FILES["documents"]) && is_array($_FILES["documents"]["name"])) {
        $allowed = ["pdf", "jpg", "jpeg", "png", "doc", "docx", "xls", "xlsx"];
        $count = count($_FILES["documents"]["name"]);

        for ($i = 0; $i < $count; $i++) {
            if ($_FILES["documents"]["error"][$i] === UPLOAD_ERR_NO_FILE) continue;
            if ($_FILES["documents"]["error"][$i] !== UPLOAD_ERR_OK) {
                throw new RuntimeException("Erreur lors du téléchargement d'un document.");
            }
            if ($_FILES["documents"]["size"][$i] > 10 * 1024 * 1024) {
                throw new RuntimeException("Chaque document doit être inférieur à 10 Mo.");
            }

            $original = basename((string)$_FILES["documents"]["name"][$i]);
            $extension = strtolower(pathinfo($original, PATHINFO_EXTENSION));
            if (!in_array($extension, $allowed, true)) {
                throw new RuntimeException("Format de document non autorisé.");
            }

            $safeName = $requestId . "_" . bin2hex(random_bytes(8)) . "." . $extension;
            $relativePath = "uploads/documents/" . $safeName;
            $target = $uploadDir . "/" . $safeName;

            if (!move_uploaded_file($_FILES["documents"]["tmp_name"][$i], $target)) {
                throw new RuntimeException("Impossible d'enregistrer le document.");
            }

            $documentStmt = $pdo->prepare("INSERT INTO documents
                (user_id, project_id, request_id, titre, type_document, fichier, nom_original, extension, taille, statut)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'en_attente')");
            $documentStmt->execute([
                $userId,
                $projectId,
                $requestId,
                $original,
                $type,
                $relativePath,
                $original,
                $extension,
                (int)$_FILES["documents"]["size"][$i],
            ]);
        }
    }

    $notificationStmt = $pdo->prepare("INSERT INTO notifications (user_id, titre, message, type, lien, lu) VALUES (?, ?, ?, 'request', ?, 0)");
    $notificationStmt->execute([
        $userId,
        "طلب جديد",
        "تم إرسال طلبك بنجاح وهو الآن قيد المراجعة.",
        "/investor/dashboard/requests",
    ]);

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "تم إرسال الطلب بنجاح.",
        "request" => ["id" => $requestId, "reference" => $reference, "statut" => "nouvelle"],
    ], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "تعذر إرسال الطلب.",
        "error" => $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE);
}
