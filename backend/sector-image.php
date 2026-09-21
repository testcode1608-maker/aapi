<?php
declare(strict_types=1);

require_once __DIR__ . "/config/db.php";

$id=(int)($_GET["id"]??0);
if($id<=0){http_response_code(404);exit;}

try {
    $s=$pdo->prepare("SELECT id, slug FROM sectors WHERE id=? LIMIT 1");
    $s->execute([$id]);
    $sector=$s->fetch(PDO::FETCH_ASSOC);
    if(!$sector){http_response_code(404);exit;}

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

    // Photo distante de démonstration : une image réelle et différente par secteur.
    // Les uploads locaux restent prioritaires.
    $photos = [
        "industrie" => "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
        "agriculture" => "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=1200&q=80",
        "agroalimentaire" => "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
        "energies-renouvelables" => "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
        "energie-hydrocarbures" => "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1200&q=80",
        "technologie-numerique" => "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
        "intelligence-artificielle" => "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
        "tourisme" => "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1200&q=80",
        "transport-logistique" => "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=1200&q=80",
        "eau-environnement" => "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        "sante" => "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
        "industrie-pharmaceutique" => "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
        "immobilier-services" => "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
        "construction-btp" => "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
        "mines-metaux" => "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1200&q=80",
        "peche-aquaculture" => "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
        "textile-habillement" => "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80",
        "automobile-equipements" => "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
        "electronique-electrotechnique" => "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
        "services-financiers-professionnels" => "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80"
    ];

    $slug=(string)$sector["slug"];
    if(isset($photos[$slug])){
        header("Cache-Control: public, max-age=86400");
        header("Location: ".$photos[$slug], true, 302);
        exit;
    }

} catch(Throwable $e) {
    error_log("AAPI SECTOR IMAGE ERROR: ".$e->getMessage());
}
http_response_code(404);
exit;
