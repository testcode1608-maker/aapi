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

    // Démo: si aucune photo locale n'est encore uploadée,
    // fournir automatiquement une photo thématique.
    $keywords=[
        "industrie"=>"industry-factory",
        "agriculture"=>"agriculture-farm",
        "agroalimentaire"=>"food-industry",
        "energies-renouvelables"=>"solar-energy",
        "energie-hydrocarbures"=>"energy-industry",
        "technologie-numerique"=>"technology",
        "intelligence-artificielle"=>"artificial-intelligence",
        "tourisme"=>"tourism",
        "transport-logistique"=>"logistics",
        "eau-environnement"=>"water-environment",
        "sante"=>"hospital-healthcare",
        "industrie-pharmaceutique"=>"pharmaceutical",
        "immobilier-services"=>"real-estate",
        "construction-btp"=>"construction",
        "mines-metaux"=>"mining",
        "peche-aquaculture"=>"fishing",
        "textile-habillement"=>"textile-factory",
        "automobile-equipements"=>"automotive",
        "electronique-electrotechnique"=>"electronics",
        "services-financiers-professionnels"=>"business-finance"
    ];

    $slug=(string)$sector["slug"];
    if(isset($keywords[$slug])){
        $url="https://loremflickr.com/1200/800/".rawurlencode($keywords[$slug])."?lock=".$id;
        header("Location: ".$url, true, 302);
        exit;
    }
} catch(Throwable $e) {
    error_log("AAPI SECTOR IMAGE ERROR: ".$e->getMessage());
}
http_response_code(404);
exit;
