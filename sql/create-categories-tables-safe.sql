-- Créer la table des types de matériel
CREATE TABLE IF NOT EXISTS equipment_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table des fournisseurs
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Allow authenticated users to read equipment types" ON equipment_types;
DROP POLICY IF EXISTS "Allow authenticated users to insert equipment types" ON equipment_types;
DROP POLICY IF EXISTS "Allow authenticated users to update equipment types" ON equipment_types;
DROP POLICY IF EXISTS "Allow authenticated users to delete equipment types" ON equipment_types;

DROP POLICY IF EXISTS "Allow authenticated users to read suppliers" ON suppliers;
DROP POLICY IF EXISTS "Allow authenticated users to insert suppliers" ON suppliers;
DROP POLICY IF EXISTS "Allow authenticated users to update suppliers" ON suppliers;
DROP POLICY IF EXISTS "Allow authenticated users to delete suppliers" ON suppliers;

-- Insérer les types de matériel par défaut
INSERT INTO equipment_types (name, display_name, description) VALUES
('ordinateur', 'Ordinateur', 'Ordinateur de bureau ou portable'),
('imprimante', 'Imprimante', 'Imprimante laser, jet d''encre ou multifonction'),
('claviers_souris', 'Claviers & Souris', 'Périphériques de saisie'),
('switch', 'Switch', 'Commutateur réseau'),
('router', 'Routeur', 'Routeur réseau'),
('borne_wifi', 'Borne WiFi', 'Point d''accès WiFi'),
('ecran', 'Écran', 'Moniteur ou écran d''affichage'),
('station_ecrans', 'Station d''écrans', 'Station d''accueil pour écrans'),
('chargeur_universelle', 'Chargeur universel', 'Chargeur universel pour appareils')
ON CONFLICT (name) DO NOTHING;

-- Insérer quelques fournisseurs par défaut
INSERT INTO suppliers (name, contact_email, contact_phone) VALUES
('Fournisseur Générique', 'contact@fournisseur.com', '01 23 45 67 89'),
('Tech Solutions', 'info@techsolutions.fr', '01 98 76 54 32'),
('IT Equipment', 'sales@itequipment.fr', '01 11 22 33 44')
ON CONFLICT (name) DO NOTHING;

-- Activer RLS
ALTER TABLE equipment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS pour equipment_types
CREATE POLICY "Allow authenticated users to read equipment types" ON equipment_types
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert equipment types" ON equipment_types
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update equipment types" ON equipment_types
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete equipment types" ON equipment_types
  FOR DELETE USING (auth.role() = 'authenticated');

-- Créer les politiques RLS pour suppliers
CREATE POLICY "Allow authenticated users to read suppliers" ON suppliers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert suppliers" ON suppliers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update suppliers" ON suppliers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete suppliers" ON suppliers
  FOR DELETE USING (auth.role() = 'authenticated');

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_equipment_types_name ON equipment_types(name);
CREATE INDEX IF NOT EXISTS idx_equipment_types_active ON equipment_types(is_active);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(is_active);

-- Commentaires
COMMENT ON TABLE equipment_types IS 'Types de matériel disponibles pour les produits';
COMMENT ON TABLE suppliers IS 'Fournisseurs disponibles pour les produits';

