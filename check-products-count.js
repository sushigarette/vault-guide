import { createClient } from '@supabase/supabase-js';

// Variables d'environnement (remplacez par vos vraies valeurs)
const supabaseUrl = 'https://your-project.supabase.co'; // Remplacez par votre URL
const supabaseKey = 'your-anon-key'; // Remplacez par votre clé

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProductsCount() {
  try {
    console.log('🔍 Vérification du nombre de produits en base...');
    
    // Compter tous les produits
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erreur lors du comptage:', error);
      return;
    }
    
    console.log(`📊 Nombre total de produits en base: ${count}`);
    
    // Vérifier les 10 premiers produits
    const { data: sampleProducts, error: sampleError } = await supabase
      .from('products')
      .select('id, name, sku, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (sampleError) {
      console.error('❌ Erreur lors de la récupération des échantillons:', sampleError);
      return;
    }
    
    console.log('\n📋 Échantillon des 10 premiers produits:');
    sampleProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (SKU: ${product.sku}) - ${product.created_at}`);
    });
    
  } catch (err) {
    console.error('❌ Erreur générale:', err);
  }
}

checkProductsCount();