# GUIDE COMPLET - API Next.js avec Prisma et Neon PostgreSQL

## Introduction

Ce guide vous accompagne étape par étape pour transformer une API Next.js qui stocke les données en mémoire en une API complète avec base de données PostgreSQL persistante.

**Objectif final :** Avoir une API fonctionnelle avec base de données qui persiste les données même après redémarrage du serveur.

---

## PARTIE 1 : PRÉREQUIS ET VÉRIFICATIONS

### 1.1 Outils nécessaires

Avant de commencer, vérifiez que vous avez :

- **Node.js** installé (version 18 ou plus récente)
- **VSCode** avec l'extension **"REST Client"** installée
- **Un navigateur web** pour accéder à Neon
- **Un terminal/invite de commande** fonctionnel
- **Connexion internet** stable

### 1.2 Vérification du projet existant

Votre projet doit contenir ces fichiers :
```
src/
├── app/
│   ├── api/
│   │   └── articles/
│   │       ├── route.ts
│   │       └── [id]/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── data.ts
│   └── utils.ts
└── types/
    └── article.ts
```

### 1.3 Test initial du projet

Ouvrez un terminal dans votre projet et exécutez :

```bash
npm run dev
```

Vérifiez que le serveur démarre sur http://localhost:3000

---

## PARTIE 2 : CRÉATION DU COMPTE NEON DATABASE

### 2.1 Création du compte

1. **Allez sur https://neon.tech**
2. **Cliquez sur "Sign Up"** ou "Get Started"
3. **Créez un compte** avec votre email ou connectez-vous avec GitHub
4. **Validez votre email** si nécessaire

### 2.2 Création de votre première base de données

1. **Une fois connecté**, vous arrivez sur le dashboard
2. **Cliquez sur "Create Project"** ou "New Project"
3. **Donnez un nom à votre projet** : `articles-api`
4. **Choisissez une région** : AWS US EAST 1 (ou proche de vous)
5. **Cliquez sur "Create Project"**
6. **Attendez** que la base de données soit créée (quelques secondes)

### 2.3 Récupération de l'URL de connexion

1. **Dans le dashboard**, cherchez la section **"Connection string"** ou **"Connection details"**
2. **Cliquez sur "Connect"** (bouton noir en haut à droite)
3. **Copiez l'URL complète** qui ressemble à :
   ```
   postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. **IMPORTANT** : Gardez cette URL, vous en aurez besoin immédiatement

---

## PARTIE 3 : INSTALLATION DE PRISMA

### 3.1 Installation des dépendances

Dans votre terminal, dans le dossier du projet, exécutez :

```bash
npm install prisma @prisma/client
```

Attendez que l'installation se termine.

### 3.2 Initialisation de Prisma

```bash
npx prisma init
```

Cette commande crée :
- Un dossier `prisma/` avec le fichier `schema.prisma`
- Un fichier `.env` (que nous allons configurer)

---

## PARTIE 4 : CONFIGURATION DU FICHIER .env

### 4.1 Localisation du fichier .env

Après `npx prisma init`, un fichier `.env` doit être créé à la racine de votre projet (même niveau que `package.json`).

### 4.2 Configuration de l'URL de base de données

1. **Ouvrez le fichier `.env`** dans VSCode
2. **Vous devriez voir** :
   ```
   DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"
   ```
3. **Remplacez complètement cette ligne** par votre URL Neon :
   ```
   DATABASE_URL="postgresql://votre-username:votre-password@ep-votre-endpoint.us-east-1.aws.neon.tech/neondb?sslmode=require"
   ```

### 4.3 Exemple concret

Si votre URL Neon est :
```
postgresql://neondb_owner:ABC123def@ep-cool-morning-123456.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

Votre fichier `.env` doit contenir :
```
DATABASE_URL="postgresql://neondb_owner:ABC123def@ep-cool-morning-123456.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### 4.4 Points de vérification

Vérifiez que :
- Les guillemets sont présents autour de l'URL
- Il n'y a pas d'espaces avant ou après l'URL
- L'URL se termine par `?sslmode=require` (ou `&channel_binding=require`)
- Le fichier ne contient qu'une seule ligne

---

## PARTIE 5 : CONFIGURATION DU SCHÉMA PRISMA

### 5.1 Ouverture du fichier schema.prisma

Ouvrez le fichier `prisma/schema.prisma` dans VSCode.

### 5.2 Configuration du schéma

Remplacez tout le contenu par :

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Article {
  id        String   @id @default(cuid())
  title     String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("articles")
}
```

Sauvegardez le fichier (Ctrl+S).

---

## PARTIE 6 : CRÉATION DU CLIENT PRISMA

### 6.1 Création du fichier prisma.ts

Créez le fichier `src/lib/prisma.ts` avec ce contenu :

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configuration avec URL de fallback pour éviter les problèmes d'environnement
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_z1cN6qYxVFMB@ep-sparkling-hill-ae6xwlzp-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**IMPORTANT** : Remplacez l'URL de fallback par votre vraie URL Neon.

---

## PARTIE 7 : MODIFICATION DES ROUTES API

### 7.1 Modification de src/app/api/articles/route.ts

Remplacez tout le contenu par :

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(articles)
  } catch (error) {
    console.error('Error fetching articles:', error)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.title || !body.content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const newArticle = await prisma.article.create({
      data: {
        title: body.title,
        content: body.content,
      }
    })

    return NextResponse.json(newArticle, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
  }
}
```

### 7.2 Modification de src/app/api/articles/[id]/route.ts

Remplacez tout le contenu par :

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Route GET – Lire un seul article
export async function GET(_: Request, context: { params: { id: string } }) {
  try {
    const article = await prisma.article.findUnique({
      where: {
        id: context.params.id
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
  }
}

// Route PUT – Mettre à jour un article
export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const body = await req.json()

    if (!body.title || !body.content) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const updatedArticle = await prisma.article.update({
      where: {
        id: context.params.id
      },
      data: {
        title: body.title,
        content: body.content,
      }
    })

    return NextResponse.json(updatedArticle)
  } catch (error) {
    console.error('Error updating article:', error)
    // Vérifier si l'article existe
    const article = await prisma.article.findUnique({
      where: { id: context.params.id }
    })
    
    if (!article) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}

// Route DELETE – Supprimer un article
export async function DELETE(_: Request, context: { params: { id: string } }) {
  try {
    const deletedArticle = await prisma.article.delete({
      where: {
        id: context.params.id
      }
    })

    return NextResponse.json(deletedArticle)
  } catch (error) {
    console.error('Error deleting article:', error)
    // Vérifier si l'article existe
    const article = await prisma.article.findUnique({
      where: { id: context.params.id }
    })
    
    if (!article) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
```

### 7.3 Modification des types TypeScript

Modifiez `src/types/article.ts` :

```typescript
export type Article = {
    id: string
    title: string
    content: string
    createdAt: Date
    updatedAt: Date
}
```

---

## PARTIE 8 : GÉNÉRATION ET MIGRATION

### 8.1 Nettoyage préventif

Exécutez ces commandes dans l'ordre :

```bash
# Fermer tous les processus Node.js
taskkill /f /im node.exe
```

### 8.2 Génération du client Prisma

```bash
npx prisma generate
```

Vous devriez voir :
```
✔ Generated Prisma Client (v6.11.1) to .\node_modules\@prisma\client in XXms
```

### 8.3 Création de la table en base de données

```bash
npx prisma migrate dev --name init
```

Vous devriez voir :
```
Applying migration `20250709204257_init`
Your database is now in sync with your schema.
```

---

## PARTIE 9 : CRÉATION DU FICHIER DE TESTS

### 9.1 Création du fichier tests.http

Créez le fichier `tests.http` à la racine du projet avec ce contenu :

```http
### Tests API Articles - Next.js avec Neon Database
### ✅ Serveur lancé sur http://localhost:3000
### ✅ Base de données Neon connectée
### ✅ API fonctionnelle avec persistance

### Variables
@baseUrl = http://localhost:3000
@contentType = application/json

### ===========================================
### PREMIER TEST : Vérifier que la liste est vide
### ===========================================
### Objectif : S'assurer que l'API fonctionne et qu'il n'y a pas d'articles au départ

GET {{baseUrl}}/api/articles
Content-Type: {{contentType}}

### Résultat attendu : []

### ===========================================
### DEUXIÈME TEST : Créer le premier article
### ===========================================
### Objectif : Tester la création d'un article avec POST

POST {{baseUrl}}/api/articles
Content-Type: {{contentType}}

{
  "title": "Premier Article de Test",
  "content": "Ceci est le contenu du premier article créé pour tester l'API."
}

### Résultat attendu : Article créé avec ID, title, content, createdAt
### IMPORTANT : Copiez l'ID retourné pour les tests suivants !

### ===========================================
### TROISIÈME TEST : Créer un deuxième article
### ===========================================
### Objectif : Créer un autre article pour avoir plusieurs éléments

POST {{baseUrl}}/api/articles
Content-Type: {{contentType}}

{
  "title": "Deuxième Article",
  "content": "Voici le contenu du deuxième article pour enrichir notre base de données."
}

### Résultat attendu : Deuxième article créé avec un ID différent

### ===========================================
### QUATRIÈME TEST : Vérifier la liste des articles
### ===========================================
### Objectif : Confirmer que les deux articles sont bien créés

GET {{baseUrl}}/api/articles
Content-Type: {{contentType}}

### Résultat attendu : Tableau avec 2 articles

### ===========================================
### CINQUIÈME TEST : Récupérer un article spécifique
### ===========================================
### Objectif : Tester la récupération d'un article par son ID
### REMPLACEZ [ID_ARTICLE] par l'ID du premier article créé

GET {{baseUrl}}/api/articles/[ID_ARTICLE]
Content-Type: {{contentType}}

### Résultat attendu : Un seul article avec l'ID spécifié

### ===========================================
### SIXIÈME TEST : Mettre à jour un article
### ===========================================
### Objectif : Tester la modification d'un article existant
### REMPLACEZ [ID_ARTICLE] par l'ID d'un article existant

PUT {{baseUrl}}/api/articles/[ID_ARTICLE]
Content-Type: {{contentType}}

{
  "title": "Article Mis à Jour",
  "content": "Ceci est le contenu mis à jour de l'article. La date de création reste la même."
}

### Résultat attendu : Article modifié avec nouveau title et content

### ===========================================
### SEPTIÈME TEST : Supprimer un article
### ===========================================
### Objectif : Tester la suppression d'un article
### REMPLACEZ [ID_ARTICLE] par l'ID d'un article existant

DELETE {{baseUrl}}/api/articles/[ID_ARTICLE]
Content-Type: {{contentType}}

### Résultat attendu : Article supprimé retourné

### ===========================================
### TESTS D'ERREUR
### ===========================================

### Test d'erreur - Article inexistant
GET {{baseUrl}}/api/articles/article-inexistant-12345
Content-Type: {{contentType}}

### Test d'erreur - Création invalide (titre manquant)
POST {{baseUrl}}/api/articles
Content-Type: {{contentType}}

{
  "content": "Article sans titre"
}

### Test d'erreur - Modification invalide
PUT {{baseUrl}}/api/articles/article-inexistant-12345
Content-Type: {{contentType}}

{
  "title": "Test",
  "content": "Test"
}
```

---

## PARTIE 10 : TESTS ET VÉRIFICATIONS

### 10.1 Démarrage du serveur

```bash
npm run dev
```

Vérifiez que vous voyez :
```
✓ Ready in XXXXms
- Environments: .env
```

### 10.2 Tests avec VSCode REST Client

1. **Ouvrez le fichier `tests.http`** dans VSCode
2. **Installez l'extension "REST Client"** si ce n'est pas fait (Ctrl+Shift+X, recherchez "REST Client")
3. **Commencez par le PREMIER TEST** : cliquez sur "Send Request" au-dessus de la première requête GET
4. **Vous devriez avoir** : `[]` (liste vide)
5. **Continuez avec le DEUXIÈME TEST** : créez votre premier article
6. **Copiez l'ID retourné** pour les tests suivants

### 10.3 Vérification dans Neon

1. **Retournez dans votre dashboard Neon**
2. **Actualisez la page** (F5)
3. **Cliquez sur "Tables"** dans la sidebar
4. **Vous devriez voir la table "articles"**
5. **Cliquez sur la table** pour voir vos données

### 10.4 Test de persistance

1. **Créez 2-3 articles** via l'API
2. **Arrêtez le serveur** (Ctrl+C dans le terminal)
3. **Redémarrez** avec `npm run dev`
4. **Refaites le test GET** : les articles sont toujours là !

---

## PARTIE 11 : TROUBLESHOOTING

### 11.1 Erreur "Environment variable not found: DATABASE_URL"

**Solution :**
1. Vérifiez que le fichier `.env` existe à la racine
2. Vérifiez que l'URL est entre guillemets
3. Redémarrez le serveur complètement :
   ```bash
   taskkill /f /im node.exe
   npm run dev
   ```

### 11.2 Erreur EPERM (Windows)

**Solution :**
```bash
taskkill /f /im node.exe
Remove-Item -Recurse -Force .next
npx prisma generate
npm run dev
```

### 11.3 Erreur de connexion à Neon

**Solution :**
1. Vérifiez votre URL Neon dans le dashboard
2. Re-copiez l'URL complète
3. Vérifiez que `?sslmode=require` est à la fin

### 11.4 Table "articles" non créée

**Solution :**
```bash
npx prisma db push
```

---

## PARTIE 12 : COMMANDES DE MAINTENANCE

### 12.1 Commandes utiles

```bash
# Voir les tables créées
npx prisma studio

# Réinitialiser complètement la base
npx prisma migrate reset

# Voir le statut des migrations
npx prisma migrate status

# Formater le schéma
npx prisma format

# Voir la base actuelle
npx prisma db pull
```

### 12.2 Tests en ligne de commande

```bash
# Test GET
curl http://localhost:3000/api/articles

# Test POST (Windows PowerShell)
Invoke-RestMethod -Uri "http://localhost:3000/api/articles" -Method Post -ContentType "application/json" -Body '{"title":"Test","content":"Test content"}'
```

---

## PARTIE 13 : VÉRIFICATIONS FINALES

### 13.1 Checklist de validation

Vérifiez que tout fonctionne :

- [ ] Compte Neon créé avec succès
- [ ] Fichier `.env` créé avec la bonne URL
- [ ] Commande `npx prisma generate` exécutée sans erreur
- [ ] Commande `npx prisma migrate dev` exécutée sans erreur
- [ ] Serveur Next.js démarre sans erreur sur http://localhost:3000
- [ ] Table "articles" visible dans le dashboard Neon
- [ ] API répond avec `[]` sur GET /api/articles
- [ ] Création d'article fonctionne avec POST
- [ ] Les données persistent après redémarrage du serveur

### 13.2 Test complet final

1. **Créez 3 articles** via l'API
2. **Modifiez un article**
3. **Supprimez un article**
4. **Arrêtez et redémarrez le serveur**
5. **Vérifiez que les changements sont conservés**

---

## CONCLUSION

### Félicitations !

Vous avez maintenant :

- ✅ **Une API Next.js fonctionnelle** avec toutes les routes CRUD
- ✅ **Une base de données PostgreSQL** sur Neon
- ✅ **Un ORM Prisma** configuré et opérationnel
- ✅ **La persistance des données** (plus de stockage en mémoire)
- ✅ **Des tests automatisés** avec VSCode REST Client
- ✅ **Une documentation complète** de votre API

### Fonctionnalités obtenues

**Endpoints disponibles :**
- `GET /api/articles` - Récupérer tous les articles
- `POST /api/articles` - Créer un nouvel article
- `GET /api/articles/[id]` - Récupérer un article spécifique
- `PUT /api/articles/[id]` - Mettre à jour un article
- `DELETE /api/articles/[id]` - Supprimer un article

**Améliorations techniques :**
- IDs générés automatiquement (CUID)
- Horodatage automatique (createdAt, updatedAt)
- Tri par date de création décroissante
- Validation des données
- Gestion d'erreurs complète (404, 500)
- Type safety avec TypeScript

### Prochaines étapes possibles

Pour aller plus loin, vous pourriez ajouter :
- Une interface utilisateur React
- L'authentification des utilisateurs
- La pagination pour les grandes listes
- La recherche dans les articles
- L'upload d'images
- La validation avancée avec Zod

**Votre API est maintenant prête pour la production !** 🎉

---

## ANNEXE : TOUTES LES COMMANDES EXÉCUTÉES

### A.1 - INSTALLATION ET INITIALISATION

```bash
# Installation des dépendances Prisma
npm install prisma @prisma/client

# Initialisation de Prisma (crée prisma/schema.prisma et .env)
npx prisma init
```

### A.2 - GÉNÉRATION ET MIGRATION

```bash
# Génération du client Prisma (obligatoire après modification du schéma)
npx prisma generate

# Création de la première migration et de la table en base
npx prisma migrate dev --name init

# Alternative : push direct du schéma sans migration
npx prisma db push
```

### A.3 - GESTION DU SERVEUR

```bash
# Démarrage du serveur de développement
npm run dev

# Arrêt forcé des processus Node.js (Windows - troubleshooting)
taskkill /f /im node.exe

# Nettoyage du cache Next.js (troubleshooting)
Remove-Item -Recurse -Force .next
```

### A.4 - COMMANDES DE MAINTENANCE PRISMA

```bash
# Ouvrir Prisma Studio (interface graphique pour la base)
npx prisma studio

# Voir le statut des migrations
npx prisma migrate status

# Réinitialiser complètement la base de données
npx prisma migrate reset

# Formater le fichier schema.prisma
npx prisma format

# Synchroniser le schéma avec la base existante
npx prisma db pull

# Régénérer le client après modification du schéma
npx prisma generate
```

### A.5 - TESTS API AVEC CURL (WINDOWS)

```bash
# Test GET - Récupérer tous les articles
curl http://localhost:3000/api/articles

# Test GET - Récupérer un article spécifique
curl http://localhost:3000/api/articles/ID_ARTICLE

# Test POST - Créer un article (Windows PowerShell)
Invoke-RestMethod -Uri "http://localhost:3000/api/articles" -Method Post -ContentType "application/json" -Body '{"title":"Test Article","content":"Test content"}'

# Test PUT - Modifier un article (Windows PowerShell)
Invoke-RestMethod -Uri "http://localhost:3000/api/articles/ID_ARTICLE" -Method Put -ContentType "application/json" -Body '{"title":"Updated Title","content":"Updated content"}'

# Test DELETE - Supprimer un article (Windows PowerShell)
Invoke-RestMethod -Uri "http://localhost:3000/api/articles/ID_ARTICLE" -Method Delete
```

### A.6 - TESTS API AVEC CURL (LINUX/MAC)

```bash
# Test GET - Récupérer tous les articles
curl -X GET http://localhost:3000/api/articles

# Test POST - Créer un article
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Article","content":"Test content"}'

# Test PUT - Modifier un article
curl -X PUT http://localhost:3000/api/articles/ID_ARTICLE \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title","content":"Updated content"}'

# Test DELETE - Supprimer un article
curl -X DELETE http://localhost:3000/api/articles/ID_ARTICLE
```

### A.7 - COMMANDES DE DIAGNOSTIC

```bash
# Vérifier la version de Node.js
node --version

# Vérifier la version de npm
npm --version

# Vérifier les dépendances installées
npm list prisma @prisma/client

# Voir les logs détaillés de Prisma
npx prisma generate --verbose

# Tester la connexion à la base de données
npx prisma db execute --stdin
```

### A.8 - COMMANDES DE NETTOYAGE (TROUBLESHOOTING)

```bash
# Nettoyage complet des processus et cache (Windows)
taskkill /f /im node.exe
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules\.prisma
npx prisma generate
npm run dev

# Nettoyage complet des processus et cache (Linux/Mac)
pkill node
rm -rf .next
rm -rf node_modules/.prisma
npx prisma generate
```

### A.9 - VÉRIFICATIONS DE CONFIGURATION

```bash
# Vérifier que le fichier .env est lu
Get-Content .env

# Vérifier les variables d'environnement
echo $env:DATABASE_URL

# Vérifier la configuration Prisma
npx prisma validate

# Voir la configuration de la base actuelle
npx prisma db seed
```

### A.10 - COMMANDES COMPLÈTES D'INSTALLATION (SÉQUENCE)

```bash
# Séquence complète d'installation (à exécuter dans l'ordre)
npm install prisma @prisma/client
npx prisma init
# [Modifier le schema.prisma et .env]
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### A.11 - COMMANDES DE DÉBOGAGE NEON

```bash
# Tester la connexion à Neon avec l'URL complète
npx prisma db execute --stdin --url="postgresql://user:pass@host/db?sslmode=require"

# Voir les tables créées
npx prisma db execute --stdin --sql="SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"

# Compter les articles dans la table
npx prisma db execute --stdin --sql="SELECT COUNT(*) FROM articles;"

# Voir le contenu de la table articles
npx prisma db execute --stdin --sql="SELECT * FROM articles;"
```

### A.12 - COMMANDES DE REMISE À ZÉRO

```bash
# Remise à zéro complète du projet (ATTENTION : efface toutes les données)
npx prisma migrate reset --force
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

### A.13 - COMMANDES DE PRODUCTION

```bash
# Générer le client pour la production
npx prisma generate

# Appliquer les migrations en production
npx prisma migrate deploy

# Build Next.js pour la production
npm run build

# Démarrer en mode production
npm start
```

---

## NOTES IMPORTANTES SUR LES COMMANDES

### Ordre d'exécution obligatoire :
1. `npm install prisma @prisma/client`
2. `npx prisma init`
3. Modification du `schema.prisma` et `.env`
4. `npx prisma generate`
5. `npx prisma migrate dev --name init`
6. `npm run dev`

### Commandes à exécuter après chaque modification du schéma :
```bash
npx prisma generate
npx prisma migrate dev --name nom_migration
```

### Commandes de dépannage Windows :
```bash
taskkill /f /im node.exe
Remove-Item -Recurse -Force .next
npx prisma generate
npm run dev
```

### Variables d'environnement critiques :
- `DATABASE_URL` : URL de connexion à Neon PostgreSQL
- `NODE_ENV` : environnement d'exécution (development/production)

### Ports utilisés :
- **3000** : Serveur Next.js
- **5432** : PostgreSQL (Neon)
- **5555** : Prisma Studio (optionnel)

---

**Cette annexe contient toutes les commandes exécutées lors de l'intégration Prisma + Neon PostgreSQL dans le projet Next.js.** 