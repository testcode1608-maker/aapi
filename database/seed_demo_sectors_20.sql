-- AAPI - 20 secteurs d'investissement provisionnels
-- Compatible avec la table sectors utilisée par l'API AAPI.
-- Les photos sont gérées par backend/uploads/sectors/sector_<id>.<ext>
-- après import, ajoute/remplace les photos depuis /admin/sectors.

SET NAMES utf8mb4;

INSERT INTO sectors (nom, slug, description, icone, statut) VALUES
('Industrie', 'industrie', 'Développement industriel, transformation, production manufacturière et création de chaînes de valeur locales.', 'bi-buildings', 'actif'),
('Agriculture', 'agriculture', 'Modernisation agricole, production végétale, irrigation, mécanisation et valorisation des ressources agricoles.', 'bi-tree', 'actif'),
('Agroalimentaire', 'agroalimentaire', 'Transformation des produits agricoles, conditionnement, stockage et développement de l’industrie alimentaire.', 'bi-basket', 'actif'),
('Énergies renouvelables', 'energies-renouvelables', 'Production et développement de solutions solaires, éoliennes et autres sources d’énergie renouvelable.', 'bi-sun', 'actif'),
('Énergie et hydrocarbures', 'energie-hydrocarbures', 'Services, équipements, transformation et solutions innovantes liés au secteur énergétique.', 'bi-lightning-charge', 'actif'),
('Technologie et numérique', 'technologie-numerique', 'Solutions numériques, logiciels, plateformes technologiques, services IT et transformation digitale.', 'bi-cpu', 'actif'),
('Intelligence artificielle', 'intelligence-artificielle', 'Développement de solutions d’intelligence artificielle, automatisation, données et technologies intelligentes.', 'bi-robot', 'actif'),
('Tourisme', 'tourisme', 'Infrastructures touristiques, hôtellerie, loisirs, tourisme culturel et valorisation du patrimoine.', 'bi-airplane', 'actif'),
('Transport et logistique', 'transport-logistique', 'Transport de marchandises et de personnes, plateformes logistiques, stockage et chaîne d’approvisionnement.', 'bi-truck', 'actif'),
('Eau et environnement', 'eau-environnement', 'Gestion de l’eau, traitement, recyclage, protection environnementale et économie circulaire.', 'bi-droplet', 'actif'),
('Santé', 'sante', 'Infrastructures sanitaires, équipements médicaux, services de santé et solutions de santé numérique.', 'bi-heart-pulse', 'actif'),
('Industrie pharmaceutique', 'industrie-pharmaceutique', 'Production pharmaceutique, dispositifs médicaux, recherche et développement dans le domaine de la santé.', 'bi-capsule', 'actif'),
('Immobilier et services', 'immobilier-services', 'Développement immobilier, services aux entreprises, gestion d’actifs et activités de services.', 'bi-house', 'actif'),
('Construction et BTP', 'construction-btp', 'Construction, matériaux, infrastructures, travaux publics et solutions pour le bâtiment.', 'bi-cone-striped', 'actif'),
('Mines et métaux', 'mines-metaux', 'Exploration, extraction, transformation et valorisation des ressources minières et métalliques.', 'bi-gem', 'actif'),
('Pêche et aquaculture', 'peche-aquaculture', 'Développement de la pêche, aquaculture, transformation des produits de la mer et chaîne du froid.', 'bi-water', 'actif'),
('Textile et habillement', 'textile-habillement', 'Production textile, confection, transformation des fibres et développement de marques locales.', 'bi-bag', 'actif'),
('Automobile et équipements', 'automobile-equipements', 'Fabrication, assemblage, sous-traitance et production de composants et équipements automobiles.', 'bi-car-front', 'actif'),
('Électronique et électrotechnique', 'electronique-electrotechnique', 'Production électronique, équipements électriques, composants, automatismes et solutions industrielles.', 'bi-cpu', 'actif'),
('Services financiers et professionnels', 'services-financiers-professionnels', 'Services financiers, conseil, ingénierie, accompagnement des entreprises et services professionnels spécialisés.', 'bi-bank', 'actif')
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    icone = VALUES(icone),
    statut = VALUES(statut);
