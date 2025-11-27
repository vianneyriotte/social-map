# Gestion des bases de données

Ce projet utilise **Prisma** avec deux backends de base de données :

| Environnement | Base de données | Adaptateur | Fichier .env |
|---------------|-----------------|------------|--------------|
| Local (dev) | SQLite | `@prisma/adapter-better-sqlite3` | `.env.local` |
| Local (Turso) | Turso | `@prisma/adapter-libsql` | `.env.turso` |

La détection est automatique : si `TURSO_DATABASE_URL` et `TURSO_AUTH_TOKEN` sont définis, l'app utilise Turso. Sinon, elle utilise SQLite local.

---

## Fichiers d'environnement

| Fichier | Description | Git |
|---------|-------------|-----|
| `.env.local` | Dev local avec SQLite | Ignoré |
| `.env.turso` | Dev local avec Turso | Ignoré |

---

## 1. Développement Local avec SQLite

C'est le mode par défaut, le plus simple pour développer.

### Fichier `.env.local`

```env
# BetterAuth
BETTER_AUTH_SECRET="local-dev-secret-change-in-production-12345"
BETTER_AUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Lancer

```bash
npm run dev
```

La base SQLite `dev.db` sera créée automatiquement à la racine du projet.

### Migrations

```bash
# Créer une migration
npm run db:migrate -- --name nom_migration

# Appliquer les migrations existantes
npm run db:deploy

# Réinitialiser la base (PERTE DE DONNÉES)
npx prisma migrate reset

# Explorer les données
npm run db:studio
```

---

## 2. Développement Local avec Turso

Utile pour tester avec la vraie base Turso en local.

### Prérequis

1. Installer le CLI Turso :
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   source ~/.zshrc
   ```

2. Se connecter :
   ```bash
   turso auth login
   ```

3. Créer une base (si pas déjà fait) :
   ```bash
   turso db create social-map-db
   ```

### Fichier `.env.turso`

```env
# Turso
TURSO_DATABASE_URL="libsql://social-map-db-xxx.turso.io"
TURSO_AUTH_TOKEN="eyJhbGc..."

# BetterAuth
BETTER_AUTH_SECRET="local-dev-secret-change-in-production-12345"
BETTER_AUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Pour obtenir les valeurs Turso :
```bash
# URL de la base
turso db show social-map-db --url

# Token d'authentification
turso db tokens create social-map-db
```

### Lancer

```bash
npm run dev:turso
```

L'app utilisera Turso grâce au fichier `.env.turso`.

---

## 3. Appliquer le schéma sur Turso

### Première fois (base vide)

```bash
npm run db:push:turso
```

Ou manuellement :
```bash
npx prisma migrate diff --from-empty --to-schema ./prisma/schema.prisma --script | turso db shell social-map-db
```

### Vérifier les tables

```bash
turso db shell social-map-db
.tables
.quit
```

---

## 4. Workflow de migration

### Nouveau changement de schéma

```bash
# 1. Modifier prisma/schema.prisma

# 2. Créer la migration locale (SQLite)
npm run db:migrate -- --name ma_modification

# 3. Tester en local avec SQLite
npm run dev

# 4. Tester en local avec Turso
npm run dev:turso

# 5. Appliquer sur Turso
npm run db:push:turso
```

### Migration incrémentale (base existante)

Si la base Turso a déjà des données et tu veux ajouter une colonne :

```bash
npx prisma migrate diff \
  --from-url "file:./dev.db" \
  --to-schema ./prisma/schema.prisma \
  --script | turso db shell social-map-db
```

---

## 5. Scripts npm disponibles

### Scripts de démarrage

| Script | Environnement | Base de données |
|--------|---------------|-----------------|
| `npm run dev` | Local | SQLite (`.env.local`) |
| `npm run dev:turso` | Local | Turso (`.env.turso`) |
| `npm run build` | Production | - |
| `npm run start` | Production | - |

### Scripts de base de données

| Script | Description |
|--------|-------------|
| `npm run db:generate` | Générer le client Prisma |
| `npm run db:migrate` | Créer une migration locale (SQLite) |
| `npm run db:deploy` | Appliquer les migrations locales |
| `npm run db:studio` | Ouvrir Prisma Studio (SQLite uniquement) |
| `npm run db:push` | Pousser le schéma (SQLite uniquement) |
| `npm run db:push:turso` | Appliquer le schéma sur Turso |

### Autres scripts

| Script | Description |
|--------|-------------|
| `npm run lint` | Vérifier le code |

---

## 6. Comparaison des environnements

| Fonctionnalité | SQLite (local) | Turso |
|----------------|----------------|-------|
| Transactions | Oui | Oui |
| Prisma Studio | Oui | Non |
| Migrations | `prisma migrate` | CLI Turso |
| Performance | Rapide | Edge-optimisé |
| Persistence | Fichier local | Cloud |
| Coût | Gratuit | Gratuit jusqu'à 9GB |

---

## 7. Dépannage

### L'app utilise SQLite au lieu de Turso

Vérifier que les deux variables sont définies dans `.env.turso` :
```env
TURSO_DATABASE_URL="libsql://..."
TURSO_AUTH_TOKEN="eyJ..."
```

Les deux sont nécessaires pour activer Turso.

### Erreur de connexion à Turso

```bash
# Tester la connexion
turso db shell social-map-db
.tables
```

Si erreur, régénérer le token :
```bash
turso db tokens create social-map-db
```

### Tables manquantes sur Turso

Appliquer le schéma :
```bash
npm run db:push:turso
```

### Le client Prisma n'a pas les bons types

```bash
npm run db:generate
```

### Basculer entre SQLite et Turso

Utiliser simplement le bon script de démarrage :

```bash
# SQLite local (défaut)
npm run dev

# Turso
npm run dev:turso
```

Pas besoin de modifier les fichiers `.env` manuellement.

---

## 8. Déploiement Docker (Dokploy)

Le projet inclut un Dockerfile optimisé pour le déploiement sur Dokploy ou tout autre orchestrateur Docker.

### Build de l'image

```bash
docker build -t social-map .
```

### Variables d'environnement requises

Dans Dokploy, configurer ces variables d'environnement :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `TURSO_DATABASE_URL` | URL de la base Turso | `libsql://social-map-db-xxx.turso.io` |
| `TURSO_AUTH_TOKEN` | Token d'authentification Turso | `eyJhbGc...` |
| `BETTER_AUTH_SECRET` | Secret pour Better Auth (32+ caractères) | `votre-secret-production-unique` |
| `BETTER_AUTH_URL` | URL publique de l'app | `https://votre-domaine.com` |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'app | `https://votre-domaine.com` |

### Lancer localement avec Docker

```bash
# Build
docker build -t social-map .

# Run avec variables d'environnement
docker run -p 3000:3000 \
  -e TURSO_DATABASE_URL="libsql://..." \
  -e TURSO_AUTH_TOKEN="eyJ..." \
  -e BETTER_AUTH_SECRET="votre-secret" \
  -e BETTER_AUTH_URL="http://localhost:3000" \
  -e NEXT_PUBLIC_APP_URL="http://localhost:3000" \
  social-map
```

### Configuration Dokploy

1. Créer une nouvelle application dans Dokploy
2. Connecter votre repository Git
3. Dokploy détectera automatiquement le Dockerfile
4. Configurer les variables d'environnement dans l'interface Dokploy
5. Déployer

### Architecture du Dockerfile

Le Dockerfile utilise un build multi-stage :

1. **base** : Image Alpine avec Node.js 20 et dépendances natives
2. **deps** : Installation des dépendances npm et génération Prisma
3. **builder** : Build de l'application Next.js en mode standalone
4. **runner** : Image finale minimale pour la production

Avantages :
- Image finale légère (~200MB au lieu de 1GB+)
- Sécurité : exécution en tant qu'utilisateur non-root
- Performance : mode standalone de Next.js

---

## 9. Ressources

- [Documentation Turso](https://docs.turso.tech/)
- [Prisma + libSQL](https://www.prisma.io/docs/orm/overview/databases/turso)
- [Turso CLI Reference](https://docs.turso.tech/cli/introduction)
- [Documentation Dokploy](https://docs.dokploy.com/)
