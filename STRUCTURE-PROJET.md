# Fichiers conservés après nettoyage

## 📁 **Structure du projet**

### **Configuration**
- `package.json` - Dépendances npm
- `eslint.config.js` - Configuration ESLint
- `tailwind.config.ts` - Configuration Tailwind
- `postcss.config.js` - Configuration PostCSS
- `vite.config.ts` - Configuration Vite
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` - Configuration TypeScript
- `components.json` - Configuration des composants UI

### **Documentation essentielle**
- `README.md` - Documentation principale du projet
- `GUIDE-NOUVEAU-IMPORT.md` - Guide d'import des données
- `GUIDE-IMPORT-STOCK.md` - Guide d'import du stock
- `AUTH_SETUP.md` - Configuration de l'authentification
- `FEATURES.md` - Liste des fonctionnalités
- `SUPABASE_SETUP.md` - Configuration Supabase

### **SQL - Base de données**
- `sql/migrate-new-structure.sql` - **SEUL FICHIER SQL** - Migration complète vers la nouvelle structure avec :
  - Ajout des nouveaux champs (usage_duration_months, reevaluation_date)
  - Mise à jour des types de matériel (19 catégories)
  - Nettoyage des données existantes

### **Données formatées** (conservées)
- `stock-formatted.csv` - CSV formaté pour import
- `stock-converted.json` - JSON converti pour import

### **Source Code**
- `src/` - Tous les fichiers source TypeScript/React
  - `App.tsx` - Composant principal
  - `main.tsx` - Point d'entrée
  - `components/` - Composants React
  - `pages/` - Pages de l'application
  - `hooks/` - Hooks React personnalisés
  - `lib/` - Bibliothèques utilitaires
  - `types/` - Définitions TypeScript

### **Assets et public**
- `public/` - Fichiers publics (favicon, robots.txt, etc.)
- `index.html` - HTML principal

### **Déploiement**
- `deploy.sh` - Script de déploiement

## 🗑️ **Fichiers supprimés**

### **Scripts temporaires**
- `*.cjs` - Scripts temporaires de conversion
- `*.js` - Scripts temporaires de test
- `clean-database.sql` - SQL temporaire
- `test-*.csv` - CSV de test

### **Documentation temporaire**
- Tous les fichiers `CORRECTION-*.md`
- Tous les fichiers `REORGANISATION-*.md`
- Fichiers de documentation de transition

### **Données temporaires**
- `Stock.csv` - Fichier CSV original (gardé en sécurité)
- `stock-converted.json` - JSON converti (gardé pour référence)

## 🚫 **Exclus de Git (.gitignore)**

### **Application iOS**
- `MHStock/` - Dossier de l'application iOS (ne pas partager)

### **Dependencies**
- `node_modules/` - Modules npm
- `bun.lockb` - Lock file Bun
- `package-lock.json` - Lock file npm

### **Build et environnements**
- `dist/` - Build de production
- `.env*` - Variables d'environnement

### **IDE et OS**
- `.vscode/` - Configuration VSCode
- `.DS_Store` - Fichiers macOS

## ✅ **Fichiers conservés pour référence**

### **Données**
- `stock-formatted.csv` - CSV formaté pour l'import
- `stock-converted.json` - JSON converti pour l'import

### **SQL**
- Tous les fichiers dans `sql/` sont conservés pour référence et migration

### **Documentation essentielle**
- Guides d'utilisation
- Configuration
- Features

## 📝 **Structure finale recommandée**

```
vault-guide/
├── src/                    # Code source
├── sql/                    # Scripts SQL
├── public/                 # Assets publics
├── .gitignore             # Exclusion des fichiers sensibles
├── package.json           # Dépendances
├── README.md              # Documentation principale
├── GUIDE-*.md             # Guides d'utilisation
├── stock-formatted.csv    # Données formatées
└── stock-converted.json   # Données formatées
```

Les fichiers sont maintenant nettoyés et organisés. Le dossier `MHStock/` (application iOS) est exclu de Git via `.gitignore` !
