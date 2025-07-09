# Exemple de configuration .env pour Neon Database

## Comment créer votre fichier .env

### 1. Créer le fichier
- Dans VSCode, à la racine du projet (même niveau que package.json)
- Créer un nouveau fichier nommé exactement : `.env`
- ATTENTION : Le nom doit être `.env` (avec le point au début, sans extension)

### 2. Contenu du fichier .env
Votre fichier `.env` doit contenir exactement une ligne :

```
DATABASE_URL="postgresql://votre-username:votre-password@ep-votre-endpoint.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### 3. Exemple concret
Si dans Neon vous avez une URL comme :
```
postgresql://alex:ABC123def@ep-cool-morning-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```

Votre fichier `.env` doit contenir :
```
DATABASE_URL="postgresql://alex:ABC123def@ep-cool-morning-123456.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### 4. Points importants
- **Guillemets obligatoires** : L'URL doit être entre guillemets
- **Pas d'espaces** : Pas d'espace avant ou après l'URL
- **sslmode=require** : L'URL doit se terminer par `?sslmode=require`
- **Une seule ligne** : Le fichier ne doit contenir qu'une seule ligne

### 5. Vérification
Votre fichier `.env` est correct si :
- Le nom du fichier est exactement `.env`
- Il contient une seule ligne qui commence par `DATABASE_URL="`
- L'URL est entre guillemets
- L'URL se termine par `?sslmode=require"`

### 6. Problèmes courants à éviter
- ❌ Nom du fichier : `.env.txt` (incorrect)
- ❌ Espaces : `DATABASE_URL= "postgresql://..."` (incorrect)
- ❌ Guillemets manquants : `DATABASE_URL=postgresql://...` (incorrect)
- ❌ Plusieurs lignes ou commentaires dans le fichier

### 7. Où trouver votre URL Neon
1. Connectez-vous sur https://neon.tech
2. Ouvrez votre projet
3. Allez dans la section "Connection string" ou "Database"
4. Copiez l'URL complète qui commence par `postgresql://`

### 8. Sécurité
- Le fichier `.env` contient vos mots de passe
- Il ne doit JAMAIS être partagé ou publié sur GitHub
- Vérifiez que `.env` est dans votre fichier `.gitignore` 