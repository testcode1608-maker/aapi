<?php
declare(strict_types=1);

require_once __DIR__ . "/../../config/db.php";

$origin=$_SERVER["HTTP_ORIGIN"]??"";
$allowed=["http://localhost:5173","http://127.0.0.1:5173","http://localhost:5176","http://127.0.0.1:5176"];
if(in_array($origin,$allowed,true)){header("Access-Control-Allow-Origin: ".$origin);header("Vary: Origin");}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");
if($_SERVER["REQUEST_METHOD"]==="OPTIONS"){http_response_code(200);exit;}

function opportunityJson(bool $ok,string $message,array $data=[],int $status=200):never{
  http_response_code($status);
  echo json_encode(array_merge(["success"=>$ok,"message"=>$message],$data),JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
  exit;
}
function opportunityAdmin(PDO $pdo,int $id):void{
  $s=$pdo->prepare("SELECT role,statut FROM users WHERE id=? LIMIT 1");$s->execute([$id]);$u=$s->fetch(PDO::FETCH_ASSOC);
  if(!$u||strtolower((string)$u["role"])!=="admin"||strtolower((string)$u["statut"])!=="actif") opportunityJson(false,"Accès administrateur refusé.",[],403);
}
function opportunityUpload(PDO $pdo,int $id):?string{
  if(!isset($_FILES["image"])||$_FILES["image"]["error"]===UPLOAD_ERR_NO_FILE)return null;
  if($_FILES["image"]["error"]!==UPLOAD_ERR_OK) opportunityJson(false,"Le téléchargement de l'image a échoué.",[],400);
  if((int)$_FILES["image"]["size"]>5*1024*1024) opportunityJson(false,"L'image ne doit pas dépasser 5 Mo.",[],400);
  $mime=(new finfo(FILEINFO_MIME_TYPE))->file($_FILES["image"]["tmp_name"]);
  $allowed=["image/jpeg"=>"jpg","image/png"=>"png","image/webp"=>"webp","image/gif"=>"gif"];
  if(!isset($allowed[$mime])) opportunityJson(false,"Format d'image non supporté.",[],400);
  $dir=__DIR__."/../../uploads/opportunities";
  if(!is_dir($dir)&&!mkdir($dir,0775,true)&&!is_dir($dir)) opportunityJson(false,"Impossible de créer le dossier des images.",[],500);
  foreach(["jpg","png","webp","gif"] as $ext){$old=$dir."/opportunity_".$id.".".$ext;if(is_file($old))@unlink($old);}
  $file=$dir."/opportunity_".$id.".".$allowed[$mime];
  if(!move_uploaded_file($_FILES["image"]["tmp_name"],$file)) opportunityJson(false,"Impossible d'enregistrer l'image.",[],500);
  return "http://localhost/aapi-api/opportunity-image.php?id=".$id;
}

try{
  if($_SERVER["REQUEST_METHOD"]==="GET" && ($_GET["action"]??"")==="opportunity_options"){
    $adminId=(int)($_GET["user_id"]??0); opportunityAdmin($pdo,$adminId);
    $sectorStmt=$pdo->query("SELECT id, nom FROM sectors ORDER BY nom ASC");
    $sectors=$sectorStmt->fetchAll(PDO::FETCH_ASSOC);
    $projectStmt=$pdo->query("SELECT id, titre, wilaya FROM projects ORDER BY titre ASC");
    $projects=$projectStmt->fetchAll(PDO::FETCH_ASSOC);
    $wilayaStmt=$pdo->query("SELECT id, code, nom_fr, nom_ar FROM wilayas WHERE statut = 'actif' ORDER BY CAST(code AS UNSIGNED) ASC");
    $wilayas=$wilayaStmt->fetchAll(PDO::FETCH_ASSOC);
    opportunityJson(true,"Options chargées depuis la base de données.",["sectors"=>$sectors,"projects"=>$projects,"wilayas"=>$wilayas]);
  }

  if($_SERVER["REQUEST_METHOD"]==="GET"){
    $adminId=(int)($_GET["user_id"]??0); opportunityAdmin($pdo,$adminId);
    $search=trim((string)($_GET["search"]??"")); $statut=trim((string)($_GET["statut"]??""));
    $sql="SELECT id,secteur,icone,titre,wilaya,description,investissement,emplois,image,statut,created_at,updated_at FROM opportunities WHERE 1=1";$p=[];
    if($search!==""){ $sql.=" AND (secteur LIKE ? OR titre LIKE ? OR wilaya LIKE ? OR description LIKE ?)";$v="%".$search."%";$p=[$v,$v,$v,$v];}
    if($statut!==""){ $sql.=" AND statut=?";$p[]=$statut; }
    $sql.=" ORDER BY id DESC";$s=$pdo->prepare($sql);$s->execute($p);$rows=$s->fetchAll(PDO::FETCH_ASSOC);
    foreach($rows as &$row){$row["image_url"]="http://localhost/aapi-api/opportunity-image.php?id=".(int)$row["id"];}unset($row);
    opportunityJson(true,"Opportunités chargées.",["opportunities"=>$rows,"stats"=>["total"=>count($rows)]]);
  }

  $contentType=$_SERVER["CONTENT_TYPE"]??"";
  $body=stripos($contentType,"multipart/form-data")===0?$_POST:json_decode(file_get_contents("php://input")?:"{}",true);
  if(!is_array($body)) opportunityJson(false,"Données invalides.",[],400);
  opportunityAdmin($pdo,(int)($body["user_id"]??0));
  $action=trim((string)($body["action"]??""));
  $fields=["secteur","icone","titre","wilaya","description","investissement","emplois","image","statut"];

  if($action==="create_opportunity"){
    foreach(["secteur","titre","wilaya","description","investissement","emplois"] as $f){if(trim((string)($body[$f]??""))==="")opportunityJson(false,"Le champ ".$f." est obligatoire.",[],400);}
    $s=$pdo->prepare("INSERT INTO opportunities (secteur,icone,titre,wilaya,description,investissement,emplois,image,statut) VALUES (?,?,?,?,?,?,?,?,?)");
    $s->execute([trim($body["secteur"]),trim($body["icone"]??"bi-buildings"),trim($body["titre"]),trim($body["wilaya"]),trim($body["description"]),trim($body["investissement"]),trim($body["emplois"]),trim($body["image"]??""),trim($body["statut"]??"publie")]);
    $id=(int)$pdo->lastInsertId();$upload=opportunityUpload($pdo,$id);
    if($upload){$pdo->prepare("UPDATE opportunities SET image=? WHERE id=?")->execute([$upload,$id]);}
    opportunityJson(true,"Opportunité créée.",["id"=>$id]);
  }

  if($action==="update_opportunity"){
    $id=(int)($body["id"]??0);if($id<=0)opportunityJson(false,"Identifiant invalide.",[],400);
    foreach(["secteur","titre","wilaya","description","investissement","emplois"] as $f){if(trim((string)($body[$f]??""))==="")opportunityJson(false,"Le champ ".$f." est obligatoire.",[],400);}
    $s=$pdo->prepare("UPDATE opportunities SET secteur=?,icone=?,titre=?,wilaya=?,description=?,investissement=?,emplois=?,image=?,statut=? WHERE id=?");
    $s->execute([trim($body["secteur"]),trim($body["icone"]??"bi-buildings"),trim($body["titre"]),trim($body["wilaya"]),trim($body["description"]),trim($body["investissement"]),trim($body["emplois"]),trim($body["image"]??""),trim($body["statut"]??"publie"),$id]);
    $upload=opportunityUpload($pdo,$id);if($upload)$pdo->prepare("UPDATE opportunities SET image=? WHERE id=?")->execute([$upload,$id]);
    opportunityJson(true,"Opportunité modifiée.");
  }

  opportunityJson(false,"Action non supportée.",[],400);
}catch(PDOException $e){error_log("AAPI OPPORTUNITIES PDO: ".$e->getMessage());opportunityJson(false,"Vérifiez la table opportunities.",[],500);}
catch(Throwable $e){error_log("AAPI OPPORTUNITIES: ".$e->getMessage());opportunityJson(false,"Une erreur interne est survenue.",[],500);}
