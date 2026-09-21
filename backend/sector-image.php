<?php
declare(strict_types=1);

require_once __DIR__ . "/config/db.php";

$id=(int)($_GET["id"]??0);
if($id<=0){http_response_code(404);exit;}

try {
    $s=$pdo->prepare("SELECT id FROM sectors WHERE id=? LIMIT 1");
    $s->execute([$id]);
    if(!$s->fetch(PDO::FETCH_ASSOC)){http_response_code(404);exit;}
    $dir=__DIR__."/uploads/sectors";
    foreach(["jpg","png","webp","gif"] as $ext){
        $file=$dir."/sector_".$id.".".$ext;
        if(is_file($file)){
            $mime=$ext==="jpg"?"image/jpeg":"image/".$ext;
            header("Content-Type: ".$mime);
            header("Cache-Control: public, max-age=86400");
            readfile($file);
            exit;
        }
    }
} catch(Throwable $e) {
    error_log("AAPI SECTOR IMAGE ERROR: ".$e->getMessage());
}
http_response_code(404);
exit;
