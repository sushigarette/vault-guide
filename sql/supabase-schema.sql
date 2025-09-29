-- Script SQL pour créer le schéma de base de données Supabase
-- Système de gestion de stock

-- Extension pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des catégories (optionnelle, pour normaliser les catégories)
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des fournisseurs (optionnelle, pour normaliser les fournisseurs)
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des produits
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    sku VARCHAR(255) UNIQUE NOT NULL,
    serial_number VARCHAR(255),
    barcode VARCHAR(255),
    qr_code TEXT,
    supplier VARCHAR(255),
    location VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'en-stock' CHECK (status IN ('en-stock', 'sav', 'vente', 'en-utilisation', 'hs')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les recherches
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_serial_number ON products(serial_number);

-- Table des mouvements de stock
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('in', 'out', 'adjustment', 'sale', 'return')),
    quantity INTEGER NOT NULL,
    reference VARCHAR(255),
    supplier VARCHAR(255),
    cost DECIMAL(10,2),
    reason TEXT,
    user_id UUID REFERENCES users(id),
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes sur les mouvements
CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(type);
CREATE INDEX idx_stock_movements_date ON stock_movements(date);
CREATE INDEX idx_stock_movements_user_id ON stock_movements(user_id);

-- Table des imports (pour tracer les imports de produits)
CREATE TABLE imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    total_products INTEGER NOT NULL,
    successful_imports INTEGER NOT NULL,
    failed_imports INTEGER NOT NULL,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer les statistiques de stock
CREATE OR REPLACE FUNCTION get_stock_stats()
RETURNS TABLE (
    total_products BIGINT,
    low_stock_alerts BIGINT,
    total_value DECIMAL,
    recent_movements BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_products,
        COUNT(*) FILTER (WHERE status IN ('sav', 'hs')) as low_stock_alerts,
        COALESCE(SUM(quantity * price), 0) as total_value,
        (
            SELECT COUNT(*) 
            FROM stock_movements 
            WHERE date >= NOW() - INTERVAL '7 days'
        ) as recent_movements
    FROM products;
END;
$$ LANGUAGE plpgsql;

-- Vue pour les statistiques de stock par statut
CREATE VIEW stock_status_stats AS
SELECT 
    status,
    COUNT(*) as count,
    SUM(quantity * price) as total_value
FROM products
GROUP BY status;

-- Vue pour les mouvements récents avec détails du produit
CREATE VIEW recent_movements_with_details AS
SELECT 
    sm.id,
    sm.type,
    sm.quantity,
    sm.date,
    sm.reference,
    sm.supplier,
    sm.cost,
    p.name as product_name,
    p.sku,
    u.name as user_name
FROM stock_movements sm
LEFT JOIN products p ON sm.product_id = p.id
LEFT JOIN users u ON sm.user_id = u.id
ORDER BY sm.date DESC;

-- Insertion de données de test (optionnel)
-- Vous pouvez supprimer cette section si vous ne voulez pas de données de test

-- Utilisateur par défaut
INSERT INTO users (id, name, email, role) VALUES 
('00000000-0000-0000-0000-000000000001', 'Administrateur', 'admin@example.com', 'admin'),
('00000000-0000-0000-0000-000000000002', 'Utilisateur Test', 'user@example.com', 'user');

-- Catégories par défaut
INSERT INTO categories (name, description) VALUES 
('Informatique', 'Ordinateurs, serveurs, équipements informatiques'),
('Accessoires', 'Souris, claviers, câbles, etc.'),
('Écrans', 'Moniteurs, écrans, projecteurs'),
('Périphériques', 'Imprimantes, scanners, etc.'),
('Logiciels', 'Licences logicielles'),
('Mobilier', 'Bureaux, chaises, rangements'),
('Autre', 'Autres équipements');

-- Fournisseurs par défaut
INSERT INTO suppliers (name, contact_email, contact_phone) VALUES 
('Dell France', 'contact@dell.fr', '01 23 45 67 89'),
('Logitech', 'contact@logitech.com', '01 23 45 67 90'),
('Samsung', 'contact@samsung.fr', '01 23 45 67 91'),
('Fournisseur Générique', 'contact@fournisseur.com', '01 23 45 67 92');

-- Produits de test
INSERT INTO products (name, description, category, quantity, price, sku, serial_number, barcode, qr_code, supplier, location, status) VALUES 
('Ordinateur Portable Dell', 'Dell Inspiron 15 - 8GB RAM, 256GB SSD', 'Informatique', 25, 699.00, 'DELL-INS-15', 'SN-DELL-2024-001', 'BC12345678', 'http://localhost:8083/product/1', 'Dell France', 'A1-B2-C3', 'en-stock'),
('Souris Logitech MX', 'Souris sans fil ergonomique', 'Accessoires', 3, 79.00, 'LOG-MX-001', 'SN-LOG-2024-002', 'BC87654321', 'http://localhost:8083/product/2', 'Logitech', 'B1-C2-D3', 'sav'),
('Écran Samsung 24"', 'Moniteur Full HD 24 pouces', 'Écrans', 12, 199.00, 'SAM-24-FHD', 'SN-SAM-2024-003', 'BC11223344', 'http://localhost:8083/product/3', 'Samsung', 'C1-D2-E3', 'vente');

-- Mouvements de test
INSERT INTO stock_movements (product_id, type, quantity, reference, supplier, cost, user_id, date) VALUES 
((SELECT id FROM products WHERE sku = 'DELL-INS-15'), 'in', 30, 'REC-001', 'Dell France', 650.00, (SELECT id FROM users WHERE email = 'admin@example.com'), NOW() - INTERVAL '10 days'),
((SELECT id FROM products WHERE sku = 'DELL-INS-15'), 'out', 5, 'SALE-001', NULL, NULL, (SELECT id FROM users WHERE email = 'user@example.com'), NOW() - INTERVAL '5 days'),
((SELECT id FROM products WHERE sku = 'LOG-MX-001'), 'in', 10, 'REC-002', 'Logitech', 60.00, (SELECT id FROM users WHERE email = 'admin@example.com'), NOW() - INTERVAL '8 days'),
((SELECT id FROM products WHERE sku = 'LOG-MX-001'), 'out', 7, 'SALE-002', NULL, NULL, (SELECT id FROM users WHERE email = 'user@example.com'), NOW() - INTERVAL '3 days'),
((SELECT id FROM products WHERE sku = 'SAM-24-FHD'), 'in', 15, 'REC-003', 'Samsung', 180.00, (SELECT id FROM users WHERE email = 'admin@example.com'), NOW() - INTERVAL '6 days'),
((SELECT id FROM products WHERE sku = 'SAM-24-FHD'), 'out', 3, 'SALE-003', NULL, NULL, (SELECT id FROM users WHERE email = 'user@example.com'), NOW() - INTERVAL '2 days');

-- Politiques de sécurité RLS (Row Level Security)
-- Activez RLS sur les tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE imports ENABLE ROW LEVEL SECURITY;

-- Politiques pour les produits (tous les utilisateurs authentifiés peuvent lire/écrire)
CREATE POLICY "Enable all operations for authenticated users on products" ON products
    FOR ALL USING (auth.role() = 'authenticated');

-- Politiques pour les mouvements de stock
CREATE POLICY "Enable all operations for authenticated users on stock_movements" ON stock_movements
    FOR ALL USING (auth.role() = 'authenticated');

-- Politiques pour les utilisateurs (lecture pour tous, écriture pour les admins)
CREATE POLICY "Enable read access for authenticated users on users" ON users
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable write access for admins on users" ON users
    FOR ALL USING (auth.role() = 'authenticated' AND role = 'admin');

-- Politiques pour les imports
CREATE POLICY "Enable all operations for authenticated users on imports" ON imports
    FOR ALL USING (auth.role() = 'authenticated');

-- Commentaires sur les tables
COMMENT ON TABLE products IS 'Table des produits en stock';
COMMENT ON TABLE stock_movements IS 'Table des mouvements de stock (entrées, sorties, ajustements)';
COMMENT ON TABLE users IS 'Table des utilisateurs du système';
COMMENT ON TABLE categories IS 'Table des catégories de produits';
COMMENT ON TABLE suppliers IS 'Table des fournisseurs';
COMMENT ON TABLE imports IS 'Table des imports de produits';

-- Commentaires sur les colonnes importantes
COMMENT ON COLUMN products.status IS 'Statut du produit: en-stock, sav, vente, en-utilisation, hs';
COMMENT ON COLUMN stock_movements.type IS 'Type de mouvement: in, out, adjustment, sale, return';
COMMENT ON COLUMN stock_movements.quantity IS 'Quantité positive pour les entrées, négative pour les sorties';








