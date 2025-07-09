# Guide d'installation Prisma + Neon - Etapes détaillées

## Introduction

Ce guide vous accompagne étape par étape pour configurer une base de données PostgreSQL avec Neon et l'ORM Prisma. Vous allez transformer votre API qui stockait les données en mémoire en une API avec persistance en base de données.

## Prérequis

- Avoir le projet Next.js fonctionnel
- Avoir accès à un terminal/invite de commande
- Avoir une connexion internet
- Avoir un navigateur web

## ETAPE 1 : Création d'un compte Neon Database

### 1.1 Aller sur le site Neon
- Ouvrez votre navigateur
- Allez sur l'adresse : https://neon.tech
- Cliquez sur "Sign Up" ou "Get Started"

### 1.2 Créer votre compte
- Créez un compte avec votre email
- Vous pouvez aussi utiliser GitHub pour vous connecter
- Validez votre email si nécessaire

### 1.3 Créer votre première base de données
- Une fois connecté, vous arrivez sur le dashboard
- Cliquez sur "Create Project" ou "New Project"
- Donnez un nom à votre projet, par exemple : "articles-api"
- Choisissez une région proche de vous (AWS US EAST 1  par exemple pour l'Amérique du Nord est)
- Cliquez sur "Create Project"

### 1.4 Récupérer l'URL de connexion
- Attendez que la base de données soit créée (quelques secondes)
- Dans le dashboard, cherchez la section "Connection string"
- Copiez l'URL complète qui ressemble à :
  ```
  postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/dbname?sslmode=require
  ```
- IMPORTANT : Gardez cette URL, vous en aurez besoin à l'étape suivante

## ETAPE 2 : Configuration du fichier d'environnement

### 2.1 Créer le fichier .env
- Ouvrez votre projet dans VSCode
- A la racine du projet (même niveau que package.json), créez un nouveau fichier
- Nommez ce fichier exactement : `.env` (avec le point au début)
- ATTENTION : Le nom du fichier doit être exactement `.env` (sans extension)
- Sur Windows, assurez-vous que les extensions sont visibles pour éviter `.env.txt`
- AIDE : Pour plus de détails, consultez le fichier `ENV_EXAMPLE.md`

### 2.2 Ajouter l'URL de la base de données
- Ouvrez le fichier `.env` que vous venez de créer
- Ajoutez cette ligne en remplaçant par votre vraie URL Neon :
  ```
  DATABASE_URL="postgresql://votre-url-neon-copiee-ici"
  ```
- Exemple complet avec une vraie URL Neon :
  ```
  DATABASE_URL="postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"
  ```
- IMPORTANT : 
  - Gardez les guillemets autour de l'URL
  - Assurez-vous que `?sslmode=require` est à la fin de l'URL
  - Remplacez `username`, `password`, `ep-example-123456`, et `neondb` par vos vraies valeurs
- Sauvegardez le fichier (Ctrl+S ou Cmd+S)

### 2.3 Vérifier que le fichier .env est correct
- Vérifiez que votre fichier `.env` contient exactement une ligne :
  ```
  DATABASE_URL="postgresql://votre-vraie-url-neon"
  ```
- Vérifiez qu'il n'y a pas d'espaces avant ou après l'URL
- Vérifiez que les guillemets sont présents
- Vérifiez que l'URL se termine par `?sslmode=require`

### 2.4 Vérifier le fichier .gitignore
- Ouvrez le fichier `.gitignore` dans votre projet
- Vérifiez qu'il contient la ligne : `.env`
- Si elle n'y est pas, ajoutez-la à la fin du fichier
- Cela empêche de publier vos mots de passe sur GitHub

## ETAPE 3 : Génération du client Prisma

### 3.1 Ouvrir le terminal
- Dans VSCode, ouvrez un terminal : Menu Terminal > New Terminal
- Ou utilisez le raccourci Ctrl+` (ou Cmd+` sur Mac)
- Vérifiez que vous êtes dans le dossier du projet

### 3.2 Générer le client Prisma
- Tapez exactement cette commande :
  ```bash
  npx prisma generate
  ```
- Appuyez sur Entrée
- Attendez que la commande se termine
- Vous devriez voir un message de succès

### 3.3 Que fait cette commande ?
- Elle lit le fichier `prisma/schema.prisma`
- Elle génère le code TypeScript pour interroger la base de données
- Elle crée les types TypeScript automatiquement

## ETAPE 4 : Création de la table en base de données

### 4.1 Créer la première migration
- Dans le même terminal, tapez :
  ```bash
  npx prisma migrate dev --name init
  ```
- Appuyez sur Entrée
- Attendez la fin de l'exécution

### 4.2 Que fait cette commande ?
- Elle se connecte à votre base de données Neon
- Elle crée la table "articles" avec les colonnes définies dans le schéma
- Elle enregistre cette migration dans le dossier `prisma/migrations/`

### 4.3 Vérifier que ça a marché
- Si tout va bien, vous verrez un message de succès
- La table "articles" est maintenant créée dans votre base Neon
- Vous pouvez continuer à l'étape suivante

## ETAPE 5 : Test de l'API avec la base de données

### 5.1 Démarrer le serveur
- Dans le terminal, tapez :
  ```bash
  npm run dev
  ```
- Attendez le message "Ready" avec l'adresse (probablement localhost:3001)
- Laissez le serveur tourner

### 5.2 Tester avec le fichier .http
- Ouvrez le fichier `api-tests.http` dans VSCode
- Commencez par le PREMIER TEST : cliquez sur "Send Request" au-dessus de la première requête GET
- Vous devriez avoir une réponse avec un tableau vide : `[]`
- Cela confirme que l'API fonctionne avec la base de données

### 5.3 Créer votre premier article
- Toujours dans `api-tests.http`, allez au DEUXIEME TEST
- Cliquez sur "Send Request" au-dessus de la requête POST
- Vous devriez recevoir un article avec un ID généré automatiquement
- Copiez cet ID pour les tests suivants

### 5.4 Vérifier la persistance
- Faites le QUATRIEME TEST pour voir que l'article est bien là
- Arrêtez le serveur (Ctrl+C dans le terminal)
- Redémarrez avec `npm run dev`
- Refaites le test GET : l'article est toujours là !

## ETAPE 6 : Utilisation de Prisma Studio (optionnel)

### 6.1 Ouvrir l'interface graphique
- Dans un nouveau terminal, tapez :
  ```bash
  npx prisma studio
  ```
- Votre navigateur va s'ouvrir avec une interface graphique
- Vous pouvez voir vos données directement

### 6.2 Explorer vos données
- Cliquez sur "Article" dans la sidebar
- Vous voyez tous vos articles créés
- Vous pouvez les modifier, les supprimer directement ici
- Fermez l'onglet quand vous avez fini

## ETAPE 7 : Vérifications finales

### 7.1 Checklist de vérification
Vérifiez que tout fonctionne :
- [ ] Compte Neon créé avec succès
- [ ] Fichier `.env` créé avec la bonne URL
- [ ] Commande `npx prisma generate` exécutée sans erreur
- [ ] Commande `npx prisma migrate dev` exécutée sans erreur
- [ ] Serveur Next.js démarre sans erreur
- [ ] Tests API fonctionnent avec `api-tests.http`
- [ ] Les données persistent après redémarrage du serveur

### 7.2 Test complet
- Créez 2-3 articles via l'API
- Modifiez un article
- Supprimez un article
- Redémarrez le serveur
- Vérifiez que les changements sont conservés

## Résolution des problèmes courants

### Problème : Erreur de connexion à la base
**Solution :**
- Vérifiez que l'URL dans `.env` est correcte
- Vérifiez qu'il n'y a pas d'espaces avant ou après l'URL
- Vérifiez que les guillemets sont présents autour de l'URL
- Vérifiez que l'URL se termine par `?sslmode=require`
- Retournez sur Neon et re-copiez l'URL complète

### Problème : Fichier .env non reconnu
**Solution :**
- Vérifiez que le fichier s'appelle exactement `.env` (avec le point)
- Vérifiez que le fichier est à la racine du projet (même niveau que package.json)
- Sur Windows, vérifiez que ce n'est pas `.env.txt`
- Redémarrez VSCode après avoir créé le fichier

### Problème : "Cannot find module '@prisma/client'"
**Solution :**
- Exécutez : `npx prisma generate`
- Si ça ne marche pas : `npm install`
- Redémarrez votre serveur

### Problème : "Table 'articles' doesn't exist"
**Solution :**
- Exécutez : `npx prisma migrate dev --name init`
- Vérifiez que la commande se termine sans erreur

### Problème : Le serveur ne démarre pas
**Solution :**
- Vérifiez que le port n'est pas occupé
- Fermez tous les autres serveurs
- Redémarrez avec `npm run dev`

## Commandes de maintenance

### Réinitialiser complètement la base
```bash
npx prisma migrate reset
```
ATTENTION : Cette commande supprime toutes les données !

### Voir le schéma actuel de la base
```bash
npx prisma db pull
```

### Formater le fichier schema.prisma
```bash
npx prisma format
```

### Voir les migrations appliquées
```bash
npx prisma migrate status
```

## Conclusion

Félicitations ! Vous avez maintenant :
- Une base de données PostgreSQL sur Neon
- Un ORM Prisma configuré
- Une API Next.js qui persiste les données
- Des outils pour gérer et visualiser vos données

Votre API est maintenant prête pour un usage en production avec une vraie base de données ! 