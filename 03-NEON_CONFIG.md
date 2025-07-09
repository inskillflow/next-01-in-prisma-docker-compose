# 🌐 Configuration Neon Database

## 📋 Étapes pour configurer Neon

### 1. Créer un compte Neon
- Allez sur [https://neon.tech](https://neon.tech)
- Créez un compte gratuit
- Créez une nouvelle base de données PostgreSQL

### 2. Obtenir l'URL de connexion
- Dans le dashboard Neon, copiez l'URL de connexion
- Elle ressemble à : `postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/dbname?sslmode=require`

### 3. Créer le fichier .env
Créez un fichier `.env` à la racine du projet avec :

```env
DATABASE_URL="postgresql://votre-url-neon-ici"
```

### 4. Exemple de fichier .env
```env
# Database
DATABASE_URL="postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/dbname?sslmode=require"
```

### 5. Vérifier le .gitignore
Assurez-vous que `.env` est dans votre `.gitignore` pour ne pas commiter les credentials.

## 🔧 Après configuration

1. Générez le client Prisma : `npx prisma generate`
2. Créez la migration : `npx prisma migrate dev --name init`
3. Optionnel : Visualisez la DB : `npx prisma studio` 