# Scripts SQL - Setup de la base de données

Ce dossier contient tous les scripts SQL nécessaires pour configurer la base de données du projet Vault Guide.

## 📋 Ordre d'exécution recommandé

### 1. Configuration de base
```sql
-- Script principal du schéma
supabase-schema.sql
```

### 2. Configuration de l'authentification
```sql
-- Configuration des politiques RLS et authentification
setup-auth.sql
```

### 3. Tables des catégories
```sql
-- Tables pour les types d'équipement et fournisseurs
create-categories-tables-safe.sql
```

### 4. Table des collaborateurs
```sql
-- Table pour gérer les collaborateurs
create-collaborators-table.sql
```

### 5. Table des modifications
```sql
-- Table pour l'historique des modifications
create-modifications-table.sql
```

## 🚀 Installation rapide

Pour une installation complète, exécutez les scripts dans l'ordre ci-dessus dans l'éditeur SQL de Supabase.

## 📝 Notes

- Tous les scripts sont idempotents (peuvent être exécutés plusieurs fois sans erreur)
- Les scripts utilisent `CREATE TABLE IF NOT EXISTS` et `ON CONFLICT DO NOTHING`
- Les politiques RLS sont configurées pour la sécurité des données
- Les contraintes sont mises à jour automatiquement lors de l'ajout de nouvelles catégories

## 🔧 Maintenance

- Pour ajouter de nouveaux types d'équipement : utilisez l'interface de l'application
- Pour ajouter de nouveaux fournisseurs : utilisez l'interface de l'application
- Les modifications sont automatiquement gérées par l'application


