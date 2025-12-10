# Configuration de l'authentification Supabase

## 1. Configuration dans l'interface Supabase

### Désactiver la vérification d'email
1. Allez dans votre projet Supabase
2. Cliquez sur **Authentication** dans le menu de gauche
3. Allez dans **Settings** > **Auth**
4. Désactivez **"Enable email confirmations"**
5. Sauvegardez les modifications

### Configurer les politiques de sécurité
1. Allez dans l'onglet **SQL Editor**
2. Copiez et exécutez le contenu du fichier `setup-auth.sql`
3. Vérifiez que les politiques ont été créées dans **Authentication** > **Policies**

## 2. Fonctionnalités d'authentification

### ✅ Inscription
- Email et mot de passe requis
- Nom complet optionnel (utilise l'email si non fourni)
- Création automatique du profil utilisateur
- Validation des mots de passe (minimum 6 caractères)

### ✅ Connexion
- Email et mot de passe
- Session persistante
- Déconnexion automatique

### ✅ Interface utilisateur
- Formulaire d'authentification élégant
- Header avec informations utilisateur
- Menu de déconnexion
- Gestion des erreurs

## 3. Sécurité

### Politiques RLS (Row Level Security)
- **Produits** : Lecture/écriture pour tous les utilisateurs authentifiés
- **Mouvements** : Lecture/écriture pour tous les utilisateurs authentifiés
- **Utilisateurs** : Lecture pour tous, modification de son propre profil
- **Imports** : Lecture/écriture pour tous les utilisateurs authentifiés

### Fonctions automatiques
- **Création de profil** : Automatique lors de l'inscription
- **Utilisateur actuel** : Fonction pour récupérer les infos de l'utilisateur connecté

## 4. Test de l'authentification

### Inscription
1. Ouvrez l'application
2. Cliquez sur "S'inscrire"
3. Remplissez le formulaire
4. Vous devriez être automatiquement connecté

### Connexion
1. Cliquez sur "Se connecter"
2. Utilisez vos identifiants
3. Vous devriez accéder à l'application

### Déconnexion
1. Cliquez sur votre avatar en haut à droite
2. Cliquez sur "Se déconnecter"

## 5. Données de test

Le script SQL inclut des données de test :
- **Utilisateurs** : admin@example.com et user@example.com
- **Produits** : 3 produits d'exemple
- **Mouvements** : Quelques mouvements de test

## 6. Personnalisation

### Modifier les politiques
Vous pouvez modifier les politiques RLS dans Supabase pour restreindre davantage l'accès selon vos besoins.

### Ajouter des rôles
Modifiez la fonction `handle_new_user()` pour assigner des rôles différents selon l'email ou d'autres critères.

### Interface utilisateur
Modifiez les composants `AuthForm.tsx` et `UserHeader.tsx` pour personnaliser l'apparence.

## 7. Dépannage

### Erreur "Invalid login credentials"
- Vérifiez que l'utilisateur existe dans Supabase
- Vérifiez que la vérification d'email est désactivée

### Erreur RLS
- Vérifiez que les politiques ont été créées
- Vérifiez que l'utilisateur est bien authentifié

### Données non chargées
- Vérifiez que l'utilisateur est connecté
- Vérifiez les logs de la console pour les erreurs
























