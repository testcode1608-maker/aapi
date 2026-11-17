# AAPI — Agence Algérienne de Promotion de l’Investissement

Plateforme web AAPI avec interface React/TypeScript (arabe RTL, français et anglais), API Node.js/Express et base PostgreSQL.

## Architecture

- Frontend : React, TypeScript et Vite.
- Backend : Node.js, Express et PostgreSQL.
- Production : Docker Compose et Nginx (proxy API sous /api).
- Langues : العربية، Français، English.

## Configuration

1. Copier .env.example vers .env.
2. Remplacer les valeurs d’exemple par des secrets forts et privés.
3. Définir notamment POSTGRES_PASSWORD et SESSION_SECRET.
4. Générer un SESSION_SECRET aléatoire long (au moins 32 caractères).
5. Ne jamais publier le fichier .env.

Générer un secret avec Node.js :

    node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"

## Démarrage avec Docker

    docker compose up --build -d
    docker compose ps

L’application est publiée sur le port APP_PORT (8080 par défaut). L’API passe par Nginx sous /api.

Journaux :

    docker compose logs -f backend
    docker compose logs -f frontend
    docker compose logs -f db

## Développement local

Démarrer PostgreSQL (par exemple avec docker compose up -d db), puis lancer l’API dans un terminal :

    cd backend
    npm install
    npm run dev

Dans un second terminal, lancer le frontend :

    npm install
    npm run dev

Vite transmet les requêtes /api/* vers http://127.0.0.1:3001. Pour changer la cible, définir API_PROXY_TARGET.

## Sessions et sécurité

- La connexion crée un cookie de session signé côté serveur, HttpOnly et SameSite=Strict.
- Les routes privées investisseur et administrateur vérifient la session et le rôle dans PostgreSQL.
- L’identifiant envoyé par le navigateur n’est plus utilisé comme preuve d’identité pour ces routes.
- La déconnexion efface le cookie de session.
- Les téléversements sont limités aux formats JPG, PNG et WEBP (8 Mo maximum).

## Protection des données PostgreSQL — À lire avant toute opération

**Ne lancez jamais backend/aapi.sql manuellement sur une base qui contient déjà des données.** Ce fichier d’initialisation contient des instructions DROP TABLE et peut supprimer des tables et leurs données.

Docker exécute les scripts de docker-entrypoint-initdb.d uniquement lors de l’initialisation d’un répertoire de données PostgreSQL vide. Ces scripts ne constituent pas un mécanisme de migration pour une base existante.

- docker compose down conserve le volume PostgreSQL.
- **Ne lancez pas docker compose down -v** si vous souhaitez conserver la base.
- Avant une mise à jour ou une opération SQL, créez et vérifiez une sauvegarde PostgreSQL.
- Aucune migration destructive n’est exécutée par le code applicatif.

Exemple de sauvegarde :

    pg_dump -h localhost -p 5433 -U aapi -d aapi_db -Fc -f aapi-backup.dump

Adaptez l’hôte, le port, l’utilisateur et le nom de la base à votre fichier .env.

## Vérifications

    npm run build
    npm run lint

Le build frontend ne remplace pas les tests d’intégration API/PostgreSQL. Vérifier également la connexion, les rôles, les opérations CRUD, les téléversements et les sauvegardes dans un environnement de test avant déploiement.

## Stockage

Les données PostgreSQL sont stockées dans le volume Docker postgres_data. Les images téléversées sont stockées dans le volume backend_uploads.
