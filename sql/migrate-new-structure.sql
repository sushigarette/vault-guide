-- Migration vers la nouvelle structure
-- Ajoute les nouveaux champs et met à jour les types de matériel

-- 1. Ajouter les nouveaux champs
ALTER TABLE products ADD COLUMN IF NOT EXISTS usage_duration_months INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS reevaluation_date DATE;

-- 2. Mettre à jour la contrainte du champ equipment_type avec les nouvelles catégories
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_equipment_type_check;
ALTER TABLE products ADD CONSTRAINT products_equipment_type_check 
CHECK (equipment_type IN (
  'accessoires',
  'borne_wifi',
  'casque_audio',
  'chargeur_tel',
  'chargeur_universel',
  'ecran_pc',
  'ecran_tv',
  'imprimante',
  'kit_clavier_souris',
  'visioconf',
  'mobilier',
  'uc',
  'pc_portable',
  'routeur',
  'sacoche',
  'station_accueil',
  'station_ecrans',
  'tel_mobile',
  'webcam'
));

-- 3. Nettoyer toutes les données existantes
DELETE FROM stock_movements;
DELETE FROM products;
DELETE FROM collaborators;

-- 4. Réinitialiser les séquences si nécessaire
-- (Les IDs UUID ne nécessitent pas de réinitialisation)

-- 5. Vérifier que tout est propre
SELECT 
  'products' as table_name, 
  COUNT(*) as count 
FROM products
UNION ALL
SELECT 
  'collaborators' as table_name, 
  COUNT(*) as count 
FROM collaborators
UNION ALL
SELECT 
  'stock_movements' as table_name, 
  COUNT(*) as count 
FROM stock_movements;

-- Message de confirmation
SELECT 'Migration terminée - Base de données nettoyée et prête pour les nouvelles données!' as status;

