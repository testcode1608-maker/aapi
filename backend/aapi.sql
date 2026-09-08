-- ============================================================
-- AAPI - BASE DE DONNÉES
-- Agence Algérienne de Promotion de l'Investissement
-- ============================================================

CREATE DATABASE IF NOT EXISTS aapi_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE aapi_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. UTILISATEURS
-- ============================================================

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS investment_requests;
DROP TABLE IF EXISTS investments;
DROP TABLE IF EXISTS project_sectors;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS sectors;
DROP TABLE IF EXISTS investor_profiles;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,

    email VARCHAR(180) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,

    telephone VARCHAR(30) DEFAULT NULL,

    role ENUM(
        'investisseur',
        'admin',
        'agent'
    ) NOT NULL DEFAULT 'investisseur',

    statut ENUM(
        'actif',
        'inactif',
        'suspendu'
    ) NOT NULL DEFAULT 'actif',

    photo VARCHAR(255) DEFAULT NULL,

    last_login DATETIME DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_role (role),
    INDEX idx_users_statut (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 2. PROFILS INVESTISSEURS
-- ============================================================

CREATE TABLE investor_profiles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNSIGNED NOT NULL,

    type_investisseur ENUM(
        'personne_physique',
        'personne_morale',
        'investisseur_etranger'
    ) NOT NULL DEFAULT 'personne_physique',

    nom_entreprise VARCHAR(180) DEFAULT NULL,

    registre_commerce VARCHAR(100) DEFAULT NULL,
    nif VARCHAR(100) DEFAULT NULL,
    nis VARCHAR(100) DEFAULT NULL,

    wilaya VARCHAR(100) DEFAULT NULL,
    commune VARCHAR(100) DEFAULT NULL,
    adresse TEXT DEFAULT NULL,

    site_web VARCHAR(255) DEFAULT NULL,

    secteur_activite VARCHAR(150) DEFAULT NULL,

    description TEXT DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_investor_user (user_id),

    CONSTRAINT fk_investor_profile_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 3. SECTEURS
-- ============================================================

CREATE TABLE sectors (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    nom VARCHAR(150) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,

    description TEXT DEFAULT NULL,

    icone VARCHAR(100) DEFAULT NULL,

    statut ENUM(
        'actif',
        'inactif'
    ) NOT NULL DEFAULT 'actif',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_sectors_status (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 4. PROJETS D'INVESTISSEMENT
-- ============================================================

CREATE TABLE projects (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNSIGNED DEFAULT NULL,

    titre VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,

    description TEXT DEFAULT NULL,

    wilaya VARCHAR(100) DEFAULT NULL,
    commune VARCHAR(100) DEFAULT NULL,

    adresse TEXT DEFAULT NULL,

    montant_investissement DECIMAL(18,2) DEFAULT 0.00,

    nombre_emplois INT UNSIGNED DEFAULT 0,

    superficie DECIMAL(12,2) DEFAULT NULL,

    unite_superficie VARCHAR(30) DEFAULT 'm²',

    statut ENUM(
        'brouillon',
        'soumis',
        'en_etude',
        'approuve',
        'en_cours',
        'realise',
        'rejete',
        'archive'
    ) NOT NULL DEFAULT 'brouillon',

    image VARCHAR(255) DEFAULT NULL,

    date_debut DATE DEFAULT NULL,
    date_fin DATE DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_projects_user (user_id),
    INDEX idx_projects_status (statut),
    INDEX idx_projects_wilaya (wilaya),

    CONSTRAINT fk_project_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 5. RELATION PROJETS / SECTEURS
-- ============================================================

CREATE TABLE project_sectors (
    project_id INT UNSIGNED NOT NULL,
    sector_id INT UNSIGNED NOT NULL,

    PRIMARY KEY (project_id, sector_id),

    CONSTRAINT fk_project_sector_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_project_sector_sector
        FOREIGN KEY (sector_id)
        REFERENCES sectors(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 6. INVESTISSEMENTS
-- ============================================================

CREATE TABLE investments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNSIGNED NOT NULL,
    project_id INT UNSIGNED NOT NULL,

    montant DECIMAL(18,2) NOT NULL DEFAULT 0.00,

    date_investissement DATE DEFAULT NULL,

    statut ENUM(
        'en_attente',
        'valide',
        'en_cours',
        'termine',
        'annule'
    ) NOT NULL DEFAULT 'en_attente',

    reference VARCHAR(100) NOT NULL UNIQUE,

    notes TEXT DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_investments_user (user_id),
    INDEX idx_investments_project (project_id),
    INDEX idx_investments_status (statut),

    CONSTRAINT fk_investment_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_investment_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 7. DEMANDES D'INVESTISSEMENT
-- ============================================================

CREATE TABLE investment_requests (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNSIGNED NOT NULL,

    projet_id INT UNSIGNED DEFAULT NULL,

    type_demande ENUM(
        'nouveau_projet',
        'extension',
        'accompagnement',
        'foncier',
        'financement',
        'information',
        'autre'
    ) NOT NULL DEFAULT 'information',

    objet VARCHAR(255) NOT NULL,

    description TEXT NOT NULL,

    montant_demande DECIMAL(18,2) DEFAULT NULL,

    wilaya VARCHAR(100) DEFAULT NULL,

    statut ENUM(
        'nouvelle',
        'en_cours',
        'en_attente',
        'acceptee',
        'refusee',
        'terminee'
    ) NOT NULL DEFAULT 'nouvelle',

    priorite ENUM(
        'basse',
        'normale',
        'haute',
        'urgente'
    ) NOT NULL DEFAULT 'normale',

    reponse TEXT DEFAULT NULL,

    traite_par INT UNSIGNED DEFAULT NULL,

    date_traitement DATETIME DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_requests_user (user_id),
    INDEX idx_requests_project (projet_id),
    INDEX idx_requests_status (statut),
    INDEX idx_requests_priority (priorite),

    CONSTRAINT fk_request_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_request_project
        FOREIGN KEY (projet_id)
        REFERENCES projects(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_request_agent
        FOREIGN KEY (traite_par)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 8. DOCUMENTS
-- ============================================================

CREATE TABLE documents (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNSIGNED NOT NULL,

    project_id INT UNSIGNED DEFAULT NULL,
    request_id INT UNSIGNED DEFAULT NULL,

    titre VARCHAR(255) NOT NULL,

    type_document ENUM(
        'identite',
        'registre_commerce',
        'document_fiscal',
        'business_plan',
        'contrat',
        'attestation',
        'certificat',
        'autre'
    ) NOT NULL DEFAULT 'autre',

    fichier VARCHAR(500) NOT NULL,

    nom_original VARCHAR(255) DEFAULT NULL,

    extension VARCHAR(20) DEFAULT NULL,

    taille BIGINT UNSIGNED DEFAULT NULL,

    statut ENUM(
        'en_attente',
        'valide',
        'rejete'
    ) NOT NULL DEFAULT 'en_attente',

    commentaire TEXT DEFAULT NULL,

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_documents_user (user_id),
    INDEX idx_documents_project (project_id),
    INDEX idx_documents_request (request_id),

    CONSTRAINT fk_document_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_document_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_document_request
        FOREIGN KEY (request_id)
        REFERENCES investment_requests(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 9. MESSAGES
-- ============================================================

CREATE TABLE messages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    sender_id INT UNSIGNED DEFAULT NULL,
    receiver_id INT UNSIGNED DEFAULT NULL,

    sujet VARCHAR(255) NOT NULL,

    contenu TEXT NOT NULL,

    lu TINYINT(1) NOT NULL DEFAULT 0,

    date_lecture DATETIME DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_messages_sender (sender_id),
    INDEX idx_messages_receiver (receiver_id),
    INDEX idx_messages_read (lu),

    CONSTRAINT fk_message_sender
        FOREIGN KEY (sender_id)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_message_receiver
        FOREIGN KEY (receiver_id)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 10. NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id INT UNSIGNED NOT NULL,

    titre VARCHAR(255) NOT NULL,

    message TEXT NOT NULL,

    type ENUM(
        'info',
        'success',
        'warning',
        'danger',
        'message',
        'document',
        'demande',
        'projet'
    ) NOT NULL DEFAULT 'info',

    lien VARCHAR(500) DEFAULT NULL,

    lu TINYINT(1) NOT NULL DEFAULT 0,

    date_lecture DATETIME DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_notifications_user (user_id),
    INDEX idx_notifications_read (lu),

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 11. ACTUALITÉS
-- ============================================================

CREATE TABLE news (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    titre VARCHAR(255) NOT NULL,

    slug VARCHAR(255) NOT NULL UNIQUE,

    resume TEXT DEFAULT NULL,

    contenu LONGTEXT NOT NULL,

    image VARCHAR(500) DEFAULT NULL,

    auteur_id INT UNSIGNED DEFAULT NULL,

    statut ENUM(
        'brouillon',
        'publie',
        'archive'
    ) NOT NULL DEFAULT 'brouillon',

    date_publication DATETIME DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_news_status (statut),
    INDEX idx_news_date (date_publication),

    CONSTRAINT fk_news_author
        FOREIGN KEY (auteur_id)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 12. ANNONCES
-- ============================================================

CREATE TABLE announcements (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    titre VARCHAR(255) NOT NULL,

    slug VARCHAR(255) NOT NULL UNIQUE,

    contenu LONGTEXT NOT NULL,

    image VARCHAR(500) DEFAULT NULL,

    auteur_id INT UNSIGNED DEFAULT NULL,

    statut ENUM(
        'brouillon',
        'publie',
        'archive'
    ) NOT NULL DEFAULT 'brouillon',

    date_publication DATETIME DEFAULT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_announcements_status (statut),
    INDEX idx_announcements_date (date_publication),

    CONSTRAINT fk_announcement_author
        FOREIGN KEY (auteur_id)
        REFERENCES users(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 13. ÉVÉNEMENTS
-- ============================================================

CREATE TABLE events (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    titre VARCHAR(255) NOT NULL,

    description TEXT DEFAULT NULL,

    lieu VARCHAR(255) DEFAULT NULL,

    adresse VARCHAR(500) DEFAULT NULL,

    image VARCHAR(500) DEFAULT NULL,

    date_debut DATETIME NOT NULL,
    date_fin DATETIME DEFAULT NULL,

    statut ENUM(
        'a_venir',
        'en_cours',
        'termine',
        'annule'
    ) NOT NULL DEFAULT 'a_venir',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_events_start (date_debut),
    INDEX idx_events_status (statut)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- 14. SECTEURS DE BASE
-- ============================================================

INSERT INTO sectors
    (nom, slug, description, icone)
VALUES
(
    'Agriculture',
    'agriculture',
    'Investissements dans le secteur agricole et agroalimentaire.',
    'bi-flower1'
),
(
    'Industrie',
    'industrie',
    'Projets industriels et activités de production.',
    'bi-building'
),
(
    'Technologies',
    'technologies',
    'Technologies, numérique et innovation.',
    'bi-cpu'
),
(
    'Tourisme',
    'tourisme',
    'Projets touristiques et hôteliers.',
    'bi-airplane'
),
(
    'Énergies',
    'energies',
    'Énergies renouvelables et transition énergétique.',
    'bi-lightning'
),
(
    'Transport',
    'transport',
    'Transport, logistique et infrastructures.',
    'bi-truck'
),
(
    'Santé',
    'sante',
    'Investissements dans le secteur de la santé.',
    'bi-heart-pulse'
),
(
    'Services',
    'services',
    'Services aux entreprises et aux particuliers.',
    'bi-briefcase'
);


-- ============================================================
-- 15. COMPTE ADMINISTRATEUR
-- ============================================================
-- Mot de passe temporaire :
-- Admin@123
--
-- IMPORTANT :
-- Le mot de passe doit idéalement être remplacé par un hash
-- généré avec password_hash() côté PHP.

INSERT INTO users
(
    nom,
    prenom,
    email,
    password,
    telephone,
    role,
    statut
)
VALUES
(
    'Administrateur',
    'AAPI',
    'admin@aapi.dz',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llCqzQ9Y5F7L2wYQY6m',
    NULL,
    'admin',
    'actif'
);


-- ============================================================
-- 16. UTILISATEUR INVESTISSEUR DE TEST
-- ============================================================
-- Mot de passe temporaire :
-- Investor@123

INSERT INTO users
(
    nom,
    prenom,
    email,
    password,
    telephone,
    role,
    statut
)
VALUES
(
    'Benali',
    'Ahmed',
    'investisseur@aapi.dz',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llCqzQ9Y5F7L2wYQY6m',
    '0550000000',
    'investisseur',
    'actif'
);


-- ============================================================
-- 17. PROFIL INVESTISSEUR DE TEST
-- ============================================================

INSERT INTO investor_profiles
(
    user_id,
    type_investisseur,
    nom_entreprise,
    wilaya,
    commune,
    adresse,
    secteur_activite,
    description
)
VALUES
(
    2,
    'personne_morale',
    'AAPI Investissement',
    'Alger',
    'Alger Centre',
    'Alger, Algérie',
    'Technologies',
    'Entreprise de démonstration pour le compte investisseur.'
);


-- ============================================================
-- 18. PROJETS DE DÉMONSTRATION
-- ============================================================

INSERT INTO projects
(
    user_id,
    titre,
    slug,
    description,
    wilaya,
    commune,
    montant_investissement,
    nombre_emplois,
    statut,
    image
)
VALUES
(
    2,
    'Centre technologique et numérique',
    'centre-technologique-numerique',
    'Projet de création d’un centre spécialisé dans les technologies numériques et les services innovants.',
    'Alger',
    'Alger Centre',
    25000000.00,
    45,
    'en_cours',
    NULL
),
(
    2,
    'Complexe agroalimentaire',
    'complexe-agroalimentaire',
    'Projet industriel destiné à la transformation et à la valorisation des produits agricoles.',
    'Blida',
    'Blida',
    50000000.00,
    80,
    'en_etude',
    NULL
),
(
    2,
    'Projet touristique',
    'projet-touristique',
    'Création d’un complexe touristique moderne.',
    'Oran',
    'Oran',
    75000000.00,
    120,
    'soumis',
    NULL
);


-- ============================================================
-- 19. LIAISON PROJETS / SECTEURS
-- ============================================================

INSERT INTO project_sectors
(
    project_id,
    sector_id
)
VALUES
(1, 3),
(2, 1),
(2, 2),
(3, 4);


-- ============================================================
-- 20. ANNONCES DE DÉMONSTRATION
-- ============================================================

INSERT INTO announcements
(
    titre,
    slug,
    contenu,
    statut,
    date_publication
)
VALUES
(
    'Ouverture de la plateforme investisseurs',
    'ouverture-plateforme-investisseurs',
    'La plateforme digitale destinée aux investisseurs est désormais disponible.',
    'publie',
    NOW()
),
(
    'Accompagnement des investisseurs',
    'accompagnement-investisseurs',
    'Découvrez les services et dispositifs disponibles pour accompagner vos projets d’investissement.',
    'publie',
    NOW()
);


-- ============================================================
-- 21. ACTUALITÉS DE DÉMONSTRATION
-- ============================================================

INSERT INTO news
(
    titre,
    slug,
    resume,
    contenu,
    statut,
    date_publication
)
VALUES
(
    'Développement de l’investissement en Algérie',
    'developpement-investissement-algerie',
    'Les opportunités d’investissement continuent de se développer.',
    'Présentation des nouvelles opportunités et perspectives pour les investisseurs en Algérie.',
    'publie',
    NOW()
),
(
    'Nouvelles opportunités sectorielles',
    'nouvelles-opportunites-sectorielles',
    'Découvrez les nouveaux secteurs offrant des possibilités d’investissement.',
    'Présentation des opportunités dans les différents secteurs économiques.',
    'publie',
    NOW()
);


-- ============================================================
-- 22. ÉVÉNEMENT DE DÉMONSTRATION
-- ============================================================

INSERT INTO events
(
    titre,
    description,
    lieu,
    adresse,
    date_debut,
    date_fin,
    statut
)
VALUES
(
    'Forum de l’investissement',
    'Rencontre entre investisseurs, entrepreneurs et acteurs économiques.',
    'Palais des Congrès',
    'Alger, Algérie',
    DATE_ADD(NOW(), INTERVAL 30 DAY),
    DATE_ADD(NOW(), INTERVAL 30 DAY) + INTERVAL 8 HOUR,
    'a_venir'
);


-- ============================================================
-- 23. NOTIFICATION DE DÉMONSTRATION
-- ============================================================

INSERT INTO notifications
(
    user_id,
    titre,
    message,
    type,
    lu
)
VALUES
(
    2,
    'Bienvenue sur votre espace investisseur',
    'Votre compte investisseur a été créé avec succès.',
    'success',
    0
);


-- ============================================================
-- 24. MESSAGE DE DÉMONSTRATION
-- ============================================================

INSERT INTO messages
(
    sender_id,
    receiver_id,
    sujet,
    contenu,
    lu
)
VALUES
(
    1,
    2,
    'Bienvenue',
    'Bienvenue dans votre espace investisseur AAPI.',
    0
);


-- ============================================================
-- FIN
-- ============================================================

SET FOREIGN_KEY_CHECKS = 1;