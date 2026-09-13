<?php
$origin = $_SERVER["HTTP_ORIGIN"] ?? "";
$allowed = ["http://localhost:5173","http://127.0.0.1:5173","http://localhost:5176","http://127.0.0.1:5176"];
if (in_array($origin, $allowed, true)) { header("Access-Control-Allow-Origin: {$origin}"); header("Vary: Origin"); }
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { echo json_encode(["success"=>true]); exit; }
if ($_SERVER["REQUEST_METHOD"] !== "POST") { http_response_code(405); echo json_encode(["success"=>false,"message"=>"Method not allowed"], JSON_UNESCAPED_UNICODE); exit; }
require_once __DIR__ . "/../../config/db.php";
function bad(string $m,int $c=400): void { http_response_code($c); echo json_encode(["success"=>false,"message"=>$m],JSON_UNESCAPED_UNICODE); exit; }
$user=(int)($_POST["user_id"]??0); $project=!empty($_POST["projet_id"])?(int)$_POST["projet_id"]:null;
$type=trim((string)($_POST["type_demande"]??"")); $objet=trim((string)($_POST["objet"]??"")); $description=trim((string)($_POST["description"]??""));
$amount=$_POST["montant_demande"]??""; $wilaya=trim((string)($_POST["wilaya"]??"")); $priority=trim((string)($_POST["priorite"]??"normale"));
if($user<=0||$type===""||$objet==="") bad("بيانات الطلب غير مكتملة.");
if(!in_array($priority,["basse","normale","haute","urgente"],true)) $priority="normale";
try {
 $q=$pdo->prepare("SELECT id FROM users WHERE id=? AND role='investisseur' AND statut='actif' LIMIT 1"); $q->execute([$user]); if(!$q->fetch()) bad("المستثمر غير موجود أو غير نشط.",403);
 if($project!==null){$q=$pdo->prepare("SELECT id FROM projects WHERE id=? AND user_id=? LIMIT 1");$q->execute([$project,$user]);if(!$q->fetch())bad("المشروع المحدد لا ينتمي إلى هذا المستثمر.",403);}
 $pdo->beginTransaction();
 $q=$pdo->prepare("INSERT INTO investment_requests (user_id,projet_id,type_demande,objet,description,montant_demande,wilaya,statut,priorite) VALUES (?,?,?,?,?,?,?,'nouvelle',?)");
 $q->execute([$user,$project,$type,$objet,$description!==""?$description:null,$amount===""?null:(float)$amount,$wilaya!==""?$wilaya:null,$priority]);
 $requestId=(int)$pdo->lastInsertId();
 $dir=__DIR__."/../../../uploads/documents"; if(!is_dir($dir)) mkdir($dir,0775,true);
 if(isset($_FILES["documents"])&&is_array($_FILES["documents"]["name"])){
  $allowedExt=["pdf","jpg","jpeg","png","doc","docx","xls","xlsx"];
  foreach($_FILES["documents"]["name"] as $i=>$name){
   if($_FILES["documents"]["error"][$i]===UPLOAD_ERR_NO_FILE)continue;
   if($_FILES["documents"]["error"][$i]!==UPLOAD_ERR_OK)throw new RuntimeException("Erreur de téléchargement.");
   if($_FILES["documents"]["size"][$i]>10485760)throw new RuntimeException("Document trop volumineux (10 Mo maximum).");
   $original=basename((string)$name);$ext=strtolower(pathinfo($original,PATHINFO_EXTENSION));if(!in_array($ext,$allowedExt,true))throw new RuntimeException("Format de document non autorisé.");
   $file=$requestId."_".bin2hex(random_bytes(8)).".".$ext;if(!move_uploaded_file($_FILES["documents"]["tmp_name"][$i],$dir."/".$file))throw new RuntimeException("Impossible d'enregistrer le document.");
   $q=$pdo->prepare("INSERT INTO documents (user_id,project_id,request_id,titre,type_document,fichier,nom_original,extension,taille,statut) VALUES (?,?,?,?,?,?,?,?,?,'en_attente')");
   $q->execute([$user,$project,$requestId,$original,$type,"uploads/documents/".$file,$original,$ext,(int)$_FILES["documents"]["size"][$i]]);
  }
 }
 $q=$pdo->prepare("INSERT INTO notifications (user_id,titre,message,type,lien,lu) VALUES (?,?,?,?,?,0)");$q->execute([$user,"طلب جديد","تم إرسال طلبك بنجاح وهو الآن قيد المراجعة.","request","/investor/dashboard/requests"]);
 $pdo->commit(); echo json_encode(["success"=>true,"message"=>"تم إرسال الطلب بنجاح.","request"=>["id"=>$requestId,"statut"=>"nouvelle"]],JSON_UNESCAPED_UNICODE);
} catch(Throwable $e){if($pdo->inTransaction())$pdo->rollBack();http_response_code(500);echo json_encode(["success"=>false,"message"=>"تعذر إرسال الطلب.","error"=>$e->getMessage()],JSON_UNESCAPED_UNICODE);}
