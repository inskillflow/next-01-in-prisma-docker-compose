# 1) Ouvrir un shell psql

## A. Depuis Docker Compose (recommandé)

```bash
# Se connecter en tant que app_user sur la DB articles_db
docker compose exec -it db psql -U app_user -d articles_db
```

```bash
# En superutilisateur (postgres) si besoin d’admin
docker compose exec -it db psql -U postgres
```

## B. Avec psql installé sur l’hôte (Ubuntu)

```bash
psql "postgresql://app_user:app_password@localhost:5432/articles_db"
```

> Pour quitter psql :

```
\q
```

---

# 2) Commandes psql utiles (métacommandes)

```psql
\l               -- lister les bases
\c articles_db   -- se connecter à une base
\dt              -- lister les tables du schéma courant
\d articles      -- décrire la table "articles"
\du              -- lister les rôles
\dn              -- lister les schémas
\conninfo        -- infos de connexion
\timing on       -- mesurer le temps des requêtes
\q               -- quitter
```

---

# 3) SQL de base (CRUD sur la table "articles")

```sql
-- Vérifier la version
SELECT version();

-- Lister les tables du schéma public
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;

-- Lire
SELECT * FROM articles ORDER BY "createdAt" DESC LIMIT 10;

-- Insérer
INSERT INTO articles (id, title, content, "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text, 'Titre 1', 'Contenu 1', now(), now());
-- (si gen_random_uuid() indisponible, utilise cuid côté app ou une valeur fixe)

-- Mettre à jour
UPDATE articles
SET title = 'Nouveau titre', "updatedAt" = now()
WHERE id = 'ID_A_REMPLACER';

-- Supprimer
DELETE FROM articles WHERE id = 'ID_A_REMPLACER';

-- Compter
SELECT COUNT(*) FROM articles;
```

> Astuce: si `gen_random_uuid()` n’existe pas, active l’extension (superuser):

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

---

# 4) Administration rapide (superuser)

```sql
-- Créer un rôle login
CREATE ROLE app_user WITH LOGIN PASSWORD 'app_password';

-- Créer une base et la donner à app_user
CREATE DATABASE articles_db OWNER app_user;

-- Droits sur le schéma public
GRANT ALL ON SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO app_user;
```

---

# 5) Index & perf (exemples)

```sql
-- Index sur createdAt
CREATE INDEX IF NOT EXISTS idx_articles_createdat ON articles("createdAt");

-- Index texte simple sur title
CREATE INDEX IF NOT EXISTS idx_articles_title ON articles(title);
```

---

# 6) Import / Export CSV (rapide)

```psql
-- Exporter vers CSV (coté serveur)
\copy (SELECT * FROM articles ORDER BY "createdAt" DESC)
TO 'articles_export.csv' CSV HEADER

-- Importer un CSV dans une table vide/compatible
\copy articles(id,title,content,"createdAt","updatedAt")
FROM 'articles_import.csv' CSV HEADER
```

---

# 7) Problèmes fréquents & solutions

* **ECONNREFUSED:5432**
  `docker compose ps` → vérifier que `db` est UP/healthy.
  `docker compose logs -f db` pour les logs.

* **AUTH failed (mot de passe / user)**
  Vérifier `.env` (user/mdp/host/port/db).
  Si besoin, recréer la stack (⚠️ détruit les données) :

  ```bash
  docker compose down -v && docker compose up -d
  ```

* **Table absente (`relation "articles" does not exist`)**

  ```bash
  npx prisma generate
  npx prisma migrate dev --name init
  ```

