<?php
declare(strict_types=1);
require_once __DIR__ . "/config/db.php";
$origin=$_SERVER["HTTP_ORIGIN"]??"";$allowed=["http://localhost:5173","http://127.0.0.1:5173","http://localhost:5176","http://127.0.0.1:5176"];
if(in_array($origin,$allowed,true)){header("Access-Control-Allow-Origin: ".$origin);header("Vary: Origin");}
header("Access-Control-Allow-Credentials: true");header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");header("Access-Control-Allow-Methods: GET, OPTIONS");header("Content-Type: application/json; charset=UTF-8");
if($_SERVER["REQUEST_METHOD"]==="OPTIONS"){http_response_code(200);exit;}
if($_SERVER["REQUEST_METHOD"]!=="GET"){http_response_code(405);echo json_encode(["success"=>false,"message"=>"Méthode non autorisée."],JSON_UNESCAPED_UNICODE);exit;}
try{
  $stmt=$pdo->query("SELECT id,secteur,icone,titre,wilaya,description,investissement,emplois,image,statut FROM opportunities WHERE statut='publie' ORDER BY id ASC");
  $rows=$stmt->fetchAll(PDO::FETCH_ASSOC);
  foreach($rows as &$row){$row["image_url"]="http://localhost/aapi-api/opportunity-image.php?id=".(int)$row["id"];}unset($row);
  echo json_encode(["success"=>true,"opportunities"=>$rows,"total"=>count($rows)],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
}catch(PDOException $e){http_response_code(500);echo json_encode(["success"=>false,"message"=>"Impossible de charger les opportunités."],JSON_UNESCAPED_UNICODE);}
