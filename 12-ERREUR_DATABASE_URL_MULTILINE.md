# ERREUR DOCUMENTÉE - DATABASE_URL Multi-ligne

## 🚨 SYMPTÔMES DE L'ERREUR

### Erreur rencontrée lors de `npx prisma migrate dev` :

```bash
$ npx prisma migrate dev
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Error: Prisma schema validation - (get-config wasm)
Error code: P1012
error: Environment variable not found: DATABASE_URL.
  -->  prisma\schema.prisma:13
   |
12 |   provider = "postgresql"
13 |   url      = env("DATABASE_URL")
   |

Validation Error Count: 1
[Context: getConfig]
```

### Erreur rencontrée dans Next.js (runtime) :

```bash
Error [PrismaClientInitializationError]:
Invalid `prisma.article.findMany()` invocation:
error: Environment variable not found: DATABASE_URL.
  -->  schema.prisma:13
   |
12 |   provider = "postgresql"
13 |   url      = env("DATABASE_URL")
   |
Validation Error Count: 1
```

---

## 🔍 ANALYSE DU PROBLÈME

### Contexte observé :

1. **Next.js CLI** : Affiche `Environment variables loaded from .env` ✅
2. **Prisma CLI** : Erreur `Environment variable not found: DATABASE_URL` ❌
3. **Fichiers présents** : `.env` et `.env.local` existent tous les deux
4. **Comportement** : Next.js fonctionne parfois, Prisma CLI échoue toujours

### Différence de comportement :

| Outil | Lecture .env | Lecture .env.local | Tolérance multi-ligne |
|-------|-------------|-------------------|----------------------|
| **Next.js** | ✅ | ✅ | ⚠️ Parfois tolérant |
| **Prisma CLI** | ✅ | ❌ | ❌ Strict |

---

## 🎯 CAUSE RACINE IDENTIFIÉE

### Le problème : URL DATABASE_URL cassée sur plusieurs lignes

**Contenu erroné du fichier .env :**
```env
DATABASE_URL="postgresql://neondb_owner:npg_z1cN6qYxVFMB@ep-sparkling-hill-ae6xwlzp-pooler.c-2.
us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

**Problème :**
- L'URL est **cassée sur 2 lignes** avec un retour à la ligne
- Prisma CLI n'arrive pas à parser cette URL multi-ligne
- Next.js est parfois plus tolérant mais pas toujours

**Vérification du problème :**
```bash
# Commande pour voir le problème
Get-Content .env

# Résultat montrant la cassure
DATABASE_URL="postgresql://neondb_owner:npg_z1cN6qYxVFMB@ep-sparkling-hill-ae6xwlzp-pooler.c-2.
us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

---

## ✅ SOLUTION APPLIQUÉE

### Étape 1 : Correction de l'URL sur une seule ligne

**Contenu correct du fichier .env :**
```env
DATABASE_URL="postgresql://neondb_owner:npg_z1cN6qYxVFMB@ep-sparkling-hill-ae6xwlzp-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### Étape 2 : Validation de la correction

**Commande de test :**
```bash
npx prisma migrate dev --name test
```

**Résultat attendu :**
```bash
Environment variables loaded from .env ✅
Prisma schema loaded from prisma\schema.prisma ✅
Datasource "db": PostgreSQL database "neondb" ✅
Already in sync, no schema change or pending migration was found. ✅
```

---

## 🔧 MÉTHODES DE RÉSOLUTION

### Méthode 1 : Correction manuelle dans VSCode

1. **Ouvrir le fichier .env :**
   ```bash
   code .env
   ```

2. **Remplacer par l'URL sur une seule ligne :**
   ```env
   DATABASE_URL="postgresql://votre-url-complete-sur-une-seule-ligne"
   ```

3. **Sauvegarder :** `Ctrl+S`

### Méthode 2 : Correction via PowerShell

```powershell
# Remplacer par votre URL complète
Set-Content -Path .env -Value 'DATABASE_URL="postgresql://votre-url-complete"'
```

### Méthode 3 : Recréer le fichier .env

```bash
# Supprimer et recréer
rm .env
echo 'DATABASE_URL="postgresql://votre-url-complete"' > .env
```

---

## 🧪 VALIDATION ET TESTS

### Tests de validation :

1. **Test Prisma CLI :**
   ```bash
   npx prisma validate
   npx prisma migrate dev --name test
   ```

2. **Test Next.js :**
   ```bash
   npm run dev
   # Tester l'API : GET http://localhost:3000/api/articles
   ```

3. **Test de la variable d'environnement :**
   ```bash
   # PowerShell
   echo $env:DATABASE_URL
   
   # Ou dans Node.js
   console.log(process.env.DATABASE_URL)
   ```

---

## 📋 PRÉVENTION

### Bonnes pratiques pour éviter cette erreur :

1. **Copier l'URL Neon correctement :**
   - ✅ Sélectionner l'URL complète d'un coup
   - ✅ Vérifier qu'elle est sur une seule ligne
   - ❌ Éviter les copier-coller partiels

2. **Validation après création du .env :**
   ```bash
   # Vérifier le contenu
   cat .env
   # ou
   Get-Content .env
   ```

3. **Test immédiat :**
   ```bash
   # Tester Prisma dès la création du .env
   npx prisma validate
   ```

4. **Format correct de l'URL :**
   ```env
   # ✅ Correct
   DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
   
   # ❌ Incorrect (multi-ligne)
   DATABASE_URL="postgresql://user:pass@
   host:5432/db?sslmode=require"
   ```

---

## 🚨 SIGNAUX D'ALERTE

### Comment détecter cette erreur :

1. **Prisma CLI échoue** mais Next.js fonctionne parfois
2. **Message d'erreur** : `Environment variable not found: DATABASE_URL`
3. **Fichier .env existe** mais Prisma ne le lit pas
4. **Comportement inconsistant** entre les outils

### Diagnostic rapide :

```bash
# Test 1 : Vérifier que le fichier existe
ls -la .env

# Test 2 : Vérifier le contenu
cat .env

# Test 3 : Tester Prisma
npx prisma validate

# Test 4 : Compter les lignes
wc -l .env
# Si > 1 ligne, vérifier les retours à la ligne
```

---

## 📊 IMPACT ET FRÉQUENCE

### Fréquence d'occurrence :

- **Élevée** lors de la première configuration Neon
- **Moyenne** lors des copier-coller d'URL longues
- **Faible** après correction (rare récidive)

### Impact sur le projet :

- **Critique** : Empêche toute utilisation de Prisma CLI
- **Bloquant** : Migrations impossibles
- **Frustrant** : Erreur pas toujours évidente à diagnostiquer

### Outils affectés :

- ❌ **Prisma CLI** : Complètement bloqué
- ⚠️ **Next.js** : Comportement imprévisible
- ❌ **Prisma Studio** : Ne peut pas se connecter
- ❌ **Migrations** : Impossibles à exécuter

---

## 🔄 VARIATIONS DE L'ERREUR

### Autres manifestations possibles :

1. **Erreur de connexion :**
   ```
   Error: connect ENOTFOUND undefined
   ```

2. **URL invalide :**
   ```
   Error: Invalid database URL
   ```

3. **Échec de parsing :**
   ```
   Error: Database URL is malformed
   ```

### Causes similaires :

- **Espaces** avant/après l'URL
- **Caractères spéciaux** non échappés
- **Guillemets** manquants ou incorrects
- **Commentaires** dans le fichier .env

---

## 🏆 RÉSOLUTION RÉUSSIE

### Validation finale :

**Avant (erreur) :**
```bash
$ npx prisma migrate dev
Error: Environment variable not found: DATABASE_URL.
```

**Après (succès) :**
```bash
$ npx prisma migrate dev
Environment variables loaded from .env ✅
Datasource "db": PostgreSQL database "neondb" ✅
Already in sync, no schema change or pending migration was found. ✅
```

### Confirmation Next.js :

```bash
$ npm run dev
▲ Next.js 15.3.4
- Local:        http://localhost:3000
- Environments: .env.local, .env ✅
✓ Ready in 1854ms
GET /api/articles 200 in 2316ms ✅
POST /api/articles 201 in 150ms ✅
```

---

## 📝 DOCUMENTATION TECHNIQUE

### Informations système :

- **OS** : Windows 10 (PowerShell)
- **Node.js** : Version 18+
- **Next.js** : 15.3.4
- **Prisma** : 6.11.1
- **Base de données** : Neon PostgreSQL

### Fichiers impliqués :

- `.env` : Fichier principal des variables d'environnement
- `.env.local` : Fichier local Next.js (optionnel)
- `prisma/schema.prisma` : Schéma Prisma
- `src/lib/prisma.ts` : Client Prisma

### Commandes de diagnostic :

```bash
# Diagnostic complet
npx prisma validate
npx prisma migrate status
Get-Content .env | Measure-Object -Line
echo $env:DATABASE_URL
```

---

## 🎯 CONCLUSION

### Leçons apprises :

1. **Prisma CLI est plus strict** que Next.js pour les variables d'environnement
2. **Les URL longues** sont sujettes aux erreurs de retour à la ligne
3. **La validation immédiate** permet de détecter le problème rapidement
4. **Une seule ligne** est impérative pour les URL de base de données

### Recommandations :

- ✅ Toujours valider avec `npx prisma validate` après création du .env
- ✅ Utiliser un éditeur de texte pour vérifier les retours à la ligne
- ✅ Tester immédiatement après configuration
- ✅ Documenter la configuration pour l'équipe

**Cette erreur, bien que frustrante, est facilement résolvable une fois identifiée. La clé est de comprendre que Prisma CLI nécessite une URL parfaitement formatée sur une seule ligne.**

---

*Document créé le : [Date]  
Dernière mise à jour : [Date]  
Statut : Résolu ✅* 