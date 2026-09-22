-- AAPI FAQ / Foire aux questions
CREATE TABLE IF NOT EXISTS investor_faq (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(500) NOT NULL,
  answer TEXT NOT NULL,
  statut ENUM('publie','brouillon','archive') NOT NULL DEFAULT 'publie',
  ordre INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_investor_faq_statut_ordre (statut, ordre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO investor_faq (question, answer, statut, ordre)
SELECT 'Comment identifier les opportunités d’investissement ?',
       'Consultez les opportunités et secteurs d’investissement ainsi que les informations propres à chaque projet.',
       'publie', 1
WHERE NOT EXISTS (SELECT 1 FROM investor_faq LIMIT 1);

INSERT INTO investor_faq (question, answer, statut, ordre)
SELECT 'Comment m’inscrire comme investisseur ?',
       'Créez votre compte investisseur depuis la page d’inscription en renseignant les informations demandées, puis suivez votre projet depuis l’espace investisseur.',
       'publie', 2
WHERE (SELECT COUNT(*) FROM investor_faq) = 1;

INSERT INTO investor_faq (question, answer, statut, ordre)
SELECT 'Quels documents sont nécessaires ?',
       'Les documents varient selon la nature du projet et son avancement. Consultez les guides et documents disponibles pour plus de détails.',
       'publie', 3
WHERE (SELECT COUNT(*) FROM investor_faq) = 2;

INSERT INTO investor_faq (question, answer, statut, ordre)
SELECT 'Puis-je suivre mon projet sur la plateforme ?',
       'Oui. L’espace investisseur permet de suivre les informations, demandes et étapes de votre projet selon les services disponibles.',
       'publie', 4
WHERE (SELECT COUNT(*) FROM investor_faq) = 3;
