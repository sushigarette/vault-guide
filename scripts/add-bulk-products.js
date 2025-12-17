/**
 * Script pour ajouter des produits en masse
 * Usage: node scripts/add-bulk-products.js
 * 
 * Nécessite les variables d'environnement:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 * 
 * OU vous pouvez les définir directement dans ce fichier (temporairement)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Charger les variables d'environnement depuis .env si disponible
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let supabaseUrl, supabaseKey;

try {
  const envFile = readFileSync(join(__dirname, '..', '.env'), 'utf-8');
  const envVars = envFile.split('\n').reduce((acc, line) => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      acc[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
    return acc;
  }, {});
  
  supabaseUrl = envVars.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  supabaseKey = envVars.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
} catch (e) {
  // Si .env n'existe pas, utiliser les variables d'environnement système
  supabaseUrl = process.env.VITE_SUPABASE_URL;
  supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
}

// ⚠️ TEMPORAIRE: Définir ici vos clés Supabase si nécessaire
// supabaseUrl = 'VOTRE_URL_SUPABASE';
// supabaseKey = 'VOTRE_CLE_SUPABASE';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes!');
  console.error('Assurez-vous que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définies');
  console.error('Soit dans un fichier .env à la racine du projet,');
  console.error('soit comme variables d\'environnement système,');
  console.error('soit directement dans ce script (lignes commentées).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction pour générer un numéro de série unique
function generateSerialNumber(prefix, index) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${index}-${random}`;
}

// Fonction pour ajouter des produits en masse
async function addBulkProducts(products) {
  console.log(`\n📦 Ajout de ${products.length} produits...\n`);
  
  const productsToInsert = products.map((product, index) => ({
    serial_number: product.serialNumber || generateSerialNumber(product.prefix || 'PROD', index),
    brand: product.brand || null,
    model: product.model || null,
    equipment_type: product.equipmentType || null,
    status: product.status || 'EN_STOCK',
    assignment: product.assignment || null,
    entry_date: product.entryDate || null,
    supplier: product.supplier || null,
    invoice_number: product.invoiceNumber || null,
    purchase_price_ht: product.purchasePriceHt || null,
    usage_duration_months: product.usageDurationMonths || null,
    reevaluation_date: product.reevaluationDate || null,
    quantity: product.quantity || 1,
    current_quantity: product.currentQuantity || product.quantity || 1,
    comments: product.comments || null,
  }));

  // Insérer par lots de 100 pour éviter les limites
  const batchSize = 100;
  let totalInserted = 0;
  let totalErrors = 0;

  for (let i = 0; i < productsToInsert.length; i += batchSize) {
    const batch = productsToInsert.slice(i, i + batchSize);
    console.log(`  → Insertion du lot ${Math.floor(i / batchSize) + 1}/${Math.ceil(productsToInsert.length / batchSize)} (${batch.length} produits)...`);
    
    const { data, error } = await supabase
      .from('products')
      .insert(batch)
      .select();

    if (error) {
      console.error(`  ❌ Erreur lors de l'insertion du lot:`, error.message);
      totalErrors += batch.length;
    } else {
      totalInserted += data.length;
      console.log(`  ✅ ${data.length} produits ajoutés avec succès`);
    }
  }

  console.log(`\n📊 Résumé:`);
  console.log(`  ✅ Produits ajoutés: ${totalInserted}`);
  if (totalErrors > 0) {
    console.log(`  ❌ Erreurs: ${totalErrors}`);
  }
  
  return { totalInserted, totalErrors };
}

// Produits à ajouter
const productsToAdd = [
  // 25 produits Station HDMI Novoo FRSP7CHABEI
  ...Array.from({ length: 25 }, (_, i) => ({
    brand: 'Novoo',
    model: 'Station HDMI FRSP7CHABEI',
    equipmentType: 'station_ecrans',
    purchasePriceHt: 21.95,
    entryDate: '2025-04-24', // Format ISO: YYYY-MM-DD
    status: 'EN_STOCK',
    quantity: 1,
    currentQuantity: 1,
    prefix: 'STATION-HDMI',
  })),
  
  // 25 produits Chargeur universel
  ...Array.from({ length: 25 }, (_, i) => ({
    brand: null,
    model: 'Chargeur universel',
    equipmentType: 'chargeur_universel',
    purchasePriceHt: 23.64,
    entryDate: '2025-04-24', // Format ISO: YYYY-MM-DD
    status: 'EN_STOCK',
    quantity: 1,
    currentQuantity: 1,
    prefix: 'CHARG-UNIV',
  })),
];

// Exécuter le script
async function main() {
  console.log('🚀 Démarrage de l\'ajout en masse de produits...\n');
  console.log(`📋 Produits à ajouter:`);
  console.log(`  - 25x Station HDMI Novoo FRSP7CHABEI (21,95€ HT)`);
  console.log(`  - 25x Chargeur universel (23,64€ HT)`);
  console.log(`  Total: ${productsToAdd.length} produits\n`);

  try {
    const result = await addBulkProducts(productsToAdd);
    
    if (result.totalErrors === 0) {
      console.log('\n✅ Tous les produits ont été ajoutés avec succès!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Certains produits n\'ont pas pu être ajoutés.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  }
}

main();
