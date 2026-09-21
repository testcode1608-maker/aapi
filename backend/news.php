<?php
declare(strict_types=1);
require_once __DIR__ . "/config/db.php";
$origin=$_SERVER["HTTP_ORIGIN"]??"";
$allowedOrigins=["http://localhost:5173","http://127.0.0.1:5173","http://localhost:5176","http://127.0.0.1:5176"];
if(in_array($origin,$allowedOrigins,true)){header("Access-Control-Allow-Origin: ".$origin);header("Vary: Origin");}
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");
if($_SERVER["REQUEST_METHOD"]==="OPTIONS"){http_response_code(200);exit;}
if($_SERVER["REQUEST_METHOD"]!=="GET"){http_response_code(405);echo json_encode(["success"=>false,"message"=>"Méthode non autorisée."],JSON_UNESCAPED_UNICODE);exit;}
function newsImageUrl(?string $image,int $id):?string{
  if(!$image||trim($image)==="") return null;
  $value=trim($image);
  if(preg_match('/^https?:\/\//i',$value)) return $value;
  return "/aapi-api/news-image.php?id=".$id;
}
try{
  $id=isset($_GET["id"])?(int)$_GET["id"]:0;
  if($id>0){
    $stmt=$pdo->prepare("SELECT n.id,n.titre,n.slug,n.resume,n.contenu,n.image,n.auteur_id,n.statut,n.date_publication,n.created_at,n.updated_at,CONCAT(COALESCE(u.prenom,''),' ',COALESCE(u.nom,'')) AS auteur FROM news n LEFT JOIN users u ON u.id=n.auteur_id WHERE n.id=:id AND n.statut='publie' AND (n.date_publication IS NULL OR n.date_publication<=NOW()) LIMIT 1");
    $stmt->execute(["id"=>$id]); $article=$stmt->fetch(PDO::FETCH_ASSOC);
    if(!$article){http_response_code(404);echo json_encode(["success"=>false,"message"=>"Actualité introuvable."],JSON_UNESCAPED_UNICODE);exit;}
    $article["image"]=newsImageUrl($article["image"],(int)$article["id"]);
    echo json_encode(["success"=>true,"news"=>$article],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;
  }
  $stmt=$pdo->query("SELECT n.id,n.titre,n.slug,n.resume,n.contenu,n.image,n.auteur_id,n.statut,n.date_publication,n.created_at,n.updated_at,CONCAT(COALESCE(u.prenom,''),' ',COALESCE(u.nom,'')) AS auteur FROM news n LEFT JOIN users u ON u.id=n.auteur_id WHERE n.statut='publie' AND (n.date_publication IS NULL OR n.date_publication<=NOW()) ORDER BY COALESCE(n.date_publication,n.created_at) DESC,n.id DESC");
  $rows=$stmt->fetchAll(PDO::FETCH_ASSOC);
  foreach($rows as &$row){$row["image"]=newsImageUrl($row["image"],(int)$row["id"]);} unset($row);
  echo json_encode(["success"=>true,"news"=>$rows,"total"=>count($rows)],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
}catch(PDOException $e){error_log("AAPI NEWS API ERROR: ".$e->getMessage());http_response_code(500);echo json_encode(["success"=>false,"message"=>"Impossible de charger les actualités."],JSON_UNESCAPED_UNICODE);}