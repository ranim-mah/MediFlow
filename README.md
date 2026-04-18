# 🏥 Mediflow Clone — Système de Gestion de Clinique

Système complet MERN + React Native inspiré de Mediflow.

## 📦 Stack

- **Backend** : Node.js + Express + MongoDB (Atlas) + JWT
- **Frontend Web** : React (Vite) + TailwindCSS + i18next (AR/FR/EN) + RTL auto
- **Mobile** : React Native (Expo) — Phase 5

## 🗂️ Structure

```
mediflow-clone/
├── backend/              ← API REST Node.js (Phase 1)
├── frontend-web/         ← App React unifiée (Phase 2+)
├── mobile/               ← App React Native (Phase 5)
└── README.md
```

## 🚀 Roadmap

- [x] **Phase 1** — Backend + Auth + BDD (18 modèles, JWT multi-rôles)
- [x] **Phase 2** — Site public + réservation rapide (i18n AR/FR/EN + RTL)
- [ ] **Phase 3** — Portail patient (login, RDV, dossier, timeline, file d'attente)
- [ ] **Phase 4** — Admin clinique + Doctor Focus Mode
- [ ] **Phase 5** — App mobile React Native
- [ ] **Phase 6** — Notifications, WhatsApp bot, déploiement prod

## 🏁 Démarrage rapide (Phase 1 + 2)

### Terminal 1 — Backend

```bash
cd backend
npm install
cp .env.example .env
# Remplis .env avec MONGO_URI d'Atlas + 2 secrets JWT (voir backend/README.md)
npm run seed
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

## 📚 Documentation détaillée

- [`backend/README.md`](./backend/README.md) — setup MongoDB Atlas pas-à-pas + curl tests
- [`frontend-web/README.md`](./frontend-web/README.md) — tests multilingue + réservation

## ✨ Ce que tu verras après le setup

1. **Landing** (http://localhost:5173) — design Mediflow fidèle, hero + formulaire
2. **3 langues** — bascule AR/FR/EN avec RTL automatique
3. **Formulaire de réservation** qui crée de vrais RDV dans MongoDB
4. **Page Services** avec les 6 services seedés
5. **API health** sur http://localhost:5000/api/health
