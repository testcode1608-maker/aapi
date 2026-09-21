<?php
declare(strict_types=1);

require_once __DIR__ . "/../../config/db.php";

$origin = $_SERVER["HTTP_ORIGIN"] ?? "";
$allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5176",
    "http://127.0.0.1:5176",
];
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Vary: Origin");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

$body = [];
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $body = json_decode(file_get_contents("php://input") ?: "{}", true);
    $body = is_array($body) ? $body : [];
}

$userId = (int)($body["user_id"] ?? $_GET["user_id"] ?? 0);

try {
    $auth = $pdo->prepare("SELECT id, role, statut FROM users WHERE id = :id LIMIT 1");
    $auth->execute(["id" => $userId]);
    $user = $auth->fetch(PDO::FETCH_ASSOC);

    if (!$user || $user["role"] !== "admin" || $user["statut"] !== "actif") {
        http_response_code(403);
        echo json_encode(["success"=>false,"message"=>"Accès administrateur refusé."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($_SERVER["REQUEST_METHOD"] === "GET") {
        $stmt = $pdo->query("
            SELECT
                a.id,
                a.titre,
                a.slug,
                a.contenu,
                a.image,
                a.auteur_id,
                a.statut,
                a.date_publication,
                a.created_at,
                a.updated_at,
                CONCAT(COALESCE(u.prenom, ''), ' ', COALESCE(u.nom, '')) AS auteur
            FROM announcements a
            LEFT JOIN users u ON u.id = a.auteur_id
            ORDER BY COALESCE(a.date_publication, a.created_at) DESC, a.id DESC
        ");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "announcements" => $rows,
            "stats" => [
                "total" => count($rows),
                "publie" => count(array_filter($rows, fn($r) => $r["statut"] === "publie")),
                "brouillon" => count(array_filter($rows, fn($r) => $r["statut"] === "brouillon")),
                "archive" => count(array_filter($rows, fn($r) => $r["statut"] === "archive")),
            ],
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        http_response_code(405);
        echo json_encode(["success"=>false,"message"=>"Méthode non autorisée."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $action = trim((string)($body["action"] ?? ""));

    if ($action === "create_announcement") {
        $title = trim((string)($body["titre"] ?? ""));
        $content = trim((string)($body["contenu"] ?? ""));
        $image = trim((string)($body["image"] ?? ""));
        $status = trim((string)($body["statut"] ?? "publie"));
        $date = trim((string)($body["date_publication"] ?? ""));

        if ($title === "" || $content === "") {
            http_response_code(422);
            echo json_encode(["success"=>false,"message"=>"Le titre et le contenu sont obligatoires."], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if (!in_array($status, ["brouillon", "publie", "archive"], true)) {
            $status = "publie";
        }

        $slugBase = trim((string)($body["slug"] ?? ""));
        $slug = $slugBase !== ""
            ? $slugBase
            : strtolower(trim(preg_replace("/[^a-zA-Z0-9]+/", "-", iconv("UTF-8", "ASCII//TRANSLIT//IGNORE", $title) ?: $title), "-"));
        if ($slug === "") $slug = "annonce";

        $slug .= "-" . date("YmdHis");

        $publicationDate = $date !== "" ? $date : ($status === "publie" ? date("Y-m-d H:i:s") : null);

        $stmt = $pdo->prepare("
            INSERT INTO announcements
                (titre, slug, contenu, image, auteur_id, statut, date_publication)
            VALUES
                (:titre, :slug, :contenu, :image, :auteur_id, :statut, :date_publication)
        ");
        $stmt->execute([
            "titre" => $title,
            "slug" => $slug,
            "contenu" => $content,
            "image" => $image !== "" ? $image : null,
            "auteur_id" => $userId,
            "statut" => $status,
            "date_publication" => $publicationDate,
        ]);

        $id = (int)$pdo->lastInsertId();

        echo json_encode([
            "success" => true,
            "message" => "Annonce créée avec succès.",
            "id" => $id,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    http_response_code(400);
    echo json_encode(["success"=>false,"message"=>"Action inconnue."], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    error_log("AAPI ADMIN ANNOUNCEMENTS ERROR: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success"=>false,"message"=>"Impossible de traiter l'annonce."], JSON_UNESCAPED_UNICODE);
}
