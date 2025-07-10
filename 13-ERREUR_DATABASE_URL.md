
# **Erreur détectée**

L’erreur **Prisma Client Error**  apparaît dans **Prisma Studio** lorsque nous essayons d’ajouter un enregistrement. Voici une explication complète et précise du message :

```
Prisma Client Error
Unable to run script
Invalid STUDIO_EMBED_BUILD ...
```



# **Cause principale**

L’erreur provient du fait que **Prisma Studio** tente d'exécuter du code client Prisma dans un environnement mal configuré. Plus précisément :

* Le champ `STUDIO_EMBED_BUILD` est **invalide ou mal interprété** par Prisma Studio.
* Cela semble être lié à un **conflit d'environnement** (ex. variable mal définie ou version incompatible du client Prisma).
* Le chemin montre que tu utilises un projet local :

  ```
  C:\Users\Haythem\Downloads\G1266-main\next-01-projet01-in-memory\
  ```



# **Solutions**

####  1. Réinstalle proprement Prisma

Dans le dossier de ton projet :

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

Puis régénère le client Prisma :

```bash
npx prisma generate
```



# 2. Vérifie que Prisma est bien à jour

Installe les dernières versions :

```bash
npm install prisma @prisma/client
```

---

# 3. Regénère la base avec migration (si applicable)

```bash
npx prisma migrate dev
```


# 4. Essaie de relancer Prisma Studio

```bash
npx prisma studio
```


# Autres vérifications

* Assure-toi que ton fichier `.env` contient une **variable `DATABASE_URL`** valide.
* Si tu utilises `cuid()` ou `now()` dans une interface comme Prisma Studio, ils doivent être **gérés côté Prisma**, pas insérés manuellement dans le champ.
* Évite d'utiliser Prisma Studio dans un build spécial type `embed` ou de l’ouvrir à partir d’un bundle Webpack compressé.


# Résumé de la cause

> Prisma Studio tente d’exécuter un script embarqué (`STUDIO_EMBED_BUILD`) qui est **mal défini** dans ton environnement actuel. Ce problème est souvent causé par une installation corrompue ou un conflit de version de Prisma Client.



# Annexe 1

```env
createdb testdb
npx prisma db push
npx prisma studio
```


# 1. **Nom du fichier d’environnement à utiliser avec Prisma**

Par défaut, Prisma ne lit **que le fichier `.env`** (pas `.env.local`) **lors de l’exécution des commandes CLI (`prisma generate`, `prisma migrate`, etc.)**.

✔️ Donc **ton fichier `.env`** doit absolument contenir **cette ligne** :

```env
DATABASE_URL="postgresql://neondb_owner:npg_z1cN6qYxVFMB@ep-sparkling-hill-ae6xwlzp-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### 👉 **Action immédiate :**

1. Ouvre `.env` à la racine du projet.
2. Assure-toi qu’il contient **exactement** cette ligne **(sans faute, pas de retour à la ligne parasite)**.
3. Supprime le fichier `.env.local` (ou renomme-le si tu veux le garder).



# 2. **Supprime les caractères cachés Windows**

Sous Windows, il est fréquent que des caractères invisibles (\r ou BOM) causent des problèmes.

### Pour t’en assurer :

* Ouvre `.env` avec **VS Code**, sélectionne l’encodage `UTF-8 sans BOM`, puis **sauvegarde**.
* Supprime les lignes vides et inutiles.


# 3. **Relance Prisma depuis la racine**

```bash
npx prisma generate
npx prisma db push
npx prisma studio
```



# 4. **Si tu es dans Next.js**

Assure-toi que tu n’as **pas besoin de `dotenv.config()` manuellement**, Prisma gère ça pour ses propres commandes.



# Résumé

| Vérification                                          | Statut        |
| ----------------------------------------------------- | ------------- |
| `.env` existe et contient `DATABASE_URL=...`          | ✅ Obligatoire |
| `.env.local` supprimé ou ignoré                       | ✅             |
| Chemin complet de l’URL PostgreSQL                    | ✅             |
| Prisma relancé avec `npx prisma ...`                  | ✅             |
| PostgreSQL en ligne chez Neon, avec `sslmode=require` | ✅             |


