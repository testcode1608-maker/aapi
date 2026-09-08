<?php

require_once __DIR__ . "/config/db.php";

echo json_encode([
    "success" => true,
    "message" => "Connexion MySQL AAPI réussie.",
    "database" => "aapi_db"
], JSON_UNESCAPED_UNICODE);