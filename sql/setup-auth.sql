-- Script pour configurer l'authentification dans Supabase
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Désactiver la vérification d'email (à faire dans l'interface Supabase)
-- Allez dans Authentication > Settings > Auth
-- Désactivez "Enable email confirmations"

-- 2. Activer RLS sur les tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE imports ENABLE ROW LEVEL SECURITY;

-- 3. Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Enable all operations for everyone on products" ON products;
DROP POLICY IF EXISTS "Enable all operations for everyone on stock_movements" ON stock_movements;
DROP POLICY IF EXISTS "Enable all operations for everyone on users" ON users;
DROP POLICY IF EXISTS "Enable all operations for everyone on imports" ON imports;

-- 4. Créer des politiques RLS pour les utilisateurs authentifiés
CREATE POLICY "Users can view all products" ON products
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert products" ON products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update products" ON products
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete products" ON products
    FOR DELETE USING (auth.role() = 'authenticated');

-- Politiques pour les mouvements de stock
CREATE POLICY "Users can view all stock movements" ON stock_movements
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert stock movements" ON stock_movements
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update stock movements" ON stock_movements
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete stock movements" ON stock_movements
    FOR DELETE USING (auth.role() = 'authenticated');

-- Politiques pour les utilisateurs
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Politiques pour les imports
CREATE POLICY "Users can view all imports" ON imports
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert imports" ON imports
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    new.email,
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger pour créer automatiquement un profil utilisateur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. Fonction pour obtenir l'utilisateur actuel
CREATE OR REPLACE FUNCTION public.get_current_user()
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  role text
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.name, u.email, u.role
  FROM public.users u
  WHERE u.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Données de test (optionnel)
INSERT INTO users (id, name, email, role) 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Administrateur', 'admin@example.com', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'Utilisateur Test', 'user@example.com', 'user')
ON CONFLICT (id) DO NOTHING;

-- 9. Produits de test (avec gestion des conflits sur SKU)
INSERT INTO products (id, name, description, category, quantity, price, sku, serial_number, barcode, qr_code, supplier, location, status) 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Ordinateur Portable Dell', 'Dell Inspiron 15 - 8GB RAM, 256GB SSD', 'Informatique', 25, 699.00, 'DELL-INS-15', 'SN-DELL-2024-001', 'BC12345678', 'http://localhost:8084/product/00000000-0000-0000-0000-000000000001', 'Dell France', 'A1-B2-C3', 'en-stock'),
  ('00000000-0000-0000-0000-000000000002', 'Souris Logitech MX', 'Souris sans fil ergonomique', 'Accessoires', 3, 79.00, 'LOG-MX-001', 'SN-LOG-2024-002', 'BC87654321', 'http://localhost:8084/product/00000000-0000-0000-0000-000000000002', 'Logitech', 'B1-C2-D3', 'sav'),
  ('00000000-0000-0000-0000-000000000003', 'Écran Samsung 24"', 'Moniteur Full HD 24 pouces', 'Écrans', 12, 199.00, 'SAM-24-FHD', 'SN-SAM-2024-003', 'BC11223344', 'http://localhost:8084/product/00000000-0000-0000-0000-000000000003', 'Samsung', 'C1-D2-E3', 'vente')
ON CONFLICT (sku) DO NOTHING;
