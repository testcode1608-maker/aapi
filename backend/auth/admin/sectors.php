<?php
declare(strict_types=1);

require_once __DIR__ . "/../../config/db.php";

$origin = $_SERVER["HTTP_ORIGIN"] ?? "";
$allowedOrigins = ["http://localhost:5173","http://127.0.0.1:5173","http://localhost:5176","http://127.0.0.1:5176"];
if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: ".$origin);
    header("Vary: Origin");
}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { http_response_code(200); exit; }

function sectorJson(bool $success, string $message, array $data = [], int $status = 200): never {
    http_response_code($status);
    echo json_encode(array_merge(["success"=>$success,"message"=>$message],$data), JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
    exit;
}
function sectorAdmin(PDO $pdo, int $id): void {
    $s=$pdo->prepare("SELECT id,role,statut FROM users WHERE id=? LIMIT 1");
    $s->execute([$id]); $u=$s->fetch(PDO::FETCH_ASSOC);
    if (!$u || strtolower((string)$u["role"])!=="admin" || strtolower((string)$u["statut"])!=="actif") sectorJson(false,"Accès administrateur refusé.",[],403);
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $adminId=(int)($_GET["user_id"]??0); sectorAdmin($pdo,$adminId);
    $search=trim((string)($_GET["search"]??""));
    $sql="SELECT id, nom, description FROM sectors WHERE 1=1"; $params=[];
    if ($search!=="") { $sql.=" AND (nom LIKE ? OR description LIKE ?)"; $v="%".$search."%"; $params=[$v,$v]; }
    $sql.=" ORDER BY nom ASC";
    $s=$pdo->prepare($sql); $s->execute($params); $rows=$s->fetchAll(PDO::FETCH_ASSOC);
    sectorJson(true,"Secteurs chargés avec succès.",["sectors"=>$rows,"stats"=>["total"=>count($rows)]]);
}

$body=json_decode(file_get_contents("php://input") ?: "{}",true);
if (!is_array($body)) sectorJson(false,"Données invalides.",[],400);
$adminId=(int)($body["user_id"]??0); sectorAdmin($pdo,$adminId);
$action=trim((string)($body["action"]??""));

if ($action==="create_sector") {
    $nom=trim((string)($body["nom"]??"")); $description=trim((string)($body["description"]??""));
    if ($nom==="") sectorJson(false,"Le nom du secteur est obligatoire.",[],400);
    $check=$pdo->prepare("SELECT id FROM sectors WHERE nom=? LIMIT 1"); $check->execute([$nom]);
    if ($check->fetch()) sectorJson(false,"Ce secteur existe déjà.",[],409);
    $s=$pdo->prepare("INSERT INTO sectors (nom, description) VALUES (?, ?)");
    $s->execute([$nom,$description]);
    sectorJson(true,"Secteur créé avec succès.",["id"=>(int)$pdo->lastInsertId()]);
}
sectorJson(false,"Action non supportée.",[],400);
