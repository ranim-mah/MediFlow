# MediFlow

MediFlow est une plateforme complète de gestion médicale destinée aux cliniques, cabinets et centres de santé. Le projet est composé de trois parties principales :

- **backend/** : API Node.js/Express avec MongoDB (gestion des utilisateurs, rendez-vous, notifications, etc.)
- **frontend-web/** : Application web moderne (React + Vite + Tailwind) pour les patients, médecins et administrateurs
- **mobile/** : Application mobile (React Native) pour patients et praticiens, notifications push en temps réel

## Fonctionnalités principales

### Fonctionnalités actuelles

- **Gestion des rendez-vous** : prise de rendez-vous en ligne, gestion des files d’attente, notifications de rappel.
- **Portails dédiés** : interfaces distinctes pour patients, médecins, staff et administrateurs.
- **Gestion des patients** : création, édition, historique médical, pièces jointes, suivi des visites.
- **Gestion des médecins et staff** : profils, spécialités, gestion des horaires et disponibilités.
- **Gestion des prescriptions et analyses** : création d’ordonnances, gestion des examens de laboratoire et radiologie.
- **Facturation et paiements** : génération de factures, suivi des paiements (bientôt intégration paiement en ligne).
- **Notifications push** : envoi de notifications en temps réel (web et mobile) pour rappels, changements de rendez-vous, etc.
- **Authentification et sécurité** : gestion des rôles (admin, médecin, patient, staff), JWT, audit log, limitation de requêtes.
- **Statistiques et reporting** : tableaux de bord, statistiques d’activité, export de données.
- **Multilingue** : interfaces en arabe, français, anglais (extensible).

### Fonctionnalités futures

- **Téléconsultation vidéo** (intégration de solutions de visioconférence)
- **Paiement en ligne** (Stripe, PayPal, etc.)
- **Gestion avancée des stocks et pharmacie**
- **Module de gestion RH (staff, congés, planning)**
- **Messagerie interne sécurisée** (patient-médecin, staff)
- **Signature électronique de documents**
- **Intégration DMP (Dossier Médical Partagé)**
- **Automatisation des relances et campagnes SMS/email**
- **API publique pour intégration avec d’autres systèmes**
- **Tableau de bord analytique avancé (BI)**
- **Accessibilité renforcée et PWA**

## Structure du projet

```
MediFlow/
├── backend/         # API Node.js/Express
├── frontend-web/    # Frontend React/Vite
├── mobile/          # Application mobile React Native
```

## Démarrage rapide

1. **Cloner le dépôt**
2. **Configurer les variables d’environnement** dans chaque dossier (`.env`)
3. **Installer les dépendances**
   - backend : `npm install`
   - frontend-web : `npm install`
   - mobile : `npm install`
4. **Lancer chaque partie**
   - backend : `npm run dev` ou `npm start`
   - frontend-web : `npm run dev`
   - mobile : `npm start` (Expo)

## Aperçu en images

| Portail patient (services)                                  | Tableau de bord admin                                              | Portail patient (accueil)                                       |
| ----------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------- |
| ![Services](captures/Capture d'écran 2026-04-19 072510.png) | ![Admin Dashboard](captures/Capture d'écran 2026-04-19 072520.png) | ![Patient Home](captures/Capture d'écran 2026-04-19 072535.png) |

| Dossier médical patient                                         | Calendrier admin                                                  | Gestion des rendez-vous                                         |
| --------------------------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------- |
| ![Medical File](captures/Capture d'écran 2026-04-19 072555.png) | ![Admin Calendar](captures/Capture d'écran 2026-04-19 072605.png) | ![Appointments](captures/Capture d'écran 2026-04-19 072622.png) |

| Statistiques & Finances                                    | Prise de rendez-vous                                             | Portail patient (EN)                                          |
| ---------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------- |
| ![Finance](captures/Capture d'écran 2026-04-19 072637.png) | ![Quick Booking](captures/Capture d'écran 2026-04-19 072647.png) | ![Patient EN](captures/Capture d'écran 2026-04-19 072656.png) |

> D'autres captures sont disponibles dans le dossier `captures/`.

## Déploiement

- **Backend** : Render, Railway, Heroku, etc. (utiliser le script `start`)
- **Frontend** : Vercel, Netlify, etc.
- **Mobile** : Expo, Play Store, App Store

## Auteurs

- Mahmoudi Ranim

---

Pour plus de détails, voir les README de chaque dossier.
