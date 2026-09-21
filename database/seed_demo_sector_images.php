<?php
/**
 * AAPI - Télécharge 20 photos provisionnelles pour les secteurs.
 *
 * Usage:
 *   php database/seed_demo_sector_images.php
 *
 * Le script cherche les secteurs par slug et enregistre:
 *   backend/uploads/sectors/sector_<id>.jpg
 *
 * Les images proviennent de LoremFlickr et sont uniquement destinées
 * aux données de démonstration. Remplace-les par tes propres photos
 * en production.
 */

declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');

require_once __DIR__ . '/../backend/config/db.php';

$pdo = null;
if (isset($conn) && $conn instanceof PDO) {
    $pdo = $conn;
} elseif (isset($pdo) && $pdo instanceof PDO) {
    // already available
}

if (!$pdo) {
    die("Erreur: connexion PDO introuvable dans backend/config/database.php\n");
}

$keywords = [
    'industrie',
    'agriculture',
    'food-industry',
    'solar-energy',
    'energy-industry',
    'technology',
    'artificial-intelligence',
    'tourism',
    'logistics',
    'water-environment',
    'hospital',
    'pharmaceutical',
    'real-estate',
    'construction',
    'mining',
    'fishing-aquaculture',
    'textile-factory',
    'automotive',
    'electronics',
    'business-finance',
];

$slugs = [
    'industrie',
    'agriculture',
    'agroalimentaire',
    'energies-renouvelables',
    'energie-hydrocarbures',
    'technologie-numerique',
    'intelligence-artificielle',
    'tourisme',
    'transport-logistique',
    'eau-environnement',
    'sante',
    'industrie-pharmaceutique',
    'immobilier-services',
    'construction-btp',
    'mines-metaux',
    'peche-aquaculture',
    'textile-habillement',
    'automobile-equipements',
    'electronique-electrotechnique',
    'services-financiers-professionnels',
];

$uploadDir = __DIR__ . '/../backend/uploads/sectors';
if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true)) {
    die("Erreur: impossible de créer $uploadDir\n");
}

$stmt = $pdo->prepare('SELECT id, nom FROM sectors WHERE slug = ? LIMIT 1');

foreach ($slugs as $index => $slug) {
    $stmt->execute([$slug]);
    $sector = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$sector) {
        echo "[IGNORÉ] Secteur introuvable: {$slug}\n";
        continue;
    }

    $id = (int) $sector['id'];
    $keyword = rawurlencode($keywords[$index]);
    $url = "https://loremflickr.com/1200/800/{$keyword}?lock=" . ($index + 1);
    $target = $uploadDir . "/sector_{$id}.jpg";

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_USERAGENT => 'AAPI-Demo-Sector-Image-Seed/1.0',
    ]);
    $data = curl_exec($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($data === false || $httpCode < 200 || $httpCode >= 300 || strlen($data) < 1000) {
        echo "[ERREUR] {$sector['nom']} — HTTP {$httpCode}" . ($error ? " — {$error}" : '') . "\n";
        continue;
    }

    if (file_put_contents($target, $data) === false) {
        echo "[ERREUR] Impossible d'écrire: {$target}\n";
        continue;
    }

    echo "[OK] {$sector['nom']} -> sector_{$id}.jpg\n";
}

echo "\nTerminé. Recharge /admin/sectors puis /sectors.\n";
