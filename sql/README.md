# Scripts SQL

## 📁 **Fichier conservé**

### **migrate-new-structure.sql**
Script de migration vers la nouvelle structure de la base de données.

**Ce script :**
1. Ajoute les nouveaux champs `usage_duration_months` et `reevaluation_date`
2. Met à jour les types de matériel avec 19 catégories
3. Nettoie toutes les données existantes
4. Vérifie que la base de données est prête pour les nouvelles données

**⚠️ Attention :** Ce script supprime TOUTES les données existantes !

**✅ Utilisation :**
```bash
# Exécuter le script dans Supabase SQL Editor
psql -h your-db-host -U postgres -d your-db -f sql/migrate-new-structure.sql
```

**📋 Contenu :**
- Migration des colonnes
- Ajout des nouveaux types de matériel
- Contraintes et vérifications
- Nettoyage complet des données
