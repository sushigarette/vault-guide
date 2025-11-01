import { supabase } from './supabase';

// Fonction pour s'authentifier automatiquement avec un utilisateur par défaut
export const initializeAuth = async () => {
  try {
    // Vérifier si l'utilisateur est déjà connecté
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      console.log('Utilisateur déjà connecté:', session.user.email);
      return session.user;
    }

    // S'authentifier avec l'utilisateur par défaut
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'admin123' // Changez ce mot de passe en production
    });

    if (error) {
      console.error('Erreur d\'authentification:', error);
      return null;
    }

    console.log('Authentification réussie:', data.user?.email);
    return data.user;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
    return null;
  }
};

// Fonction pour se déconnecter
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
};






















