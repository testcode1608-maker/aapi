<?php
declare(strict_types=1);
require_once __DIR__ . "/config/db.php";
$id=(int)($_GET["id"]??0);if($id<=0){http_response_code(404);exit;}
try{
 $s=$pdo->prepare("SELECT image FROM opportunities WHERE id=? LIMIT 1");$s->execute([$id]);$row=$s->fetch(PDO::FETCH_ASSOC);if(!$row){http_response_code(404);exit;}
 $dir=__DIR__."/uploads/opportunities";
 foreach(["jpg","png","webp","gif"] as $ext){$file=$dir."/opportunity_".$id.".".$ext;if(is_file($file)){header("Content-Type",$ext==="jpg"?"image/jpeg":"image/".$ext);header("Cache-Control: public, max-age=86400");readfile($file);exit;}}
 $url=trim((string)($row["image"]??""));if($url!==""&&preg_match('/^https?:\\/\\//i',$url)){header("Cache-Control: public, max-age=86400");header("Location: ".$url,true,302);exit;}
}catch(Throwable $e){error_log("AAPI OPPORTUNITY IMAGE: ".$e->getMessage());}
http_response_code(404);exit;
