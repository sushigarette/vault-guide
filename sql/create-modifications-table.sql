-- Créer la table des modifications de produits
CREATE TABLE IF NOT EXISTS product_modifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  modified_by TEXT NOT NULL,
  modified_by_email TEXT,
  modification_type TEXT NOT NULL CHECK (modification_type IN ('CREATE', 'UPDATE', 'DELETE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_product_modifications_product_id ON product_modifications(product_id);
CREATE INDEX IF NOT EXISTS idx_product_modifications_created_at ON product_modifications(created_at DESC);

-- Activer RLS (Row Level Security)
ALTER TABLE product_modifications ENABLE ROW LEVEL SECURITY;

-- Créer une politique RLS pour permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to read modifications" ON product_modifications
  FOR SELECT USING (auth.role() = 'authenticated');

-- Créer une politique RLS pour permettre l'insertion à tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to insert modifications" ON product_modifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Commentaire sur la table
COMMENT ON TABLE product_modifications IS 'Historique des modifications des produits';
COMMENT ON COLUMN product_modifications.field_name IS 'Nom du champ modifié (affiché à l''utilisateur)';
COMMENT ON COLUMN product_modifications.old_value IS 'Ancienne valeur du champ';
COMMENT ON COLUMN product_modifications.new_value IS 'Nouvelle valeur du champ';
COMMENT ON COLUMN product_modifications.modified_by IS 'Nom de l''utilisateur qui a effectué la modification';
COMMENT ON COLUMN product_modifications.modified_by_email IS 'Email de l''utilisateur qui a effectué la modification';
COMMENT ON COLUMN product_modifications.modification_type IS 'Type de modification: CREATE, UPDATE, DELETE';

