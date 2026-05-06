# 🎵 SUMVIBES Backend Architecture

## 📊 Modèle de Données

### Base de données : PostgreSQL + Prisma ORM

#### Modèles Principaux

##### 1. **Users & Authentication**
- `User` - Utilisateurs (Acheteurs/Vendeurs/Admin)
- `SellerProfile` - Profil vendeur avec statistiques et infos de paiement
- Authentification JWT avec bcrypt
- RGPD compliant (consentements trackés)

##### 2. **Beats & Catalog**
- `Beat` - Productions musicales
- `License` - Types de licences (Basic, Premium, Exclusive)
- Métadonnées riches (BPM, Genre, Mood, Instruments, Tags)
- SEO optimisé (slug, meta-description, keywords)

##### 3. **Transactions & Payments**
- `Purchase` - Achats avec gestion des licences
- `Withdrawal` - Retraits vendeurs
- Support Stripe & PayPal
- Calcul automatique des commissions plateforme

##### 4. **Reviews & Engagement**
- `Review` - Avis et notes (1-5 étoiles)
- `Favorite` - Système de favoris
- `CartItem` - Panier d'achat

##### 5. **Messaging & Community**
- `Message` - Messagerie instantanée
- `ForumPost` & `ForumComment` - Forum communautaire type X/Twitter
- `BlogPost` - Articles de blog

##### 6. **Referral & Analytics**
- `Referral` - Système de parrainage
- `Analytics` - Tracking des événements

## 🔐 API Routes Implémentées

### Authentication
- `POST /api/auth/register` - Inscription (BUYER/SELLER)
- `POST /api/auth/login` - Connexion avec JWT
- `GET /api/auth/me` - Profil utilisateur (TODO)

### Beats
- `GET /api/beats` - Liste avec filtres avancés
  - Filtres: genre, mood, BPM, prix, recherche, sellerId
  - Pagination: page, limit, sortBy, sortOrder
  - Inclut: seller info, licenses, stats

- `POST /api/beats` - Upload nouveau beat (TODO)
- `GET /api/beats/[id]` - Détails d'un beat (TODO)
- `PUT /api/beats/[id]` - Modifier un beat (TODO)
- `DELETE /api/beats/[id]` - Supprimer un beat (TODO)

### Purchases (TODO)
- `POST /api/purchases` - Créer un achat
- `GET /api/purchases` - Historique d'achats
- `GET /api/purchases/[id]/download` - Télécharger fichier

### Dashboard Vendeur (TODO)
- `GET /api/seller/stats` - Statistiques
- `POST /api/seller/withdraw` - Demande retrait

### Messages & Forum (TODO)
- `POST /api/messages` - Envoyer message
- `GET /api/messages` - Liste messages
- `POST /api/forum/posts` - Créer post
- `GET /api/forum/posts` - Liste posts

## 🛠️ Configuration

### Variables d'environnement (.env)
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="..."
STRIPE_SECRET_KEY="..."
AWS_S3_BUCKET="..."
```

### Installation
```bash
# Installer dépendances
npm install --save-dev prisma dotenv

# Générer le client Prisma
npx prisma generate

# Créer les migrations
npx prisma migrate dev --name init

# Seed la base de données (optionnel)
npx prisma db seed
```

## 📈 Next Steps (Kanban)

### ✅ Complété
- [x] Modèle de données complet
- [x] Configuration Prisma
- [x] API Auth (register, login)
- [x] API Beats (GET avec filtres)

### 🚧 En cours
- [ ] Middleware d'authentification
- [ ] Upload beats avec S3
- [ ] Player audio & watermarking
- [ ] Système de paiement Stripe

### 📋 À faire
- [ ] Dashboard vendeur
- [ ] Messagerie instantanée
- [ ] Forum communautaire
- [ ] Blog & News
- [ ] Analytics & SEO
- [ ] Géné PDF (factures/contrats)
- [ ] RGPD (pages légales)
- [ ] Système de parrainage

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt (salt rounds: 10)
- JWT pour l'authentification stateless
- Validation des inputs côté serveur
- Protection CSRF (TODO)
- Rate limiting (TODO)
- Upload files sécurisé (TODO)

## 🚀 Déploiement

- **Frontend**: Vercel
- **Base de données**: Supabase/Neon PostgreSQL
- **Stockage fichiers**: AWS S3 / Cloudflare R2
- **Paiements**: Stripe
- **Emails**: SendGrid/Resend

## 📚 Documentation API

Documentation complète API à venir (Swagger/OpenAPI)
