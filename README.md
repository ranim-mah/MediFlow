# 🏥 Mediflow Clone — Système de Gestion de Clinique

Système complet MERN + React Native inspiré de Mediflow.

## 📦 Stack

- **Backend** : Node.js + Express + MongoDB (Atlas) + JWT + RBAC
- **Frontend Web** : React 18 + Vite + TailwindCSS + i18next (AR/FR/EN) + RTL auto + React Query + Zustand
- **Mobile** : React Native (Expo) — Phase 5

## 🗂️ Structure

```
mediflow-clone/
├── backend/              ← API REST Node.js
├── frontend-web/         ← App React unifiée (public + portail patient)
├── mobile/               ← App React Native (Phase 5)
└── README.md
```

## 🚀 Roadmap

- [x] **Phase 1** — Backend + Auth + BDD (18 modèles, JWT multi-rôles)
- [x] **Phase 2** — Site public + réservation rapide (i18n AR/FR/EN + RTL)
- [x] **Phase 3** — Portail patient complet (login, dashboard, RDV, dossier, timeline, file d'attente, notifications)
- [ ] **Phase 4** — Admin clinique + Doctor Focus Mode
- [ ] **Phase 5** — App mobile React Native
- [ ] **Phase 6** — Notifications push, WhatsApp bot, déploiement prod

## 🏁 Démarrage rapide

### Terminal 1 — Backend

```bash
cd backend
npm install
cp .env.example .env
# Remplis .env avec MONGO_URI d'Atlas + 2 secrets JWT (voir backend/README.md)
npm run seed           # ⚠️ À relancer pour les nouvelles données démo Phase 3
npm run dev
# → http://localhost:5000
```

### Terminal 2 — Frontend

```bash
cd frontend-web
npm install
npm run dev
# → http://localhost:5173 🎉
```

## ✨ Test complet (Phase 1 + 2 + 3)

### 1. Site public (Phase 2)
Ouvre [http://localhost:5173](http://localhost:5173)
- Clique sur **AR / FR / EN** — bascule complète avec RTL
- Remplis le formulaire **حجز سريع** → un RDV est créé dans MongoDB

### 2. Connexion portail patient (Phase 3)
Clique **بوابة المرضى** en haut à droite ou va sur [/login](http://localhost:5173/login)

**Compte de test pré-rempli** (après `npm run seed`) :
- Email : `osama@mediflow.test`
- Mot de passe : `patient123`

### 3. Pages du portail à explorer

Après connexion, tu accèdes à `/portal` avec 7 pages fonctionnelles :

| Page | URL | Contenu |
|------|-----|---------|
| 🏠 Dashboard | `/portal` | Stats, prochain RDV, raccourcis, résumé rapide, notifications |
| 📅 Mes RDV | `/portal/appointments` | RDV à venir + passés, annulation avec règle 6h |
| ➕ Nouveau RDV | `/portal/appointments/new` | Formulaire création RDV (lié au compte) |
| 🔢 File d'attente | `/portal/queue` | رقمك / الجاري الآن / فاضل قبلك (auto-refresh 30s) |
| 📁 Dossier médical | `/portal/medical-file` | Infos, résumé santé, historique des visites |
| 📜 Timeline | `/portal/timeline` | Chronologie unifiée filtrable par type |
| 🔔 Notifications | `/portal/notifications` | Centre de notifications + mark as read |

### 4. Données démo pré-peuplées (seeder)

Pour le compte `osama@mediflow.test`, le seeder crée :
- ✅ 1 RDV à venir (dans 3 jours avec Dr Nader — ECG)
- ✅ 1 RDV passé complété (il y a 1 mois)
- ✅ 1 visite avec diagnostic + plan
- ✅ 1 ordonnance (Aspirine)
- ✅ 1 analyse labo terminée (CBC + glycémie)
- ✅ 1 radiologie terminée (Rx thorax)
- ✅ 3 notifications (dont 2 non lues)
- ✅ 1 entrée de file d'attente pour aujourd'hui

Le portail sera donc **visuellement rempli** dès le premier login.

## 📚 Documentation

- [`backend/README.md`](./backend/README.md) — setup MongoDB Atlas + curl tests
- [`frontend-web/README.md`](./frontend-web/README.md) — tests multilingue + réservation

## 🐛 Troubleshooting rapide

**Portail vide après login** → relance `npm run seed` côté backend (le seeder Phase 1 n'avait pas les données démo).

**Impossible de se connecter** → vérifie que le backend tourne et que CORS `CLIENT_URL=http://localhost:5173` dans `backend/.env`.

**Pages portail en erreur 403** → tu es connecté avec un rôle autre que `patient`. Logout et reconnecte avec `osama@mediflow.test`.
