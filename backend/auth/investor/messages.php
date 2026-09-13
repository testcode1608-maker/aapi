<?php
$origin=$_SERVER["HTTP_ORIGIN"]??"";$allowed=["http://localhost:5173","http://127.0.0.1:5173","http://localhost:5176","http://127.0.0.1:5176"];
if(in_array($origin,$allowed,true)){header("Access-Control-Allow-Origin: {$origin}");header("Vary: Origin");}header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");header("Access-Control-Allow-Methods: POST, OPTIONS");header("Content-Type: application/json; charset=UTF-8");
if($_SERVER["REQUEST_METHOD"]==="OPTIONS"){echo json_encode(["success"=>true]);exit;}
if($_SERVER["REQUEST_METHOD"]!=="POST"){http_response_code(405);echo json_encode(["success"=>false,"message"=>"طريقة الطلب غير مسموحة."],JSON_UNESCAPED_UNICODE);exit;}
require_once __DIR__."/../../config/db.php";$input=json_decode(file_get_contents("php://input"),true);$userId=(int)($input["user_id"]??0);if($userId<=0){http_response_code(400);echo json_encode(["success"=>false,"message"=>"معرف المستثمر غير صالح."],JSON_UNESCAPED_UNICODE);exit;}
try{
$q=$pdo->prepare("SELECT id FROM users WHERE id=? AND role='investisseur' AND statut='actif' LIMIT 1");$q->execute([$userId]);if(!$q->fetch()){http_response_code(403);echo json_encode(["success"=>false,"message"=>"المستثمر غير موجود أو غير نشط."],JSON_UNESCAPED_UNICODE);exit;}
$q=$pdo->prepare("SELECT m.id,m.sender_id,m.receiver_id,m.sujet,m.contenu,m.lu,m.date_lecture,m.created_at,s.nom sender_nom,s.prenom sender_prenom,s.email sender_email,r.nom receiver_nom,r.prenom receiver_prenom,r.email receiver_email FROM messages m LEFT JOIN users s ON s.id=m.sender_id LEFT JOIN users r ON r.id=m.receiver_id WHERE m.sender_id=? OR m.receiver_id=? ORDER BY m.created_at ASC");$q->execute([$userId,$userId]);$messages=$q->fetchAll(PDO::FETCH_ASSOC);
$q=$pdo->prepare("UPDATE messages SET lu=1,date_lecture=NOW() WHERE receiver_id=? AND lu=0");$q->execute([$userId]);
foreach($messages as &$m){$m["id"]=(int)$m["id"];$m["sender_id"]=(int)$m["sender_id"];$m["receiver_id"]=(int)$m["receiver_id"];$m["lu"]=(int)$m["lu"];}unset($m);
echo json_encode(["success"=>true,"messages"=>$messages],JSON_UNESCAPED_UNICODE);
}catch(Throwable $e){http_response_code(500);echo json_encode(["success"=>false,"message"=>"تعذر تحميل الرسائل.","error"=>$e->getMessage()],JSON_UNESCAPED_UNICODE);}
