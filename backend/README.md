# MediFlow Backend

MediFlow est une plateforme de gestion médicale complète pour cliniques et centres de santé.

## Fonctionnalités principales

- Gestion des patients, médecins, rendez-vous, files d’attente, prescriptions, analyses, notifications push/mobile, etc.
- API RESTful basée sur Node.js/Express et MongoDB.
- Authentification sécurisée (JWT), gestion des rôles, audit log, limitation de requêtes.
- Multilingue (arabe, français, anglais).

## Démarrage local

1. Cloner le dépôt
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Configurer le fichier `.env` (voir exemple fourni)
4. Lancer le serveur :
   ```bash
   npm run dev
   ```

## Scripts utiles

- `npm run dev` : Démarrage en mode développement (nodemon)
- `npm start` : Démarrage en production (node)
- `npm run seed` : Peupler la base de données avec des données de test

## Déploiement

- Utiliser le script `start` pour la production (Render, Heroku, etc.)
- Configurer les variables d’environnement nécessaires (voir `.env`)

## Structure du projet

- `src/models/` : Schémas Mongoose
- `src/controllers/` : Logique métier
- `src/routes/` : Routes API
- `src/middleware/` : Middlewares Express
- `src/services/` : Services externes (notifications, etc.)
- `src/utils/` : Utilitaires

## Auteur

Mahmoudi Ranim

---

Pour toute question, voir la documentation ou contacter l’auteur.
