# 🏥 Mediflow Backend — Phase 1

API REST Node.js + Express + MongoDB Atlas avec authentification JWT multi-rôles.

## ✅ Ce qui est inclus

- 🗄️ **18 modèles Mongoose** (User, Patient, Doctor, Staff, Branch, Service, Appointment, Visit, Prescription, LabTest, Radiology, Procedure, Referral, Invoice, Notification, Queue, AuditLog, Attachment)
- 🔐 **Authentification JWT** avec refresh tokens (multi-device)
- 👥 **RBAC** — 6 rôles (admin, doctor, assistant, reception, nurse, patient)
- 🛡️ **Sécurité** — Helmet, CORS, rate limiting, bcrypt, validation
- 🌱 **Seeder** avec données de test (admin, 2 médecins, staff, 2 patients, services)
- 📝 **Gestion d'erreurs** centralisée

## 📋 Prérequis

- **Node.js 18+** → vérifie avec `node --version`
- **npm** (vient avec Node)
- **Un compte MongoDB Atlas gratuit** (voir étape 1)
- **Postman** ou **curl** pour tester l'API (optionnel mais recommandé)

---

## 🚀 Installation — Étape par étape

### 1️⃣ Créer un cluster MongoDB Atlas (gratuit, 10 minutes)

1. Va sur [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register) et crée un compte
2. Crée un cluster **M0 (Free)** — choisis la région la plus proche (Paris, Frankfurt, etc.)
3. **Database Access** → *Add New Database User* :
   - Username : `mediflow_admin`
   - Password : clique *Autogenerate* et **copie-le quelque part**
   - Privileges : *Read and write to any database*
4. **Network Access** → *Add IP Address* → *Allow access from anywhere* (`0.0.0.0/0`)
   - ⚠️ Pour la prod, restreins aux IP de ton serveur
5. **Database** → *Connect* → *Drivers* → copie la chaîne de connexion. Elle ressemble à :
   ```
   mongodb+srv://mediflow_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Remplace `<password>`** par le mot de passe que tu as copié, et **ajoute `/mediflow`** avant le `?` :
   ```
   mongodb+srv://mediflow_admin:TON_MDP@cluster0.xxxxx.mongodb.net/mediflow?retryWrites=true&w=majority
   ```

### 2️⃣ Installer les dépendances

```bash
cd backend
npm install
```

### 3️⃣ Configurer les variables d'environnement

```bash
cp .env.example .env
```

Ouvre le fichier `.env` et remplis :

- **`MONGO_URI`** → colle la chaîne Atlas (étape 1.6)
- **`JWT_ACCESS_SECRET`** et **`JWT_REFRESH_SECRET`** → génère 2 chaînes aléatoires :

```bash
# Dans ton terminal, exécute deux fois :
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copie chaque résultat dans les variables correspondantes du `.env`.

### 4️⃣ Peupler la base avec des données de test

```bash
npm run seed
```

Tu verras s'afficher les identifiants de test.

### 5️⃣ Lancer le serveur

```bash
npm run dev
```

Tu dois voir :

```
✅ MongoDB connecté : cluster0-xxxxx.mongodb.net
🚀 Serveur Mediflow démarré
   Port  : 5000
   URL   : http://localhost:5000
```

### 6️⃣ Vérifier que tout marche

Ouvre dans ton navigateur : [http://localhost:5000/api/health](http://localhost:5000/api/health)

Tu dois voir :
```json
{ "success": true, "message": "Mediflow API is running", "timestamp": "..." }
```

---

## 🧪 Tester l'authentification

### Login admin (avec curl)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@mediflow.test","password":"admin123"}'
```

Tu reçois :
```json
{
  "success": true,
  "data": {
    "user": { "_id": "...", "fullName": "Admin Mediflow", "role": "admin", ... },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Récupérer son profil (route protégée)

Copie l'`accessToken` et fais :

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TON_ACCESS_TOKEN_ICI"
```

### Créer un nouveau compte patient

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName":"Test Patient",
    "email":"test@test.com",
    "phone":"+21612345678",
    "password":"test1234",
    "preferredLanguage":"fr"
  }'
```

### Rafraîchir l'access token

```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"TON_REFRESH_TOKEN_ICI"}'
```

### Logout

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer TON_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"TON_REFRESH_TOKEN"}'
```

---

## 📁 Structure du projet

```
backend/
├── server.js                      ← point d'entrée
├── package.json
├── .env                           ← (à créer depuis .env.example)
├── .env.example
├── .gitignore
└── src/
    ├── config/
    │   └── db.js                  ← connexion Mongo
    ├── models/                    ← 18 schémas Mongoose
    │   ├── User.js
    │   ├── Patient.js
    │   ├── Doctor.js
    │   ├── Staff.js
    │   ├── Branch.js
    │   ├── Service.js
    │   ├── Appointment.js
    │   ├── Visit.js
    │   ├── Prescription.js
    │   ├── LabTest.js
    │   ├── Radiology.js
    │   ├── Procedure.js
    │   ├── Referral.js
    │   ├── Invoice.js
    │   ├── Notification.js
    │   ├── Queue.js
    │   ├── AuditLog.js
    │   ├── Attachment.js
    │   └── index.js
    ├── controllers/
    │   └── authController.js      ← register, login, refresh, logout, me
    ├── routes/
    │   ├── index.js
    │   └── authRoutes.js
    ├── middleware/
    │   ├── auth.js                ← protect, authorize(...roles)
    │   └── errorHandler.js
    ├── utils/
    │   ├── constants.js           ← ROLES, statuts
    │   ├── jwt.js
    │   └── asyncHandler.js
    └── seeders/
        └── index.js               ← données de test
```

---

## 🔐 Identifiants de test (après `npm run seed`)

| Rôle       | Email                        | Mot de passe  |
|------------|------------------------------|---------------|
| Admin      | admin@mediflow.test          | admin123      |
| Médecin 1  | dr.nader@mediflow.test       | doctor123     |
| Médecin 2  | dr.alaa@mediflow.test        | doctor123     |
| Réception  | reception@mediflow.test      | reception123  |
| Assistant  | assistant@mediflow.test      | assistant123  |
| Patient 1  | osama@mediflow.test          | patient123    |
| Patient 2  | ahmed@test.com               | patient123    |

---

## 🗺️ Prochaines phases

- [x] **Phase 1** — Backend + Auth + BDD ← **tu es ici**
- [ ] **Phase 2** — Routes métier (patients, RDV, services) + site public React
- [ ] **Phase 3** — Portail patient React (i18n AR/FR/EN, RTL)
- [ ] **Phase 4** — Admin clinique (dashboard, calendrier, Doctor Focus Mode, factures)
- [ ] **Phase 5** — App React Native
- [ ] **Phase 6** — Notifications, WhatsApp, déploiement prod

---

## 🐛 Problèmes courants

**`MongoServerError: bad auth`** → le mot de passe dans `MONGO_URI` est mauvais ou contient des caractères spéciaux non échappés. Régénère un mot de passe simple dans Atlas.

**`IP not whitelisted`** → retourne dans Atlas → Network Access → ajoute ton IP ou `0.0.0.0/0`.

**`Cannot find module 'X'`** → tu as oublié `npm install`.

**Port 5000 déjà utilisé** → change `PORT` dans `.env` (ex. 5001).

---

Quand Phase 1 tourne chez toi, envoie-moi **"Phase 1 OK"** et on attaque Phase 2 : le site public + le formulaire de réservation rapide (la page d'accueil de Mediflow). 🚀
