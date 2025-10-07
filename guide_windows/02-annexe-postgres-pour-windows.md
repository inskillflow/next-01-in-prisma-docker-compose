# ANNEXE TECHNIQUE – PostgreSQL LOCAL (Windows + pgAdmin 4)

---

## 1. INSTALLATION COMPLÈTE DE POSTGRESQL ET PGADMIN

### 1.1 Téléchargement

1. Ouvrez le site officiel : [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Téléchargez l’installateur EnterpriseDB correspondant à votre architecture (généralement 64 bits).
3. Exécutez le fichier téléchargé.

### 1.2 Étapes d’installation

1. Acceptez les termes de licence.
2. Choisissez le dossier d’installation par défaut :

   ```
   C:\Program Files\PostgreSQL\16
   ```
3. Cochez les composants suivants :

   * PostgreSQL Server
   * pgAdmin 4
   * Command Line Tools
4. Définissez un **mot de passe pour le superutilisateur `postgres`**. Notez-le soigneusement.
5. Conservez le port **5432** (port par défaut).
6. Laissez le mode par défaut pour les locales.
7. Finalisez l’installation.

### 1.3 Vérification de l’installation

* Ouvrez l’application **pgAdmin 4** depuis le menu Démarrer.
* Lors de la première ouverture :

  * Définissez un **Master Password** pour sécuriser votre accès local.
  * Connectez-vous au serveur `PostgreSQL 16` (ou version installée) en utilisant :

    * Nom d’utilisateur : `postgres`
    * Mot de passe : celui défini lors de l’installation comme postgres .

### 1.4 Vérification du service PostgreSQL

* Ouvrez la boîte de dialogue **Services Windows** (touche Windows + R → tapez `services.msc`).
* Recherchez le service **PostgreSQL 16**.
* Assurez-vous qu’il est en cours d’exécution.
  Si nécessaire, faites un clic droit puis **Start**.

---

## 2. CONFIGURATION INITIALE AVEC PGADMIN

### 2.1 Création d’un utilisateur applicatif

Cet utilisateur sera utilisé par votre application (Next.js / Prisma) pour accéder à la base.

#### Étapes via l’interface pgAdmin :

1. Dans l’arborescence de gauche :
   `Servers → PostgreSQL 16 → Login/Group Roles`
2. Clic droit → **Create → Login/Group Role**
3. Onglet **General**

   * Name : `app_user`
4. Onglet **Definition**

   * Password : `app_password`
5. Onglet **Privileges**

   * Cocher uniquement : `Can login?`
6. Enregistrer.

#### Équivalent SQL :

```sql
CREATE ROLE app_user WITH LOGIN PASSWORD 'app_password';
```

---

### 2.2 Création de la base de données du projet

#### Étapes via pgAdmin :

1. Dans l’arborescence : `Servers → Databases`
2. Clic droit → **Create → Database**
3. Onglet **General**

   * Database : `articles_db`
   * Owner : `app_user`
4. Enregistrer.

#### Équivalent SQL :

```sql
CREATE DATABASE articles_db OWNER app_user;
```

---

### 2.3 Attribution des privilèges nécessaires

Connectez-vous à la base `articles_db` dans **Query Tool** et exécutez :

```sql
GRANT ALL PRIVILEGES ON DATABASE articles_db TO app_user;
GRANT ALL ON SCHEMA public TO app_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO app_user;
```

Ces commandes garantissent que `app_user` pourra lire, écrire et créer des tables sans privilèges supplémentaires.

---

## 3. UTILISATION DE LA LIGNE DE COMMANDE PSQL

### 3.1 Lancer psql sur Windows

Ouvrez un terminal PowerShell ou CMD, puis :

```bash
cd "C:\Program Files\PostgreSQL\16\bin"
psql -U postgres
```

Vous serez invité à entrer le mot de passe du compte `postgres`.

### 3.2 Commandes essentielles

| Action                            | Commande         |
| --------------------------------- | ---------------- |
| Lister les bases                  | `\l`             |
| Se connecter à une base           | `\c articles_db` |
| Lister les tables                 | `\dt`            |
| Afficher la structure d’une table | `\d nom_table`   |
| Lister les utilisateurs           | `\du`            |
| Quitter psql                      | `\q`             |

### 3.3 Exemple pratique

```sql
\c articles_db
CREATE TABLE test (
  id serial PRIMARY KEY,
  name text
);
INSERT INTO test (name) VALUES ('Exemple 1');
SELECT * FROM test;
```

---

## 4. GESTION DES UTILISATEURS ET DROITS

### 4.1 Création d’un superutilisateur (optionnel)

```sql
CREATE ROLE dev_admin WITH LOGIN SUPERUSER PASSWORD 'admin123';
```

### 4.2 Suppression d’un utilisateur

```sql
DROP ROLE IF EXISTS app_user;
```

### 4.3 Modification du mot de passe

```sql
ALTER USER app_user WITH PASSWORD 'nouveau_mot_de_passe';
```

### 4.4 Vérification des utilisateurs et rôles

```sql
\du+
```

---

## 5. GESTION DES BASES DE DONNÉES

### 5.1 Commandes de base

```sql
CREATE DATABASE testdb OWNER app_user;
ALTER DATABASE testdb RENAME TO testdb_renamed;
DROP DATABASE testdb_renamed;
```

### 5.2 Lister les bases et tailles

```sql
\l+
```

---

## 6. GESTION DES TABLES ET DONNÉES

### 6.1 Création de table

```sql
CREATE TABLE articles (
  id serial PRIMARY KEY,
  title varchar(255),
  content text,
  created_at timestamp default now()
);
```

### 6.2 Manipulation des données

```sql
INSERT INTO articles (title, content) VALUES ('Article 1', 'Contenu de test');
SELECT * FROM articles;
UPDATE articles SET title = 'Titre mis à jour' WHERE id = 1;
DELETE FROM articles WHERE id = 1;
```

### 6.3 Informations sur les tables

```sql
\d articles
\dt
```

---

## 7. MAINTENANCE ET DIAGNOSTIC

### 7.1 Vérifier les connexions actives

```sql
SELECT pid, usename, datname, client_addr, state
FROM pg_stat_activity;
```

### 7.2 Terminer une session bloquée

```sql
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'articles_db' AND state = 'idle';
```

### 7.3 Réinitialiser une séquence

```sql
ALTER SEQUENCE articles_id_seq RESTART WITH 1;
```

### 7.4 Mesurer la taille des tables

```sql
SELECT relname AS table_name,
       pg_size_pretty(pg_total_relation_size(relid)) AS total_size
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

---

## 8. SAUVEGARDE ET RESTAURATION (pgAdmin et CLI)

### 8.1 Sauvegarde via pgAdmin

1. Clic droit sur `articles_db → Backup`
2. Format : `Plain`
3. Chemin de sortie : `C:\backup\articles_db.sql`
4. Option : cocher “Include CREATE DATABASE”
5. Lancer le backup.

### 8.2 Restauration via pgAdmin

1. Créer une base vide si nécessaire.
2. Clic droit sur la base → **Restore**
3. Sélectionner le fichier `.sql` précédemment sauvegardé.
4. Exécuter.

### 8.3 Sauvegarde et restauration via la ligne de commande

```bash
pg_dump -U app_user -d articles_db -f C:\backup\articles_db.sql
psql -U app_user -d articles_db -f C:\backup\articles_db.sql
```

---

## 9. TESTS AVEC PRISMA

### 9.1 Vérifier la connexion

Dans le terminal VSCode :

```bash
npx prisma db pull
```

Cette commande doit lire correctement la structure de la base locale.

### 9.2 Démarrer Prisma Studio

```bash
npx prisma studio
```

L’interface Prisma s’ouvre sur [http://localhost:5555](http://localhost:5555)
Vous pouvez y consulter et éditer les tables de `articles_db`.

---

## 10. ERREURS FRÉQUENTES ET SOLUTIONS

| Erreur                                               | Cause probable                                 | Solution                                                                 |                                              |
| ---------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------- |
| `password authentication failed for user "app_user"` | Mauvais mot de passe ou utilisateur inexistant | Vérifiez le mot de passe dans pgAdmin (onglet Definition) ou dans `.env` |                                              |
| `could not connect to server: Connection refused`    | Service PostgreSQL arrêté                      | Redémarrez le service PostgreSQL via `services.msc`                      |                                              |
| `port 5432 already in use`                           | Un autre processus utilise le port             | Exécutez `netstat -ano                                                   | findstr 5432`, puis `taskkill /PID <pid> /F` |
| `relation "articles" does not exist`                 | Table non créée ou migration manquante         | Lancez `npx prisma migrate dev --name init`                              |                                              |
| `DATABASE_URL not found`                             | Mauvaise configuration de `.env`               | Assurez-vous que `.env` est à la racine et redémarrez le serveur         |                                              |
| Erreur EPERM sur Windows                             | Fichiers verrouillés par Node.js               | Fermez VSCode et exécutez `taskkill /f /im node.exe` avant de redémarrer |                                              |

---

## 11. COMMANDES DE DIAGNOSTIC AVANCÉ

```sql
-- Version PostgreSQL
SELECT version();

-- Extensions disponibles
SELECT * FROM pg_available_extensions;

-- Extensions installées
\dx

-- Requêtes actives
SELECT pid, query_start, query FROM pg_stat_activity WHERE state = 'active';

-- Transactions longues
SELECT pid, age(clock_timestamp(), query_start), query
FROM pg_stat_activity
WHERE state != 'idle' ORDER BY query_start;

-- Statistiques des index
SELECT relname, idx_scan, idx_tup_read, idx_tup_fetch FROM pg_stat_user_indexes;
```

---

## 12. BONNES PRATIQUES POUR ENVIRONNEMENT LOCAL

1. Ne jamais utiliser le compte `postgres` dans votre application.
2. Créer un utilisateur dédié avec des privilèges limités.
3. Toujours effectuer une sauvegarde avant une migration importante.
4. Documenter toutes les modifications de schéma.
5. Utiliser Prisma Studio pour les vérifications ponctuelles, mais privilégier les requêtes SQL pour le diagnostic.
6. Redémarrer le service PostgreSQL après toute mise à jour du système.
7. Conserver une copie du fichier `.env` dans un emplacement sécurisé.

---

## 13. SYNTHÈSE DES COMMANDES ESSENTIELLES

| Action               | Commande                                                    |
| -------------------- | ----------------------------------------------------------- |
| Créer utilisateur    | `CREATE ROLE app_user LOGIN PASSWORD 'app_password';`       |
| Créer base           | `CREATE DATABASE articles_db OWNER app_user;`               |
| Donner droits        | `GRANT ALL PRIVILEGES ON DATABASE articles_db TO app_user;` |
| Lister bases         | `\l`                                                        |
| Changer de base      | `\c articles_db`                                            |
| Lister tables        | `\dt`                                                       |
| Structure table      | `\d articles`                                               |
| Lister utilisateurs  | `\du`                                                       |
| Supprimer table      | `DROP TABLE articles;`                                      |
| Exporter base        | `pg_dump -U app_user -d articles_db -f backup.sql`          |
| Restaurer base       | `psql -U app_user -d articles_db -f backup.sql`             |
| Ouvrir Prisma Studio | `npx prisma studio`                                         |


