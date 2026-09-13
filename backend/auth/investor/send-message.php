<?php
$origin = $_SERVER["HTTP_ORIGIN"] ?? "";
$allowed = ["http://localhost:5173","http://127.0.0.1:5173","http://localhost:5176","http://127.0.0.1:5176"];
if (in_array($origin, $allowed, true)) { header("Access-Control-Allow-Origin: {$origin}"); header("Vary: Origin"); }
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") { echo json_encode(["success"=>true]); exit; }
if ($_SERVER["REQUEST_METHOD"] !== "POST") { http_response_code(405); echo json_encode(["success"=>false,"message"=>"طريقة الطلب غير مسموحة."],JSON_UNESCAPED_UNICODE); exit; }
require_once __DIR__ . "/../../config/db.php";
function failMessage(string $message,int $code=400): void { http_response_code($code); echo json_encode(["success"=>false,"message"=>$message],JSON_UNESCAPED_UNICODE); exit; }
$input=json_decode(file_get_contents("php://input"),true);
$userId=(int)($input["user_id"]??0); $subject=trim((string)($input["sujet"]??"")); $content=trim((string)($input["contenu"]??""));
if($userId<=0||$content==="") failMessage("الرسالة فارغة.");
try{
 $q=$pdo->prepare("SELECT id FROM users WHERE id=? AND role='investisseur' AND statut='actif' LIMIT 1");$q->execute([$userId]);if(!$q->fetch())failMessage("المستثمر غير موجود أو غير نشط.",403);
 $q=$pdo->query("SELECT id FROM users WHERE role='admin' AND statut='actif' ORDER BY id ASC LIMIT 1");$admin=$q->fetch(PDO::FETCH_ASSOC);if(!$admin)failMessage("لا يوجد مسؤول نشط لاستقبال الرسالة.",503);
 $adminId=(int)$admin["id"];
 $q=$pdo->prepare("INSERT INTO messages (sender_id, receiver_id, sujet, contenu, lu) VALUES (?, ?, ?, ?, 0)");$q->execute([$userId,$adminId,$subject!==""?$subject:"رسالة من المستثمر",$content]);
 $messageId=(int)$pdo->lastInsertId();
 $q=$pdo->prepare("INSERT INTO notifications (user_id,titre,message,type,lien,lu) VALUES (?, ?, ?, 'message', ?, 0)");$q->execute([$adminId,"رسالة جديدة من مستثمر","لديك رسالة جديدة من أحد المستثمرين.","/admin/messages"]);
 echo json_encode(["success"=>true,"message"=>"تم إرسال الرسالة بنجاح.","id"=>$messageId,"receiver_id"=>$adminId],JSON_UNESCAPED_UNICODE);
}catch(Throwable $e){http_response_code(500);echo json_encode(["success"=>false,"message"=>"تعذر إرسال الرسالة.","error"=>$e->getMessage()],JSON_UNESCAPED_UNICODE);}
