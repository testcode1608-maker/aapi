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

function faqJson(bool $success, string $message, array $data = [], int $status = 200): never {
    http_response_code($status);
    echo json_encode(array_merge(["success"=>$success,"message"=>$message], $data), JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
    exit;
}
function faqAdmin(PDO $pdo, int $id): void {
    $s=$pdo->prepare("SELECT id,role,statut FROM users WHERE id=? LIMIT 1");
    $s->execute([$id]);
    $u=$s->fetch(PDO::FETCH_ASSOC);
    if (!$u || strtolower((string)$u["role"])!=="admin" || strtolower((string)$u["statut"])!=="actif") {
        faqJson(false,"Accès administrateur refusé.",[],403);
    }
}

try {
    $method=$_SERVER["REQUEST_METHOD"];
    $body=[];
    if ($method==="POST") {
        $body=json_decode(file_get_contents("php://input") ?: "{}", true);
        if (!is_array($body)) $body=[];
    }
    $adminId=(int)($body["user_id"] ?? $_GET["user_id"] ?? 0);
    faqAdmin($pdo,$adminId);

    if ($method==="GET") {
        $search=trim((string)($_GET["search"]??""));
        $status=trim((string)($_GET["statut"]??""));
        $sql="SELECT id,question,answer,statut,ordre,created_at,updated_at FROM investor_faq WHERE 1=1";
        $params=[];
        if ($search!=="") {
            $sql.=" AND (question LIKE ? OR answer LIKE ?)";
            $v="%".$search."%"; $params=[$v,$v];
        }
        if ($status!=="" && in_array($status,["publie","brouillon","archive"],true)) {
            $sql.=" AND statut=?";
            $params[]=$status;
        }
        $sql.=" ORDER BY ordre ASC,id ASC";
        $s=$pdo->prepare($sql); $s->execute($params);
        $rows=$s->fetchAll(PDO::FETCH_ASSOC);
        faqJson(true,"FAQ chargée avec succès.",[
            "faq"=>$rows,
            "stats"=>[
                "total"=>count($rows),
                "publie"=>count(array_filter($rows,fn($r)=>$r["statut"]==="publie")),
                "brouillon"=>count(array_filter($rows,fn($r)=>$r["statut"]==="brouillon")),
                "archive"=>count(array_filter($rows,fn($r)=>$r["statut"]==="archive"))
            ]
        ]);
    }

    if ($method!=="POST") faqJson(false,"Méthode non autorisée.",[],405);

    $action=trim((string)($body["action"]??""));
    if ($action==="create_faq") {
        $question=trim((string)($body["question"]??""));
        $answer=trim((string)($body["answer"]??""));
        $status=trim((string)($body["statut"]??"publie"));
        $ordre=(int)($body["ordre"]??0);
        if ($question==="" || $answer==="") faqJson(false,"La question et la réponse sont obligatoires.",[],422);
        if (!in_array($status,["publie","brouillon","archive"],true)) $status="publie";
        if ($ordre<=0) {
            $m=$pdo->query("SELECT COALESCE(MAX(ordre),0)+1 FROM investor_faq");
            $ordre=(int)$m->fetchColumn();
        }
        $s=$pdo->prepare("INSERT INTO investor_faq (question,answer,statut,ordre) VALUES (?,?,?,?)");
        $s->execute([$question,$answer,$status,$ordre]);
        faqJson(true,"FAQ ajoutée avec succès.",["id"=>(int)$pdo->lastInsertId()]);
    }

    if ($action==="update_faq") {
        $id=(int)($body["id"]??0);
        $question=trim((string)($body["question"]??""));
        $answer=trim((string)($body["answer"]??""));
        $status=trim((string)($body["statut"]??"publie"));
        $ordre=(int)($body["ordre"]??0);
        if ($id<=0 || $question==="" || $answer==="") faqJson(false,"La question et la réponse sont obligatoires.",[],422);
        if (!in_array($status,["publie","brouillon","archive"],true)) $status="publie";
        $s=$pdo->prepare("UPDATE investor_faq SET question=?,answer=?,statut=?,ordre=? WHERE id=?");
        $s->execute([$question,$answer,$status,$ordre,$id]);
        if ($s->rowCount()===0) {
            $check=$pdo->prepare("SELECT id FROM investor_faq WHERE id=? LIMIT 1"); $check->execute([$id]);
            if (!$check->fetch()) faqJson(false,"FAQ introuvable.",[],404);
        }
        faqJson(true,"FAQ modifiée avec succès.");
    }

    faqJson(false,"Action FAQ inconnue.",[],400);
} catch (PDOException $e) {
    error_log("AAPI ADMIN FAQ PDO ERROR: ".$e->getMessage());
    faqJson(false,"Impossible de traiter la FAQ. Vérifiez que la table investor_faq existe.",[],500);
} catch (Throwable $e) {
    error_log("AAPI ADMIN FAQ ERROR: ".$e->getMessage());
    faqJson(false,"Une erreur interne est survenue pour la FAQ.",[],500);
}
