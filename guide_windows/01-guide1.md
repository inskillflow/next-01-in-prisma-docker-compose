# GUIDE – Next.js + Prisma + PostgreSQL **local (Windows + pgAdmin)**

## 1) Installer PostgreSQL & pgAdmin (Windows)

1. Télécharge l’installateur PostgreSQL pour Windows (EnterpriseDB).
2. Pendant l’installation, **coche** :

   * PostgreSQL Server
   * **pgAdmin 4**
   * Command Line Tools
   * Quand nous vous demandons un mot de passe, spécifiez le mot de passe suivant : postgres
3. Choisis un **mot de passe superutilisateur** pour `postgres` (note-le).
4. **Port** : 5432 (par défaut).
5. Termine l’installation (tu peux ignorer Stack Builder).

## 2) Première ouverture de pgAdmin

1. Lance **pgAdmin 4** (menu Démarrer).
2. Crée un **Master Password** (mot de passe local pour déverrouiller pgAdmin).
3. Dans la barre de gauche, **clic droit > Register > Server…**

   * **General > Name** : `Localhost`
   * **Connection**

     * Host name/address : `localhost`
     * Port : `5432`
     * Maintenance DB : `postgres`
     * Username : `postgres`
     * Password : *(ton mot de passe défini à l’installation)* - par exemple postgres
     * Coche “Save password”

> Tu es maintenant connecté à ton serveur local.

## 3) Créer l’utilisateur et la base **dans pgAdmin** (GUI)

### 3.1 Créer le rôle (login) `app_user`

* Clic droit sur **Servers > Localhost > Login/Group Roles > Create > Login/Group Role…**

  * **General > Name** : `app_user`
  * **Definition** : mets un **Password** (ex. `app_password`)
  * **Privileges** :

    * **Login** : Yes
    * (Laisse **Superuser** à No ; **Create DB** pas obligatoire)
  * **Save**

### 3.2 Créer la base `articles_db` **appartenant** à `app_user`

* Clic droit sur **Databases > Create > Database…**

  * **Database** : `articles_db`
  * **Owner** : `app_user`
  * **Save**

### 3.3 (Option recommandé) Donner les privilèges sur le schéma `public`

* Sélectionne **articles_db > Tools > Query Tool**
* Exécute ces commandes **dans `articles_db`** :

```sql
-- (Tu es dans la DB articles_db via le menu déroulant du Query Tool)
GRANT ALL PRIVILEGES ON DATABASE articles_db TO app_user;
GRANT ALL ON SCHEMA public TO app_user;

-- Par défaut, Prisma créera des tables dans le schéma public.
-- On s’assure que les futures tables soient accessibles :
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO app_user;
```

> À ce stade, ta base locale est prête.

---

## 4) Configurer le projet Next.js + Prisma

### 4.1 Installer Prisma

#### 4.4.1. D'abord cloner le projet 

```bash
git clone https://github.com/hrhouma1/next-01-projet03-in-prisma.git
cd next-01-projet03-in-prisma
code . 
```

#### 4.4.2. Installer prisma


```bash
npm install prisma @prisma/client
npx prisma init
```

→ crée `prisma/schema.prisma` et `.env`.

### 4.2 `.env` (Windows, local)

Ouvre **`.env`** à la racine et mets **exactement** :

```env
DATABASE_URL="postgresql://app_user:app_password@localhost:5432/articles_db?schema=public"
```

> Remplace `app_user` / `app_password` si tu as choisi d’autres valeurs.

### 4.3 `prisma/schema.prisma`

```prisma
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

### 4.4 Client Prisma (singleton) – `src/lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'], // utile en dev
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## 5) Routes API (inchangées)

### `src/app/api/articles/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const articles = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } })
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
      data: { title: body.title, content: body.content }
    })
    return NextResponse.json(newArticle, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 })
  }
}
```

### `src/app/api/articles/[id]/route.ts`

*(identique à ta version Neon ; je la remets pour clarté)*

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, context: { params: { id: string } }) {
  try {
    const article = await prisma.article.findUnique({ where: { id: context.params.id } })
    if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(article)
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 })
  }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const body = await req.json()
    if (!body.title || !body.content) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    const updated = await prisma.article.update({
      where: { id: context.params.id },
      data: { title: body.title, content: body.content }
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating article:', error)
    const exists = await prisma.article.findUnique({ where: { id: context.params.id } })
    if (!exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 })
  }
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
  try {
    const deleted = await prisma.article.delete({ where: { id: context.params.id } })
    return NextResponse.json(deleted)
  } catch (error) {
    console.error('Error deleting article:', error)
    const exists = await prisma.article.findUnique({ where: { id: context.params.id } })
    if (!exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
```

### Type `Article` – `src/types/article.ts`

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

## 6) Migrations & génération Prisma (Windows)

```bash
# Ferme les serveurs Next.js ouverts si besoin
taskkill /f /im node.exe

# Générer le client Prisma
npx prisma generate

# Créer/appliquer la 1ère migration
npx prisma migrate dev --name init
```

**Attendu :**

```
Applying migration `..._init`
Your database is now in sync with your schema.
```

---

## 7) Tests rapides

### 7.1 Démarrer Next.js

```bash
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

### 7.2 (Optionnel) Fichier `tests.http` (VSCode – REST Client)

Crée `tests.http` à la racine (identique à ta version ; remplace juste les commentaires Neon par “PostgreSQL local”).
Tu peux réutiliser intégralement le bloc que tu avais — il fonctionne tel quel.

---

## 8) Vérifier dans pgAdmin

1. Dans **Localhost > Databases > articles_db > Schemas > public > Tables**, tu devrais voir **articles** après la migration.
2. **Right-click > View/Edit Data > All Rows** pour voir/éditer les lignes.
3. Tu peux aussi utiliser **Query Tool** :

```sql
SELECT * FROM articles ORDER BY createdat DESC;
```

---

## 9) Dépannage **spécifique Windows**

* **`Environment variable not found: DATABASE_URL`**

  * Vérifie que `.env` est à la **racine** (même niveau que `package.json`), que la ligne est **entre guillemets**, puis redémarre :

    ```bash
    taskkill /f /im node.exe
    npm run dev
    ```

* **`password authentication failed for user "app_user"`**

  * Dans pgAdmin : **Login/Group Roles > app_user > Properties > Definition** → vérifie le mot de passe.
  * Revois la **chaîne `.env`** : utilisateur, mot de passe, base, port.

* **`database "articles_db" does not exist`**

  * Recrée la base dans pgAdmin (Owner = `app_user`) et relance `npx prisma migrate dev`.

* **Tables absentes (`relation "articles" does not exist`)**

  * Lance :

    ```bash
    npx prisma generate
    npx prisma migrate dev --name init
    ```

* **EPERM / fichiers verrouillés (.next)**

  ```bash
  taskkill /f /im node.exe
  Remove-Item -Recurse -Force .next
  npx prisma generate
  npm run dev
  ```

* **Service PostgreSQL arrêté**

  * Ouvre **services.msc** → cherche **postgresql-x64-16** (ou version installée) → **Start/Restart**.

* **Pare-feu**

  * En local, pas de règle spéciale si tu restes sur `localhost`. Si besoin, autorise `postgres.exe` pour le port 5432.



## 10) Checklist finale

* [ ] PostgreSQL + pgAdmin installés
* [ ] Serveur **Localhost** ajouté dans pgAdmin
* [ ] **Login Role** `app_user` créé (Login: Yes, mot de passe défini)
* [ ] **Database** `articles_db` (Owner: `app_user`)
* [ ] `.env` → `postgresql://app_user:app_password@localhost:5432/articles_db?schema=public`
* [ ] `npx prisma generate` OK
* [ ] `npx prisma migrate dev --name init` OK (table `articles` créée)
* [ ] `npm run dev` OK
* [ ] CRUD testé (GET/POST/PUT/DELETE)

