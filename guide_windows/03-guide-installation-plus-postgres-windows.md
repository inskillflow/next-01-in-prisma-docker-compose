# ANNEXE COMPLÈTE – POSTGRESQL SUR WINDOWS

**(Modules Serveur, Client et Interface pgAdmin 4)**

## Remarque 
­- PostgreSQL évolue régulièrement, mais son mode d’installation, sa structure interne et son architecture logicielle restent remarquablement stables d’une version majeure à l’autre. Ce guide est rédigé à partir de la **version 16 de PostgreSQL**, actuellement largement utilisée dans les environnements professionnels et éducatifs. Cependant, les procédures décrites ici — qu’il s’agisse de l’installation, de la configuration des modules serveur et client, du démarrage via pgAdmin ou de l’utilisation en ligne de commande — demeurent valables pour les versions **15, 17, 18** et ultérieures. Les différences entre versions concernent généralement des optimisations internes (performances, sécurité, prise en charge du chiffrement, améliorations du planificateur de requêtes, etc.) et non la logique d’exploitation ou la gestion des services Windows. En pratique, que vous installiez PostgreSQL 15, 16, 17 ou 18, vous suivrez **exactement les mêmes étapes**, les noms de services, répertoires (`C:\Program Files\PostgreSQL\<version>`), et outils (`psql`, `pg_ctl`, `pgAdmin 4`) demeurant identiques dans leur fonctionnement.


## 1. INTRODUCTION : ARCHITECTURE LOGIQUE

Avant toute manipulation, il est essentiel de comprendre la structure en trois modules du système PostgreSQL :

| Module                 | Description                                                                                                                   | Composants principaux                                          | Démarrage                       |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------- |
| **Serveur PostgreSQL** | Moteur SGBD central exécuté comme un service Windows. Il héberge les bases, traite les requêtes SQL et gère les transactions. | `postgres.exe`, `pg_ctl.exe`, `postgresql.conf`, `pg_hba.conf` | Automatique (service) ou manuel |
| **Client PostgreSQL**  | Ensemble d’outils CLI permettant la gestion et l’exécution des commandes SQL.                                                 | `psql.exe`, `pg_dump.exe`, `pg_restore.exe`                    | Manuel                          |
| **pgAdmin 4**          | Interface graphique web de gestion et supervision. Permet de créer, visualiser et modifier les objets SQL.                    | Application web locale (Python/Flask)                          | Automatique à l’ouverture       |

---

## 2. INSTALLATION COMPLÈTE SUR WINDOWS

### 2.1 Téléchargement

1. Ouvrir : [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Cliquer sur **Download the installer** (EnterpriseDB).
3. Choisir la version (ex. PostgreSQL 16) et télécharger le fichier `.exe`.

### 2.2 Lancement de l’installation

1. Exécuter le fichier `.exe` en mode administrateur.
2. Suivre les étapes suivantes :

#### Étape 1 – Choix des composants

Cochez tous les modules nécessaires :

* **PostgreSQL Server**
* **pgAdmin 4**
* **Command Line Tools** (psql, pg_dump, etc.)
* **Stack Builder** (facultatif, pour PostGIS et extensions)

#### Étape 2 – Répertoire d’installation

```
C:\Program Files\PostgreSQL\16
```

#### Étape 3 – Répertoire des données

```
C:\Program Files\PostgreSQL\16\data
```

#### Étape 4 – Mot de passe administrateur

Définir un mot de passe pour le superutilisateur **postgres**
(ex. `admin123`).

#### Étape 5 – Port réseau

Laisser la valeur par défaut : **5432**.

#### Étape 6 – Langue et locale

Choisir : `French_Canada` (ou locale système par défaut).

#### Étape 7 – Démarrage automatique

L’installeur configure PostgreSQL comme **service Windows** :

```
postgresql-x64-16
```

---

## 3. MODULE SERVEUR – DÉMARRAGE ET VÉRIFICATION

### 3.1 Démarrage automatique (Service Windows)

PostgreSQL démarre automatiquement après l’installation.

#### Vérification via Services Windows :

1. Ouvrir la fenêtre `services.msc`.
2. Rechercher :

   ```
   PostgreSQL-x64-16
   ```
3. Vérifier :

   * **Statut** : Running (En cours d’exécution)
   * **Type de démarrage** : Automatique
4. Pour redémarrer :

   * Clic droit → Restart
   * Ou PowerShell :

     ```powershell
     net stop postgresql-x64-16
     net start postgresql-x64-16
     ```

#### Exemple de sortie PowerShell :

```
The PostgreSQL-x64-16 service is stopping.
The PostgreSQL-x64-16 service was stopped successfully.
The PostgreSQL-x64-16 service is starting.
The PostgreSQL-x64-16 service was started successfully.
```

---

### 3.2 Démarrage manuel (ligne de commande)

1. Ouvrir **PowerShell** ou **Invite de commandes (cmd)** en mode administrateur.

2. Accéder au répertoire des binaires :

   ```bash
   cd "C:\Program Files\PostgreSQL\16\bin"
   ```

3. Démarrer le serveur manuellement :

   ```bash
   pg_ctl -D "C:\Program Files\PostgreSQL\16\data" start
   ```

   Le terminal affiche :

   ```
   waiting for server to start.... done
   server started
   ```

4. Vérifier le processus :

   ```bash
   tasklist | findstr postgres
   ```

   Exemple de sortie :

   ```
   postgres.exe                 15680 Services                   0     42,440 K
   postgres.exe                 15260 Services                   0     39,124 K
   ```

5. Pour l’arrêter :

   ```bash
   pg_ctl -D "C:\Program Files\PostgreSQL\16\data" stop
   ```

6. Vérifier l’état :

   ```bash
   pg_ctl -D "C:\Program Files\PostgreSQL\16\data" status
   ```

---

### 3.3 Fichiers de configuration clés

| Fichier             | Rôle                                          | Emplacement                           |
| ------------------- | --------------------------------------------- | ------------------------------------- |
| **postgresql.conf** | Paramètres du serveur (port, mémoire, logs)   | `C:\Program Files\PostgreSQL\16\data` |
| **pg_hba.conf**     | Règles d’accès et d’authentification          | `C:\Program Files\PostgreSQL\16\data` |
| **pg_ident.conf**   | Mappage des utilisateurs système → PostgreSQL | `C:\Program Files\PostgreSQL\16\data` |

---

## 4. MODULE CLIENT – UTILISATION EN LIGNE DE COMMANDE

### 4.1 Lancement du client `psql`

Ouvrir une invite de commandes :

```bash
cd "C:\Program Files\PostgreSQL\16\bin"
psql -U postgres
```

Vous serez invité à entrer le mot de passe défini à l’installation.

### 4.2 Connexion à une base spécifique

```bash
psql -U postgres -d postgres
```

ou

```bash
psql -h localhost -p 5432 -U postgres -d postgres
```

### 4.3 Commandes de base `psql`

```sql
\?              -- aide complète
\l              -- lister les bases
\c articles_db  -- se connecter à une base
\dt             -- afficher les tables
\d articles     -- décrire la table
\du             -- afficher les utilisateurs
\q              -- quitter
```

### 4.4 Exemple complet de session

```
C:\Program Files\PostgreSQL\16\bin>psql -U postgres
Password for user postgres:
psql (16.0)
Type "help" for help.

postgres=# CREATE DATABASE articles_db;
CREATE DATABASE
postgres=# \c articles_db
You are now connected to database "articles_db".
articles_db=# CREATE TABLE articles (id serial PRIMARY KEY, title text, content text);
CREATE TABLE
articles_db=# INSERT INTO articles (title, content) VALUES ('Premier article', 'Texte de test');
INSERT 0 1
articles_db=# SELECT * FROM articles;
 id |     title       |    content
----+-----------------+----------------
  1 | Premier article | Texte de test
(1 row)
```

---

## 5. MODULE PGADMIN 4 – DÉMARRAGE ET UTILISATION

### 5.1 Lancement de pgAdmin

* Ouvrir **pgAdmin 4** depuis le menu Démarrer.
* Lors du premier lancement, définir un **Master Password**.
* pgAdmin démarre un **serveur web local** (port aléatoire, ex. 5050).
* Il s’ouvre automatiquement dans le navigateur par défaut :

  ```
  http://127.0.0.1:5050/browser/
  ```

### 5.2 Connexion au serveur PostgreSQL local

1. Clic droit sur **Servers → Register → Server**
2. Onglet **General** :

   * Name : `PostgreSQL Local`
3. Onglet **Connection** :

   * Host : `localhost`
   * Port : `5432`
   * Maintenance database : `postgres`
   * Username : `postgres`
   * Password : mot de passe défini à l’installation
   * Cochez **Save Password**
4. Cliquez sur **Save**

---

### 5.3 Création de base via pgAdmin

1. Ouvrir le panneau gauche → clic droit sur **Databases → Create → Database**
2. Onglet **General**

   * Database : `articles_db`
   * Owner : `postgres`
3. Valider

---

### 5.4 Création d’un utilisateur applicatif

1. Clic droit sur **Login/Group Roles → Create → Login/Group Role**
2. **General**

   * Name : `app_user`
3. **Definition**

   * Password : `app_password`
4. **Privileges**

   * Can login : Yes
5. **Save**

#### Commande SQL équivalente :

```sql
CREATE ROLE app_user WITH LOGIN PASSWORD 'app_password';
```

---

### 5.5 Création d’une table dans pgAdmin

1. Sélectionner la base `articles_db`
2. Aller dans **Schemas → public → Tables**
3. Clic droit → **Create → Table**
4. Remplir :

   * Name : `articles`
5. Onglet **Columns** :

   * `id` → Type : `serial`, Primary Key
   * `title` → Type : `varchar(255)`
   * `content` → Type : `text`
6. **Save**

#### SQL équivalent :

```sql
CREATE TABLE articles (
  id serial PRIMARY KEY,
  title varchar(255),
  content text
);
```

---

### 5.6 Insérer et visualiser les données

1. Sélectionner la table → clic droit → **View/Edit Data → All Rows**
2. Cliquer sur le bouton **+** pour insérer une ligne.
3. Enregistrer.
4. Les données apparaissent immédiatement.

---

## 6. DÉMARRER ET ARRÊTER LE SERVEUR : RÉSUMÉ COMPARATIF

| Méthode             | Commande ou action                                           | Niveau            | Description                          |
| ------------------- | ------------------------------------------------------------ | ----------------- | ------------------------------------ |
| **Service Windows** | `services.msc` → PostgreSQL → Start/Stop                     | Graphique         | Démarre/arrête le service PostgreSQL |
| **PowerShell**      | `net start postgresql-x64-16` / `net stop postgresql-x64-16` | Ligne de commande | Même effet que Services.msc          |
| **pg_ctl**          | `pg_ctl -D "C:\Program Files\PostgreSQL\16\data" start`      | Ligne de commande | Démarrage manuel sans service        |
| **pgAdmin**         | Automatique lors du lancement                                | Graphique         | Démarre pgAdmin (pas le serveur)     |
| **Task Manager**    | `postgres.exe` visible                                       | Vérification      | Processus serveur actif              |

---

## 7. PROCESSUS WINDOWS ASSOCIÉS À POSTGRESQL

| Processus        | Description                                                 |
| ---------------- | ----------------------------------------------------------- |
| `postgres.exe`   | Processus principal du serveur (un parent + plusieurs fils) |
| `pg_ctl.exe`     | Utilitaire de démarrage/arrêt                               |
| `pg_dump.exe`    | Sauvegarde des bases                                        |
| `pg_restore.exe` | Restauration                                                |
| `psql.exe`       | Client SQL interactif                                       |
| `pgAdmin4.exe`   | Interface graphique (serveur web local + navigateur)        |

Chaque connexion client ouvre un **sous-processus postgres.exe distinct** (multi-processus).

---

## 8. VÉRIFICATIONS TECHNIQUES ET DIAGNOSTICS

### 8.1 Vérifier la version

```bash
psql --version
```

ou depuis pgAdmin :

```sql
SELECT version();
```

### 8.2 Vérifier les bases

```sql
\l
```

### 8.3 Vérifier les connexions actives

```sql
SELECT pid, usename, datname, client_addr, state FROM pg_stat_activity;
```

### 8.4 Fermer une session bloquante

```sql
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'articles_db' AND state = 'idle';
```

---

## 9. SAUVEGARDE ET RESTAURATION

### 9.1 Via pgAdmin

* **Backup** :

  * Format : `Plain`
  * Fichier : `C:\backup\articles_db.sql`
* **Restore** :

  * Sélectionner fichier `.sql` → Exécuter.

### 9.2 En ligne de commande

```bash
pg_dump -U postgres -d articles_db -f C:\backup\articles_db.sql
psql -U postgres -d articles_db -f C:\backup\articles_db.sql
```

---

## 10. DÉPANNAGE ET ERREURS COURANTES

| Symptôme                                | Cause probable              | Solution                                                  |
| --------------------------------------- | --------------------------- | --------------------------------------------------------- |
| Service ne démarre pas                  | Port 5432 occupé            | Modifier `postgresql.conf` (port=5433) ou libérer le port |
| Erreur `connection refused`             | Serveur non démarré         | Démarrer via `services.msc`                               |
| Erreur `password authentication failed` | Mauvais mot de passe        | Réinitialiser via pgAdmin                                 |
| Erreur `database does not exist`        | Base non créée              | Créer via pgAdmin ou `CREATE DATABASE`                    |
| Erreur `permission denied`              | Utilisateur sans privilèges | Exécuter `GRANT ALL PRIVILEGES ON DATABASE`               |

---

## 11. BONNES PRATIQUES D’ADMINISTRATION

1. Ne jamais exécuter les applications avec l’utilisateur `postgres` en production.
2. Créer un utilisateur applicatif dédié.
3. Faire des sauvegardes régulières avec `pg_dump`.
4. Documenter les migrations de schémas.
5. Utiliser pgAdmin uniquement pour la gestion, pas pour les scripts massifs.
6. Vérifier régulièrement les logs :

   ```
   C:\Program Files\PostgreSQL\16\data\log\
   ```
7. Tester les performances via `EXPLAIN ANALYZE` dans pgAdmin.

---

## 12. SYNTHÈSE DES COMMANDES DE GESTION

| Action                  | Commande                                                |
| ----------------------- | ------------------------------------------------------- |
| Démarrer service        | `net start postgresql-x64-16`                           |
| Arrêter service         | `net stop postgresql-x64-16`                            |
| Démarrer manuel         | `pg_ctl -D "C:\Program Files\PostgreSQL\16\data" start` |
| Arrêter manuel          | `pg_ctl -D "C:\Program Files\PostgreSQL\16\data" stop`  |
| Connexion SQL           | `psql -U postgres`                                      |
| Liste des bases         | `\l`                                                    |
| Liste des tables        | `\dt`                                                   |
| Changer de base         | `\c nom_base`                                           |
| Sauvegarde              | `pg_dump -U postgres -d nom_base -f fichier.sql`        |
| Restauration            | `psql -U postgres -d nom_base -f fichier.sql`           |
| Vérifier état serveur   | `pg_ctl status`                                         |
| Voir connexions actives | `SELECT * FROM pg_stat_activity;`                       |

