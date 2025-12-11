import { supabase } from './supabase';

export const initializeAuth = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      return session.user;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: 'admin123'
    });

    if (error) {
      console.error('Erreur d\'authentification:', error);
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
    return null;
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
};















