# GUIDE COMPLET – API Next.js avec Prisma et PostgreSQL via Docker Compose (Ubuntu)

## Introduction

Objectif : transformer votre API Next.js (stockage en mémoire) en **API CRUD** avec **PostgreSQL** persistant, exécuté via **Docker Compose** sur **Ubuntu**.



## PARTIE 1 : PRÉREQUIS ET VÉRIFICATIONS

### 1.1 Outils nécessaires (Ubuntu)

* **Node.js 18+** et **npm**
* **Docker Engine** + **Docker Compose**
* **VSCode** (optionnel) + extension **REST Client** (optionnel)
* **Terminal Bash**
* **Connexion Internet**

#### Installer Node.js (si besoin)

```bash
sudo apt update
sudo apt install -y curl ca-certificates gnupg
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v
```

#### Installer Docker & Compose (si besoin)

```bash
# Docker Engine
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
| sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
| sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Docker Compose plugin
sudo apt-get install -y docker-compose-plugin

# (Optionnel) exécuter docker sans sudo
sudo usermod -aG docker $USER
# déconnectez-vous/reconnectez-vous au shell pour prendre effet
```

### 1.2 Vérification du projet Next.js

Votre projet doit contenir :

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

### 1.3 Test initial

```bash
npm install
npm run dev
```

Vérifiez [http://localhost:3000](http://localhost:3000).

---

## PARTIE 2 : DOCKER COMPOSE – Postgres (et pgAdmin en option)

À la racine du projet, créez **`docker-compose.yml`** :

```yaml
version: "3.9"

services:
  db:
    image: postgres:16-alpine
    container_name: pg-next-local
    environment:
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: app_password
      POSTGRES_DB: articles_db
      # Force l'encodage/locale
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./docker/init:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app_user -d articles_db"]
      interval: 5s
      timeout: 3s
      retries: 20
    restart: unless-stopped

  # (Optionnel) UI d’administration
  pgadmin:
    image: dpage/pgadmin4:8
    container_name: pgadmin
    depends_on:
      db:
        condition: service_healthy
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    restart: unless-stopped

volumes:
  pgdata:
  pgadmin_data:
```

**Notes :**

* `./docker/init` permet d’injecter des scripts SQL au **premier** démarrage (création de rôles/schéma par exemple).
* `pgAdmin` (optionnel) sera accessible sur `http://localhost:5050`.

Créez le dossier d’initialisation (facultatif mais utile) :

```bash
mkdir -p docker/init
```

*(Vous pouvez le laisser vide au début.)*

Lancez la stack :

```bash
docker compose up -d
docker compose ps
```

Vérifiez la santé :

```bash
docker compose logs -f db
```

---

## PARTIE 3 : PRISMA – Installation et initialisation

```bash
npm install prisma @prisma/client
npx prisma init
```

Cela crée `prisma/schema.prisma` et `.env`.

---

## PARTIE 4 : Configuration `.env` (Docker Compose)

Ouvrez `.env` et mettez :

```env
# Connexion Postgres via le port publié par Docker sur l’hôte
DATABASE_URL="postgresql://app_user:app_password@localhost:5432/articles_db?schema=public"
```

> **Important** : si votre service Next.js s’exécute lui aussi dans Docker, remplacez `localhost` par **le nom du service** `db` :
>
> ```env
> DATABASE_URL="postgresql://app_user:app_password@db:5432/articles_db?schema=public"
> ```
>
> (Dans ce guide, on suppose Next.js tourne **en local** hors Docker → utilisez `localhost`.)

---

## PARTIE 5 : Schéma Prisma

`prisma/schema.prisma` :

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

---

## PARTIE 6 : Client Prisma (singleton)

`src/lib/prisma.ts` :

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

## PARTIE 7 : Routes API (CRUD)

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
    const exists = await prisma.article.findUnique({ where: { id: string } })
    if (!exists) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 })
  }
}
```

### TypeScript – `src/types/article.ts`

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

## PARTIE 8 : Génération & Migrations

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer la première migration (création de la table articles)
npx prisma migrate dev --name init
```

**Attendu :**

```
Applying migration `..._init`
Your database is now in sync with your schema.
```

---

## PARTIE 9 : Fichier de tests (REST Client)

Créez **`tests.http`** à la racine :

```http
### Tests API Articles - Next.js + PostgreSQL Docker (Ubuntu)
@baseUrl = http://localhost:3000
@contentType = application/json

### 1) Liste vide au départ
GET {{baseUrl}}/api/articles
Content-Type: {{contentType}}

### 2) Création d’un article
POST {{baseUrl}}/api/articles
Content-Type: {{contentType}}

{
  "title": "Premier Article de Test",
  "content": "Contenu initial."
}

### 3) Création d’un second article
POST {{baseUrl}}/api/articles
Content-Type: {{contentType}}

{
  "title": "Deuxième Article",
  "content": "Encore du contenu."
}

### 4) Vérifier la liste (2 articles attendus)
GET {{baseUrl}}/api/articles
Content-Type: {{contentType}}

### 5) GET par ID (remplacer [ID])
GET {{baseUrl}}/api/articles/[ID]
Content-Type: {{contentType}}

### 6) PUT (remplacer [ID])
PUT {{baseUrl}}/api/articles/[ID]
Content-Type: {{contentType}}

{
  "title": "Titre mis à jour",
  "content": "Contenu mis à jour."
}

### 7) DELETE (remplacer [ID])
DELETE {{baseUrl}}/api/articles/[ID]
Content-Type: {{contentType}}

### --- Tests d’erreurs ---
### GET inexistant
GET {{baseUrl}}/api/articles/article-inexistant-12345
Content-Type: {{contentType}}

### POST invalide (titre manquant)
POST {{baseUrl}}/api/articles
Content-Type: {{contentType}}

{
  "content": "Article sans titre"
}
```

---

## PARTIE 10 : Lancer, tester et vérifier

### 10.1 Démarrer la base

```bash
docker compose up -d
docker compose ps
```

### 10.2 Démarrer Next.js

```bash
npm run dev
```

### 10.3 Tester (REST Client)

* Ouvrez `tests.http` → **Send Request** sur chaque requête.

### 10.4 Vérifier côté PostgreSQL

#### Via pgAdmin (optionnel)

* Ouvrez `http://localhost:5050` (email `admin@example.com`, mdp `admin123`).
* **Add New Server** → Host: `db`, Port: `5432`, User: `app_user`, Password: `app_password`, DB: `articles_db`.
* Consultez `articles` (schéma `public`).

#### Via psql (dans le conteneur)

```bash
docker compose exec -it db psql -U app_user -d articles_db
# puis dans psql :
\d
SELECT * FROM articles ORDER BY createdAt DESC;
\q
```

---

## PARTIE 11 : Dépannage (Ubuntu + Docker)

* **`ECONNREFUSED 127.0.0.1:5432`**

  * Vérifiez que le service `db` est **UP & healthy** : `docker compose ps`
  * Logs : `docker compose logs -f db`

* **`password authentication failed for user "app_user"`**

  * Confirmez la chaîne `.env` (user/mdp/db/port).
  * Recréation complète du volume (écrase les données !) :

    ```bash
    docker compose down -v
    docker compose up -d
    ```

* **Migrations non appliquées / table absente (`relation "articles" does not exist`)**

  ```bash
  npx prisma generate
  npx prisma migrate dev --name init
  ```

* **Port 5432 déjà pris**

  * Vérifiez `ss -lntp | grep 5432`
  * Modifiez le mapping `ports: - "5433:5432"` et mettez `localhost:5433` dans `.env`.

* **Permission volumes (rare)**

  * Assurez-vous que Docker crée le volume (nommé) et non un bind-mount non accessible.
  * Essayez : `docker compose down -v && docker compose up -d`.

* **Next.js ne relit pas `.env`**

  ```bash
  pkill node || true
  npm run dev
  ```

* **Prisma Studio**

  ```bash
  npx prisma studio
  # UI sur http://localhost:5555 par défaut
  ```

---

## PARTIE 12 : Maintenance

```bash
# Générer client Prisma (après modif du schéma)
npx prisma generate

# Migration dev
npx prisma migrate dev --name <nom_migration>

# Réinitialiser la base (efface les données !)
npx prisma migrate reset

# Statut des migrations
npx prisma migrate status

# Valider le schéma
npx prisma validate
```

---

## PARTIE 13 : Checklist finale

* [ ] Docker & Compose installés
* [ ] `docker-compose.yml` en place (service `db`, volume `pgdata`, healthcheck OK)
* [ ] `.env` → `postgresql://app_user:app_password@localhost:5432/articles_db?schema=public`
* [ ] `npx prisma generate` OK
* [ ] `npx prisma migrate dev --name init` OK
* [ ] `npm run dev` OK ([http://localhost:3000](http://localhost:3000))
* [ ] CRUD fonctionnel (GET/POST/PUT/DELETE)
* [ ] Données persistantes après `docker compose down && docker compose up -d` (si vous **ne** faites **pas** `-v`)

---

## ANNEXES

### A.1 – Exemple de script d’initialisation (optionnel)

Créez `docker/init/001_privileges.sql` :

```sql
-- Exécuté automatiquement au 1er démarrage du conteneur
-- (le DB et l'user existent déjà via les variables d'env)
ALTER DATABASE articles_db OWNER TO app_user;

GRANT ALL ON SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO app_user;
```

### A.2 – Lancer Next.js dans Docker (optionnel)

Si vous souhaitez aussi dockeriser l’app (réseau interne → `db` comme host) :

**`docker-compose.yml` (ajout du service web)** :

```yaml
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: next-web
    environment:
      NODE_ENV: development
      DATABASE_URL: "postgresql://app_user:app_password@db:5432/articles_db?schema=public"
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    depends_on:
      db:
        condition: service_healthy
```

**`Dockerfile` minimal :**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm","run","dev"]
```

Lancer l’ensemble :

```bash
docker compose up -d --build
```



## Conclusion

Vous avez maintenant :

* ✅ **PostgreSQL** persistant via **Docker Compose** (Ubuntu)
* ✅ **Prisma** configuré et migré
* ✅ **API Next.js CRUD** opérationnelle
* ✅ **Tests REST** prêts à l’emploi
* ✅ **Outils de maintenance/dépannage** pour évoluer sereinement


# Annexe :

- Pensez à une variante **Compose “prod”** (Postgres + sauvegardes automatiques, readiness probes plus strictes) ou un **Makefile** avec cibles `db-up`, `db-down`, `migrate`, `studio`, etc.
