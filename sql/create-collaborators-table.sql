-- Script pour créer la table des collaborateurs
-- À exécuter dans Supabase SQL Editor

-- Créer la table des collaborateurs
CREATE TABLE IF NOT EXISTS collaborators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  full_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(full_name)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_collaborators_full_name ON collaborators(full_name);
CREATE INDEX IF NOT EXISTS idx_collaborators_is_active ON collaborators(is_active);

-- Trigger pour updated_at
CREATE TRIGGER update_collaborators_updated_at 
  BEFORE UPDATE ON collaborators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer les collaborateurs existants
INSERT INTO collaborators (first_name, last_name) VALUES
('AÏSSA', 'ABDI Djanet'),
('AKLI', 'Mouad'),
('BEL MAHI', 'Asmae'),
('BERNADOU', 'Benoît'),
('BOISSET', 'Ingrid'),
('BOYER', 'Mathilde'),
('CAGNASSO', 'Marie'),
('CANO', 'Yann'),
('CARDENAS', 'Lionel'),
('CASAMAYOR', 'Emmanuelle'),
('CHAUHAN', 'Mrugesh'),
('FOERSTER', 'Klaus'),
('FUSILIER', 'Sébastien'),
('GRENIER', 'Célestin'),
('GUENANE', 'Ilham'),
('GUFFROY', 'Marina'),
('KOUANDJI BEKOUMB', 'Ginette'),
('LABAT LABOURDETTE', 'Emma'),
('LAHLOU', 'Lysiane'),
('LAJUS', 'Jonathan'),
('LAYMAJOUX', 'Quentin'),
('LE GUELVOUIT', 'Alexandre'),
('LE TULLIER', 'Octave'),
('LEGOUX', 'Vincent'),
('MARTINET', 'Alexandre'),
('MHENNI', 'Hassene'),
('MONNIER', 'Nicolas'),
('REGHEM', 'Romain'),
('RIVIERE', 'Chloé'),
('ROUX', 'Alexis'),
('SICARD', 'Emmanuel'),
('SICARD', 'Matthieu'),
('THAUVOYE', 'Olivier'),
('TORDJEMAN', 'Julia'),
('YEH', 'Katherine')
ON CONFLICT (full_name) DO NOTHING;

-- Désactiver RLS pour le développement
ALTER TABLE collaborators DISABLE ROW LEVEL SECURITY;

-- Message de confirmation
SELECT 'Table des collaborateurs créée avec succès!' as message;
