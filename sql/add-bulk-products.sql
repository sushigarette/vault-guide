-- Script SQL pour ajouter des produits en masse
-- 25 produits: Station HDMI Novoo FRSP7CHABEI
-- 25 produits: Chargeur universel
-- Date d'achat: 24/04/2025

-- 25 produits Station HDMI Novoo
INSERT INTO products (
  serial_number,
  brand,
  model,
  equipment_type,
  status,
  entry_date,
  invoice_number,
  purchase_price_ht,
  quantity,
  current_quantity,
  created_at,
  updated_at
)
SELECT 
  'STATION-HDMI-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || row_number() OVER () || '-' || (random() * 1000000)::int as serial_number,
  'Novoo' as brand,
  'Station HDMI' as model,
  'station_ecrans' as equipment_type,
  'EN_STOCK' as status,
  '2025-04-24'::date as entry_date,
  'FRSP7CHABEI' as invoice_number,
  21.95 as purchase_price_ht,
  1 as quantity,
  1 as current_quantity,
  NOW() as created_at,
  NOW() as updated_at
FROM generate_series(1, 25);

-- 25 produits Chargeur universel
INSERT INTO products (
  serial_number,
  brand,
  model,
  equipment_type,
  status,
  entry_date,
  invoice_number,
  purchase_price_ht,
  quantity,
  current_quantity,
  created_at,
  updated_at
)
SELECT 
  'CHARG-UNIV-' || EXTRACT(EPOCH FROM NOW())::bigint || '-' || row_number() OVER () || '-' || (random() * 1000000)::int as serial_number,
  '' as brand,
  'Chargeur universel' as model,
  'chargeur_universel' as equipment_type,
  'EN_STOCK' as status,
  '2025-04-24'::date as entry_date,
  'FRSP7CHABEI' as invoice_number,
  23.64 as purchase_price_ht,
  1 as quantity,
  1 as current_quantity,
  NOW() as created_at,
  NOW() as updated_at
FROM generate_series(1, 25);

-- Vérification
SELECT 
  equipment_type,
  COUNT(*) as nombre_produits,
  SUM(purchase_price_ht) as prix_total_ht,
  invoice_number
FROM products
WHERE entry_date = '2025-04-24'
  AND (
    (model = 'Station HDMI' AND brand = 'Novoo')
    OR model = 'Chargeur universel'
  )
GROUP BY equipment_type, invoice_number
ORDER BY equipment_type;
