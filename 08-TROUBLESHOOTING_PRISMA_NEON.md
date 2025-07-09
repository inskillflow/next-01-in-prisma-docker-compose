# Troubleshooting Prisma + Neon - Résolution des problèmes

## Problèmes rencontrés et solutions

### PROBLÈME 1 : Fichier .env manquant

**Symptôme :**
```
error: Environment variable not found: DATABASE_URL.
```

**Cause :**
Le fichier `.env` n'existait pas à la racine du projet.

**Solution :**
```bash
# Vérifier si le fichier existe
ls -la | findstr .env

# Si absent, créer le fichier .env
echo 'DATABASE_URL="COPIEZ_VOTRE_URL_NEON_ICI"' > .env
```

**Action requise :**
1. Aller sur votre dashboard Neon
2. Cliquer sur "Connect" 
3. Copier l'URL complète PostgreSQL
4. Ouvrir le fichier `.env` dans VSCode
5. Remplacer `COPIEZ_VOTRE_URL_NEON_ICI` par votre vraie URL
6. Sauvegarder (Ctrl+S)

---

### PROBLÈME 2 : Erreur EPERM sur Windows

**Symptôme :**
```
Error: EPERM: operation not permitted, rename 'query_engine-windows.dll.node.tmp...' 
```

**Cause :**
- Processus Node.js qui bloquent les fichiers
- Antivirus qui interfère
- Permissions de fichier Windows

**Solution :**
```bash
# Fermer tous les processus Node.js
taskkill /f /im node.exe

# Puis relancer la génération
npx prisma generate
```

---

### PROBLÈME 3 : Migration qui ne fonctionne pas

**Symptôme :**
```
Environment variables loaded from .env
Error: Environment variable not found: DATABASE_URL.
```

**Cause :**
Cache Prisma ou variable d'environnement non reconnue.

**Solution étape par étape :**
```bash
# 1. Vérifier que le fichier .env existe et contient la bonne URL
type .env

# 2. Fermer tous les processus Node.js
taskkill /f /im node.exe

# 3. Générer le client Prisma
npx prisma generate

# 4. Appliquer la migration
npx prisma migrate dev --name init
```

---

### PROBLÈME 4 : Next.js ne trouve pas DATABASE_URL au runtime

**Symptôme :**
```
Error creating article: Error [PrismaClientInitializationError]: 
Invalid `prisma.article.create()` invocation:
error: Environment variable not found: DATABASE_URL.
```

**Cause :**
Next.js ne charge pas le fichier `.env` correctement au runtime.

**Solution :**
```bash
# 1. Arrêter le serveur (Ctrl+C)

# 2. Vérifier le contenu du fichier .env
type .env

# 3. Redémarrer Next.js
npm run dev
```

**Si le problème persiste, solution alternative :**
```bash
# Définir la variable d'environnement directement
$env:DATABASE_URL="postgresql://votre-url-complete-neon"
npm run dev
```

---

## SOLUTION COMPLÈTE - Commandes dans l'ordre

Voici toutes les commandes à exécuter dans l'ordre pour résoudre tous les problèmes :

### ÉTAPE 1 : Vérification et création du fichier .env
```bash
# Vérifier si le fichier .env existe
type .env

# Si erreur "cannot find", créer le fichier
echo 'DATABASE_URL="VOTRE_URL_NEON_ICI"' > .env
```

**ACTION MANUELLE REQUISE :**
- Ouvrir le fichier `.env` dans VSCode
- Remplacer `VOTRE_URL_NEON_ICI` par votre vraie URL Neon
- Sauvegarder le fichier

### ÉTAPE 2 : Nettoyage des processus
```bash
# Fermer tous les processus Node.js
taskkill /f /im node.exe
```

### ÉTAPE 3 : Génération du client Prisma
```bash
# Générer le client Prisma
npx prisma generate
```

### ÉTAPE 4 : Migration de la base de données
```bash
# Créer la table articles
npx prisma migrate dev --name init
```

### ÉTAPE 5 : Démarrage du serveur
```bash
# Démarrer le serveur Next.js
npm run dev
```

### ÉTAPE 6 : Test de l'API
```bash
# Tester que l'API fonctionne (dans un autre terminal)
curl http://localhost:3000/api/articles
```

---

## Vérifications finales

### Checklist de vérification :
- [ ] Fichier `.env` existe à la racine du projet
- [ ] Fichier `.env` contient l'URL Neon correcte avec guillemets
- [ ] Commande `npx prisma generate` s'exécute sans erreur
- [ ] Commande `npx prisma migrate dev` s'exécute sans erreur
- [ ] Serveur Next.js démarre sur http://localhost:3000
- [ ] Table "articles" visible dans le dashboard Neon
- [ ] API répond avec `[]` sur GET /api/articles
- [ ] Création d'article fonctionne avec POST /api/articles

### Commandes de diagnostic :
```bash
# Vérifier le fichier .env
type .env

# Vérifier la connexion à la base
npx prisma db pull

# Voir les tables créées
npx prisma studio

# Tester l'API
curl -X GET http://localhost:3000/api/articles
curl -X POST http://localhost:3000/api/articles -H "Content-Type: application/json" -d "{\"title\":\"Test\",\"content\":\"Test content\"}"
```

---

## Résolution des erreurs courantes

### Erreur : "Port already in use"
```bash
# Trouver le processus qui utilise le port
netstat -ano | findstr :3000

# Tuer le processus (remplacer PID par le numéro trouvé)
taskkill /f /pid PID
```

### Erreur : "Cannot find module '@prisma/client'"
```bash
# Réinstaller les dépendances
npm install
npx prisma generate
```

### Erreur : "Table 'articles' doesn't exist"
```bash
# Forcer la synchronisation
npx prisma db push
```

### Erreur persistante de DATABASE_URL
```bash
# Solution de dernier recours - redémarrer complètement
taskkill /f /im node.exe
taskkill /f /im next.exe
rm -rf .next
rm -rf node_modules/.prisma
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

---

## Résumé de la résolution

**Problème principal :** Configuration incomplète de l'environnement Prisma + Neon

**Cause racine :** 
1. Fichier `.env` manquant ou mal configuré
2. Processus Node.js bloquant les fichiers Prisma
3. Cache Prisma corrompu

**Solution finale :**
1. Création correcte du fichier `.env` avec l'URL Neon
2. Nettoyage des processus Node.js
3. Régénération complète du client Prisma
4. Migration propre vers la base de données

**Résultat :** API Next.js fonctionnelle avec persistance PostgreSQL via Neon 