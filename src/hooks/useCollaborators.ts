import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Collaborator } from '@/types/stock';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variables d\'environnement Supabase manquantes');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const useCollaborators = () => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les collaborateurs
  const loadCollaborators = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('collaborators')
        .select('*')
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;

      const formattedCollaborators: Collaborator[] = data.map(c => ({
        id: c.id,
        firstName: c.first_name,
        lastName: c.last_name,
        fullName: c.full_name,
        isActive: c.is_active,
        createdAt: new Date(c.created_at),
        updatedAt: new Date(c.updated_at),
      }));

      setCollaborators(formattedCollaborators);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des collaborateurs:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un collaborateur
  const addCollaborator = async (firstName: string, lastName: string) => {
    try {
      const { data, error } = await supabase
        .from('collaborators')
        .insert({
          first_name: firstName,
          last_name: lastName,
        })
        .select()
        .single();

      if (error) throw error;

      const newCollaborator: Collaborator = {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        fullName: data.full_name,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setCollaborators(prev => [...prev, newCollaborator].sort((a, b) => a.fullName.localeCompare(b.fullName)));
      return newCollaborator;
    } catch (err) {
      console.error('Erreur lors de l\'ajout du collaborateur:', err);
      throw err;
    }
  };

  // Supprimer un collaborateur (désactiver)
  const deleteCollaborator = async (id: string) => {
    try {
      const { error } = await supabase
        .from('collaborators')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setCollaborators(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression du collaborateur:', err);
      throw err;
    }
  };

  // Modifier un collaborateur
  const updateCollaborator = async (id: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await supabase
        .from('collaborators')
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedCollaborator: Collaborator = {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        fullName: data.full_name,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setCollaborators(prev => 
        prev.map(c => c.id === id ? updatedCollaborator : c)
          .sort((a, b) => a.fullName.localeCompare(b.fullName))
      );
      return updatedCollaborator;
    } catch (err) {
      console.error('Erreur lors de la modification du collaborateur:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadCollaborators();
  }, []);

  return {
    collaborators,
    loading,
    error,
    loadCollaborators,
    addCollaborator,
    deleteCollaborator,
    updateCollaborator,
  };
};















