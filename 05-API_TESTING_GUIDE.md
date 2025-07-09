# Guide de Test API - Articles

## 📋 Vue d'ensemble

Ce projet Next.js contient une API complète pour la gestion d'articles avec stockage en mémoire.

## 🚀 Démarrage rapide

### 1. Installation des dépendances
```bash
npm install
```

### 2. Lancement du serveur de développement
```bash
npm run dev
```

Le serveur sera disponible sur `http://localhost:3000`

## 📊 Endpoints disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/articles` | Récupérer tous les articles |
| POST | `/api/articles` | Créer un nouvel article |
| GET | `/api/articles/[id]` | Récupérer un article par ID |
| PUT | `/api/articles/[id]` | Mettre à jour un article |
| DELETE | `/api/articles/[id]` | Supprimer un article |

## 🏗️ Structure des données

### Article
```typescript
{
  id: string,        // UUID généré automatiquement
  title: string,     // Titre de l'article
  content: string,   // Contenu de l'article
  createdAt: string  // Date de création (ISO string)
}
```

## 🧪 Tests avec l'extension REST Client

### 1. Installation de l'extension
1. Ouvrez VSCode
2. Allez dans Extensions (Ctrl+Shift+X)
3. Recherchez "REST Client"
4. Installez l'extension de Huachao Mao

### 2. Utilisation du fichier tests.http
1. Assurez-vous que le serveur Next.js est lancé (`npm run dev`)
2. Ouvrez le fichier `tests.http` dans VSCode
3. Cliquez sur "Send Request" au-dessus de chaque requête
4. Les réponses s'afficheront dans un nouvel onglet

### 3. Ordre de test recommandé
1. **GET /api/articles** - Vérifier que la liste est vide
2. **POST /api/articles** - Créer quelques articles
3. **GET /api/articles** - Vérifier que les articles sont créés
4. **GET /api/articles/[id]** - Tester la récupération d'un article spécifique
5. **PUT /api/articles/[id]** - Tester la mise à jour
6. **DELETE /api/articles/[id]** - Tester la suppression

## 🔧 Exemples de requêtes

### Créer un article
```http
POST http://localhost:3000/api/articles
Content-Type: application/json

{
  "title": "Mon Article",
  "content": "Contenu de l'article"
}
```

### Mettre à jour un article
```http
PUT http://localhost:3000/api/articles/[ID_ARTICLE]
Content-Type: application/json

{
  "title": "Titre mis à jour",
  "content": "Contenu mis à jour"
}
```

## ⚠️ Codes d'erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Données invalides (champs manquants) |
| 404 | Article non trouvé |

## 🧹 Commandes utiles

```bash
# Démarrer le serveur
npm run dev

# Linter
npm run lint

# Formatage du code
npm run format

# Build pour production
npm run build
```

## 📝 Notes importantes

- Les données sont stockées **en mémoire** : elles seront perdues au redémarrage du serveur
- Les IDs sont générés automatiquement avec UUID v4
- La validation vérifie que `title` et `content` sont présents
- Le serveur utilise le port 3000 par défaut 