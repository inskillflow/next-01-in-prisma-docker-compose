# 🧪 Comment Tester l'API - Guide Rapide

## 📋 Prérequis
1. **Extension VSCode** : Installez "REST Client" (par Huachao Mao)
2. **Serveur lancé** : `npm run dev` (normalement sur port 3000)

## 🚀 Étapes de Test

### 1. Ouvrez le fichier `api-tests.http`
- Il contient 12 tests numérotés dans l'ordre
- Chaque test a un objectif et un résultat attendu

### 2. Testez dans l'ordre chronologique :

#### **PREMIER TEST** ➜ Vérifier liste vide
```http
GET http://localhost:3000/api/articles
```
*Résultat attendu : `[]`*

#### **DEUXIÈME TEST** ➜ Créer premier article
```http
POST http://localhost:3000/api/articles
{
  "title": "Premier Article de Test",
  "content": "Ceci est le contenu du premier article créé pour tester l'API."
}
```
*⚠️ **IMPORTANT** : Copiez l'ID retourné !*

#### **TROISIÈME TEST** ➜ Créer deuxième article
```http
POST http://localhost:3000/api/articles
{
  "title": "Deuxième Article",
  "content": "Voici le contenu du deuxième article pour enrichir notre base de données."
}
```

#### **QUATRIÈME TEST** ➜ Vérifier la liste
```http
GET http://localhost:3000/api/articles
```
*Résultat attendu : 2 articles*

#### **CINQUIÈME TEST** ➜ Récupérer un article spécifique
```http
GET http://localhost:3000/api/articles/[ID_COPIÉ]
```
*Remplacez `[ID_COPIÉ]` par l'ID du premier article*

#### **SIXIÈME TEST** ➜ Mettre à jour un article
```http
PUT http://localhost:3000/api/articles/[ID_COPIÉ]
{
  "title": "Article Mis à Jour",
  "content": "Ceci est le contenu mis à jour de l'article."
}
```

#### **Et ainsi de suite...** jusqu'au 12ème test

## 💡 Points Importants

- **Ordre obligatoire** : Respectez la numérotation des tests
- **Copiez les IDs** : Après chaque création, copiez l'ID pour les tests suivants
- **Résultats attendus** : Chaque test indique ce que vous devez obtenir
- **Tests d'erreur** : Les derniers tests (10, 11, 12) testent la gestion d'erreurs

## 🔧 Utilisation dans VSCode

1. Ouvrez `api-tests.http`
2. Cliquez sur **"Send Request"** au-dessus de chaque requête
3. Les résultats s'affichent dans un nouvel onglet
4. Suivez l'ordre numéroté !

## 📊 Que tester ?

- ✅ **Fonctionnalité** : Création, lecture, mise à jour, suppression
- ✅ **Validation** : Champs obligatoires, données invalides
- ✅ **Gestion d'erreur** : Articles inexistants, IDs invalides
- ✅ **Persistance** : Les données restent (jusqu'au redémarrage)

## 🎯 Objectif Final

Après ces 12 tests, vous aurez validé :
- Tous les endpoints fonctionnent
- La validation des données
- La gestion d'erreurs
- Le comportement CRUD complet 