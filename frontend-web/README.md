# 🎨 Mediflow Frontend — Phase 2

Application React unifiée (Vite + TailwindCSS + i18next + React Query).
Site public + formulaire de réservation rapide connecté au backend.

## ✅ Ce qui est inclus (Phase 2)

- ⚛️ **React 18 + Vite** (démarrage ultra-rapide, HMR)
- 🎨 **TailwindCSS** avec thème Mediflow (bleu marine + cyan)
- 🌍 **i18n trilingue** : Arabe (RTL), Français (LTR), Anglais (LTR) — bascule auto du `dir` HTML
- 🔄 **React Query** pour data fetching + cache
- 🍞 **React Hot Toast** pour notifications
- 🎯 **Landing page** reproduisant l'esthétique Mediflow (hero + formulaire de réservation)
- 📋 **Page Services** avec 6 services dynamiques depuis le backend
- 📝 **Formulaire de réservation rapide** fonctionnel (création réelle de RDV dans MongoDB)

## 📋 Prérequis

- **Node.js 18+**
- **Le backend Phase 1 doit tourner** sur `http://localhost:5000`

## 🚀 Installation

### 1️⃣ Installer les dépendances

```bash
cd frontend-web
npm install
```

### 2️⃣ Configurer (optionnel)

```bash
cp .env.example .env
```

Par défaut, le frontend utilise le **proxy Vite** qui redirige `/api` → `http://localhost:5000`. Tu n'as rien à changer si le backend tourne sur le port 5000.

### 3️⃣ Lancer

```bash
npm run dev
```

Ouvre [http://localhost:5173](http://localhost:5173) 🎉

## 🌍 Tester les 3 langues

Clique sur le sélecteur **AR / FR / EN** en haut à droite :
- **AR** → RTL (de droite à gauche), police Tajawal
- **FR** / **EN** → LTR, police Inter

Les labels, placeholders, boutons et messages changent dynamiquement.

## 📝 Tester le formulaire de réservation

1. Sur la landing, remplis le formulaire **حجز سريع / Réservation rapide**
2. Choisis un service (chargé depuis `/api/public/services`)
3. Choisis la date/heure
4. Clique **Envoyer**
5. Vérifie dans MongoDB Atlas (collection `appointments`) que le RDV est bien créé avec `status: pending` et `source: public_site`

## 📁 Structure

```
frontend-web/
├── index.html
├── vite.config.js               ← proxy /api → :5000
├── tailwind.config.js           ← thème Mediflow
├── postcss.config.js
├── package.json
├── .env.example
└── src/
    ├── main.jsx                 ← entry (Router, QueryClient, Toaster)
    ├── App.jsx                  ← routes
    ├── styles/index.css         ← Tailwind + composants
    ├── lib/
    │   ├── i18n.js              ← config 3 langues + dir auto
    │   ├── api.js               ← Axios client + interceptors
    │   ├── publicApi.js
    │   └── cn.js
    ├── locales/
    │   ├── ar/translation.json
    │   ├── fr/translation.json
    │   └── en/translation.json
    ├── layouts/
    │   └── PublicLayout.jsx
    ├── pages/
    │   ├── LandingPage.jsx
    │   ├── ServicesPage.jsx
    │   └── NotFoundPage.jsx
    └── components/
        ├── ui/
        │   ├── Logo.jsx
        │   └── LanguageSwitcher.jsx
        └── public/
            ├── Navbar.jsx
            ├── Footer.jsx
            ├── QuickBookingForm.jsx
            └── ServiceCard.jsx
```

## 🐛 Problèmes courants

**Erreur CORS** → vérifie que `CLIENT_URL=http://localhost:5173` dans `backend/.env`.

**Services vides dans le formulaire** → tu n'as pas lancé `npm run seed` côté backend.

**`Network Error`** → le backend n'est pas lancé. Fais `cd backend && npm run dev` dans un autre terminal.

**La page reste en arabe RTL malgré le changement** → vide le cache navigateur (localStorage key `mediflow.lang`).

---

Quand tout tourne chez toi, envoie-moi **"Phase 2 OK"** et on attaque **Phase 3 : portail patient** (login, dashboard patient, mes RDV, ma timeline, ma file d'attente — les images 2, 3, 4, 5, 6, 7, 8 de Mediflow). 🚀
