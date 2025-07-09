# EXERCICE PRATIQUE - Ajout des Auteurs avec Relations

## 🎯 OBJECTIF DE L'EXERCICE

Maintenant que vous maîtrisez l'intégration Prisma + Neon PostgreSQL, vous allez ajouter une nouvelle entité **"Auteur"** avec une relation **"Un auteur peut avoir plusieurs articles"**.

Cet exercice vous permettra de :
- ✅ Comprendre les **relations Prisma** (One-to-Many)
- ✅ Pratiquer les **migrations** avec modifications de schéma
- ✅ Créer des **CRUD complets** pour une nouvelle entité
- ✅ Gérer les **relations** dans les API Next.js
- ✅ Tester les **endpoints** avec des données liées

---

## 📋 CAHIER DES CHARGES

### Fonctionnalités à implémenter :

**1. Entité Auteur**
- `id` : Identifiant unique (CUID)
- `nom` : Nom de l'auteur (obligatoire)
- `email` : Email de l'auteur (obligatoire, unique)
- `bio` : Biographie de l'auteur (optionnel)
- `createdAt` : Date de création automatique
- `updatedAt` : Date de mise à jour automatique

**2. Relations**
- Un auteur peut avoir **plusieurs articles**
- Un article appartient à **un seul auteur**
- Suppression en cascade : si un auteur est supprimé, ses articles sont supprimés

**3. Endpoints API à créer**
- `GET /api/auteurs` - Lister tous les auteurs
- `POST /api/auteurs` - Créer un nouvel auteur
- `GET /api/auteurs/[id]` - Récupérer un auteur spécifique
- `PUT /api/auteurs/[id]` - Mettre à jour un auteur
- `DELETE /api/auteurs/[id]` - Supprimer un auteur
- `GET /api/auteurs/[id]/articles` - Récupérer les articles d'un auteur

**4. Modification des articles**
- Ajouter le champ `auteurId` aux articles existants
- Modifier les endpoints articles pour inclure les informations de l'auteur

---

## 🚀 ÉTAPE 1 : MODIFICATION DU SCHÉMA PRISMA

### 1.1 Ouvrez le fichier `prisma/schema.prisma`

### 1.2 Remplacez le contenu par :

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
  
  // Relation avec l'auteur
  auteurId  String
  auteur    Auteur   @relation(fields: [auteurId], references: [id], onDelete: Cascade)

  @@map("articles")
}

model Auteur {
  id        String   @id @default(cuid())
  nom       String
  email     String   @unique
  bio       String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relation avec les articles
  articles  Article[]

  @@map("auteurs")
}
```

### 1.3 Génération et migration

```bash
# Générer le client Prisma
npx prisma generate

# Créer la migration
npx prisma migrate dev --name add_auteurs
```

---

## 🔧 ÉTAPE 2 : CRÉATION DES TYPES TYPESCRIPT

### 2.1 Créez le fichier `src/types/auteur.ts`

```typescript
export type Auteur = {
    id: string
    nom: string
    email: string
    bio?: string | null
    createdAt: Date
    updatedAt: Date
}

export type AuteurWithArticles = Auteur & {
    articles: Article[]
}

// Import depuis le fichier article existant
import { Article } from './article'
```

### 2.2 Modifiez `src/types/article.ts`

```typescript
export type Article = {
    id: string
    title: string
    content: string
    createdAt: Date
    updatedAt: Date
    auteurId: string
}

export type ArticleWithAuteur = Article & {
    auteur: Auteur
}

// Import depuis le fichier auteur
import { Auteur } from './auteur'
```

---

## 🛠️ ÉTAPE 3 : ROUTES API POUR LES AUTEURS

### 3.1 Créez le dossier `src/app/api/auteurs/`

### 3.2 Créez `src/app/api/auteurs/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const auteurs = await prisma.auteur.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    })
    return NextResponse.json(auteurs)
  } catch (error) {
    console.error('Error fetching auteurs:', error)
    return NextResponse.json({ error: 'Failed to fetch auteurs' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.nom || !body.email) {
      return NextResponse.json({ error: 'Missing required fields: nom, email' }, { status: 400 })
    }

    const newAuteur = await prisma.auteur.create({
      data: {
        nom: body.nom,
        email: body.email,
        bio: body.bio || null,
      }
    })

    return NextResponse.json(newAuteur, { status: 201 })
  } catch (error) {
    console.error('Error creating auteur:', error)
    
    // Gestion de l'erreur d'email unique
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    
    return NextResponse.json({ error: 'Failed to create auteur' }, { status: 500 })
  }
}
```

### 3.3 Créez `src/app/api/auteurs/[id]/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer un auteur spécifique
export async function GET(_: Request, context: { params: { id: string } }) {
  try {
    const auteur = await prisma.auteur.findUnique({
      where: {
        id: context.params.id
      },
      include: {
        articles: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!auteur) {
      return NextResponse.json({ error: 'Auteur not found' }, { status: 404 })
    }

    return NextResponse.json(auteur)
  } catch (error) {
    console.error('Error fetching auteur:', error)
    return NextResponse.json({ error: 'Failed to fetch auteur' }, { status: 500 })
  }
}

// PUT - Mettre à jour un auteur
export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const body = await req.json()

    if (!body.nom || !body.email) {
      return NextResponse.json({ error: 'Missing required fields: nom, email' }, { status: 400 })
    }

    const updatedAuteur = await prisma.auteur.update({
      where: {
        id: context.params.id
      },
      data: {
        nom: body.nom,
        email: body.email,
        bio: body.bio || null,
      }
    })

    return NextResponse.json(updatedAuteur)
  } catch (error) {
    console.error('Error updating auteur:', error)
    
    // Vérifier si l'auteur existe
    const auteur = await prisma.auteur.findUnique({
      where: { id: context.params.id }
    })
    
    if (!auteur) {
      return NextResponse.json({ error: 'Auteur not found' }, { status: 404 })
    }

    // Gestion de l'erreur d'email unique
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    
    return NextResponse.json({ error: 'Failed to update auteur' }, { status: 500 })
  }
}

// DELETE - Supprimer un auteur
export async function DELETE(_: Request, context: { params: { id: string } }) {
  try {
    const deletedAuteur = await prisma.auteur.delete({
      where: {
        id: context.params.id
      }
    })

    return NextResponse.json(deletedAuteur)
  } catch (error) {
    console.error('Error deleting auteur:', error)
    
    // Vérifier si l'auteur existe
    const auteur = await prisma.auteur.findUnique({
      where: { id: context.params.id }
    })
    
    if (!auteur) {
      return NextResponse.json({ error: 'Auteur not found' }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Failed to delete auteur' }, { status: 500 })
  }
}
```

### 3.4 Créez `src/app/api/auteurs/[id]/articles/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Récupérer les articles d'un auteur
export async function GET(_: Request, context: { params: { id: string } }) {
  try {
    const auteur = await prisma.auteur.findUnique({
      where: {
        id: context.params.id
      },
      include: {
        articles: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!auteur) {
      return NextResponse.json({ error: 'Auteur not found' }, { status: 404 })
    }

    return NextResponse.json(auteur.articles)
  } catch (error) {
    console.error('Error fetching auteur articles:', error)
    return NextResponse.json({ error: 'Failed to fetch auteur articles' }, { status: 500 })
  }
}
```

---

## 🔄 ÉTAPE 4 : MODIFICATION DES ROUTES ARTICLES

### 4.1 Modifiez `src/app/api/articles/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        auteur: {
          select: {
            id: true,
            nom: true,
            email: true
          }
        }
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

    if (!body.title || !body.content || !body.auteurId) {
      return NextResponse.json({ error: 'Missing required fields: title, content, auteurId' }, { status: 400 })
    }

    // Vérifier que l'auteur existe
    const auteur = await prisma.auteur.findUnique({
      where: { id: body.auteurId }
    })

    if (!auteur) {
      return NextResponse.json({ error: 'Auteur not found' }, { status: 404 })
    }

    const newArticle = await prisma.article.create({
      data: {
        title: body.title,
        content: body.content,
        auteurId: body.auteurId,
      },
      include: {
        auteur: {
          select: {
            id: true,
            nom: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(newArticle, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
  }
}
```

### 4.2 Modifiez `src/app/api/articles/[id]/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Route GET – Lire un seul article
export async function GET(_: Request, context: { params: { id: string } }) {
  try {
    const article = await prisma.article.findUnique({
      where: {
        id: context.params.id
      },
      include: {
        auteur: {
          select: {
            id: true,
            nom: true,
            email: true,
            bio: true
          }
        }
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
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
      return NextResponse.json({ error: 'Missing required fields: title, content' }, { status: 400 })
    }

    // Si auteurId est fourni, vérifier qu'il existe
    if (body.auteurId) {
      const auteur = await prisma.auteur.findUnique({
        where: { id: body.auteurId }
      })

      if (!auteur) {
        return NextResponse.json({ error: 'Auteur not found' }, { status: 404 })
      }
    }

    const updatedArticle = await prisma.article.update({
      where: {
        id: context.params.id
      },
      data: {
        title: body.title,
        content: body.content,
        ...(body.auteurId && { auteurId: body.auteurId }),
      },
      include: {
        auteur: {
          select: {
            id: true,
            nom: true,
            email: true
          }
        }
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
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
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
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }
    
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
```

---

## 🧪 ÉTAPE 5 : FICHIER DE TESTS

### 5.1 Créez le fichier `tests-auteurs.http`

```http
### Tests API Auteurs - Exercice Pratique
### ✅ Serveur lancé sur http://localhost:3000
### ✅ Migration auteurs appliquée
### ✅ Relations fonctionnelles

### Variables
@baseUrl = http://localhost:3000
@contentType = application/json

### ===========================================
### TESTS AUTEURS
### ===========================================

### 1. Lister tous les auteurs (doit être vide au début)
GET {{baseUrl}}/api/auteurs
Content-Type: {{contentType}}

### 2. Créer le premier auteur
POST {{baseUrl}}/api/auteurs
Content-Type: {{contentType}}

{
  "nom": "Jean Dupont",
  "email": "jean.dupont@email.com",
  "bio": "Écrivain passionné de technologie et de développement web."
}

### 3. Créer un deuxième auteur
POST {{baseUrl}}/api/auteurs
Content-Type: {{contentType}}

{
  "nom": "Marie Martin",
  "email": "marie.martin@email.com",
  "bio": "Journaliste spécialisée dans l'innovation numérique."
}

### 4. Créer un troisième auteur sans bio
POST {{baseUrl}}/api/auteurs
Content-Type: {{contentType}}

{
  "nom": "Pierre Lambert",
  "email": "pierre.lambert@email.com"
}

### 5. Lister tous les auteurs (doit maintenant en avoir 3)
GET {{baseUrl}}/api/auteurs
Content-Type: {{contentType}}

### 6. Récupérer un auteur spécifique
### REMPLACEZ [ID_AUTEUR] par l'ID d'un auteur créé
GET {{baseUrl}}/api/auteurs/[ID_AUTEUR]
Content-Type: {{contentType}}

### 7. Mettre à jour un auteur
### REMPLACEZ [ID_AUTEUR] par l'ID d'un auteur créé
PUT {{baseUrl}}/api/auteurs/[ID_AUTEUR]
Content-Type: {{contentType}}

{
  "nom": "Jean Dupont-Martin",
  "email": "jean.dupont.martin@email.com",
  "bio": "Écrivain et développeur full-stack, expert en React et Node.js."
}

### ===========================================
### TESTS ARTICLES AVEC AUTEURS
### ===========================================

### 8. Créer un article avec auteur
### REMPLACEZ [ID_AUTEUR] par l'ID d'un auteur créé
POST {{baseUrl}}/api/articles
Content-Type: {{contentType}}

{
  "title": "Introduction à React",
  "content": "React est une bibliothèque JavaScript populaire pour créer des interfaces utilisateur.",
  "auteurId": "[ID_AUTEUR]"
}

### 9. Créer un deuxième article avec le même auteur
### REMPLACEZ [ID_AUTEUR] par l'ID d'un auteur créé
POST {{baseUrl}}/api/articles
Content-Type: {{contentType}}

{
  "title": "Prisma avec Next.js",
  "content": "Prisma est un ORM moderne qui facilite l'accès aux bases de données.",
  "auteurId": "[ID_AUTEUR]"
}

### 10. Lister tous les articles (avec infos auteur)
GET {{baseUrl}}/api/articles
Content-Type: {{contentType}}

### 11. Récupérer un article spécifique (avec infos auteur)
### REMPLACEZ [ID_ARTICLE] par l'ID d'un article créé
GET {{baseUrl}}/api/articles/[ID_ARTICLE]
Content-Type: {{contentType}}

### 12. Récupérer les articles d'un auteur spécifique
### REMPLACEZ [ID_AUTEUR] par l'ID d'un auteur créé
GET {{baseUrl}}/api/auteurs/[ID_AUTEUR]/articles
Content-Type: {{contentType}}

### ===========================================
### TESTS D'ERREURS
### ===========================================

### 13. Créer un auteur avec email déjà utilisé
POST {{baseUrl}}/api/auteurs
Content-Type: {{contentType}}

{
  "nom": "Autre Nom",
  "email": "jean.dupont@email.com"
}

### 14. Créer un article avec auteur inexistant
POST {{baseUrl}}/api/articles
Content-Type: {{contentType}}

{
  "title": "Article Test",
  "content": "Contenu test",
  "auteurId": "auteur-inexistant-123"
}

### 15. Récupérer un auteur inexistant
GET {{baseUrl}}/api/auteurs/auteur-inexistant-123
Content-Type: {{contentType}}

### 16. Supprimer un auteur (et ses articles en cascade)
### REMPLACEZ [ID_AUTEUR] par l'ID d'un auteur créé
DELETE {{baseUrl}}/api/auteurs/[ID_AUTEUR]
Content-Type: {{contentType}}

### 17. Vérifier que les articles de l'auteur ont été supprimés
GET {{baseUrl}}/api/articles
Content-Type: {{contentType}}
```

---

## ✅ ÉTAPE 6 : VALIDATION ET TESTS

### 6.1 Commandes à exécuter

```bash
# 1. Générer le client Prisma
npx prisma generate

# 2. Appliquer la migration
npx prisma migrate dev --name add_auteurs

# 3. Démarrer le serveur
npm run dev

# 4. Tester avec le fichier tests-auteurs.http
```

### 6.2 Points de validation

Vérifiez que :
- [ ] La migration s'est bien appliquée
- [ ] Les tables `auteurs` et `articles` existent dans Neon
- [ ] Les relations fonctionnent correctement
- [ ] Tous les endpoints auteurs répondent
- [ ] Les articles incluent les informations de l'auteur
- [ ] La suppression en cascade fonctionne
- [ ] Les erreurs sont bien gérées (email unique, auteur inexistant)

### 6.3 Validation dans Neon Dashboard

1. **Connectez-vous à votre dashboard Neon**
2. **Allez dans "Tables"**
3. **Vérifiez la présence des tables :**
   - `articles` (avec le champ `auteur_id`)
   - `auteurs` (nouvelle table)
4. **Testez les données** directement dans l'interface

---

## 🎯 CRITÈRES DE RÉUSSITE

### Fonctionnalités à démontrer :

1. **CRUD Auteurs complet** ✅
   - Créer, lire, modifier, supprimer des auteurs
   - Gestion des erreurs (email unique, etc.)

2. **Relations fonctionnelles** ✅
   - Articles liés à un auteur
   - Récupération des articles d'un auteur
   - Suppression en cascade

3. **API cohérente** ✅
   - Codes de statut HTTP appropriés
   - Messages d'erreur clairs
   - Validation des données

4. **Tests complets** ✅
   - Tests de tous les endpoints
   - Tests d'erreurs
   - Validation des relations

---

## 🏆 BONUS (OPTIONNEL)

Si vous voulez aller plus loin :

### Bonus 1 : Endpoint de statistiques
Créez `GET /api/stats` qui retourne :
```json
{
  "totalAuteurs": 5,
  "totalArticles": 12,
  "auteurLePlusProductif": {
    "nom": "Jean Dupont",
    "nombreArticles": 4
  }
}
```

### Bonus 2 : Recherche
Créez `GET /api/auteurs/search?q=jean` pour rechercher des auteurs par nom.

### Bonus 3 : Pagination
Ajoutez la pagination aux endpoints avec `?page=1&limit=10`.

---

## 🔧 AIDE AU DÉPANNAGE

### Problèmes fréquents :

1. **Migration échoue** : Vérifiez que la base est accessible
2. **Erreur de relation** : Vérifiez les foreign keys dans le schéma
3. **Erreur 500** : Vérifiez les logs dans le terminal
4. **Données manquantes** : Vérifiez que les `include` sont bien configurés

### Commandes utiles :

```bash
# Voir le statut des migrations
npx prisma migrate status

# Réinitialiser la base (ATTENTION : supprime toutes les données)
npx prisma migrate reset

# Ouvrir Prisma Studio pour voir les données
npx prisma studio
```

---

## 🎉 CONCLUSION

Une fois cet exercice terminé, vous aurez :

- ✅ **Maîtrisé les relations Prisma** (One-to-Many)
- ✅ **Créé une API complète** avec 6 endpoints
- ✅ **Géré les contraintes** (unique, foreign keys)
- ✅ **Implémenté la suppression en cascade**
- ✅ **Validé avec des tests complets**

**Bravo ! Vous êtes maintenant autonome pour créer des APIs complexes avec Prisma et Next.js !** 🚀

---

*Cet exercice est conçu pour consolider vos acquis et vous préparer à des projets plus ambitieux. N'hésitez pas à expérimenter et à ajouter vos propres fonctionnalités !* 