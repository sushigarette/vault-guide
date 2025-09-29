# Configuration Supabase pour le système de gestion de stock

## 1. Création du projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Choisissez votre organisation
5. Donnez un nom à votre projet (ex: "gestion-stock")
6. Créez un mot de passe fort pour la base de données
7. Choisissez une région proche de vous
8. Cliquez sur "Create new project"

## 2. Configuration de la base de données

1. Une fois votre projet créé, allez dans l'onglet "SQL Editor"
2. Copiez le contenu du fichier `supabase-schema.sql`
3. Collez-le dans l'éditeur SQL
4. Cliquez sur "Run" pour exécuter le script

## 3. Configuration des variables d'environnement

1. Allez dans l'onglet "Settings" > "API"
2. Copiez l'URL du projet et la clé publique (anon key)
3. Créez un fichier `.env` à la racine du projet
4. Copiez le contenu du fichier `env.example` dans `.env`
5. Remplacez les valeurs par vos vraies données :

```env
VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_publique_ici
```

## 4. Installation des dépendances Supabase

```bash
npm install @supabase/supabase-js
```

## 5. Configuration de l'authentification (optionnel)

Si vous voulez utiliser l'authentification Supabase :

1. Allez dans "Authentication" > "Settings"
2. Configurez les providers d'authentification (email, Google, etc.)
3. Activez l'authentification par email si nécessaire

## 6. Configuration des politiques de sécurité

Le script SQL inclut déjà les politiques RLS (Row Level Security) de base. Vous pouvez les modifier selon vos besoins dans l'onglet "Authentication" > "Policies".

## 7. Test de la connexion

Une fois configuré, vous pouvez tester la connexion en démarrant l'application :

```bash
npm run dev
```

## Structure de la base de données

### Tables principales :
- **products** : Produits en stock
- **stock_movements** : Mouvements de stock (entrées/sorties)
- **users** : Utilisateurs du système
- **categories** : Catégories de produits (optionnel)
- **suppliers** : Fournisseurs (optionnel)
- **imports** : Historique des imports

### Vues utiles :
- **stock_status_stats** : Statistiques par statut
- **recent_movements_with_details** : Mouvements récents avec détails

### Fonctions :
- **get_stock_stats()** : Calcule les statistiques globales
- **update_updated_at_column()** : Met à jour automatiquement les timestamps

## Données de test

Le script inclut des données de test que vous pouvez supprimer en production :
- 1 utilisateur admin
- 1 utilisateur test
- 3 produits d'exemple
- Quelques mouvements de stock

## Sécurité

- RLS (Row Level Security) est activé sur toutes les tables
- Les politiques permettent l'accès aux utilisateurs authentifiés
- Les clés API sont sécurisées par Supabase

## Support

Pour toute question sur Supabase, consultez la [documentation officielle](https://supabase.com/docs).








