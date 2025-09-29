import fs from 'fs';

// Lire les données nettoyées
const cleanedData = JSON.parse(fs.readFileSync('cleaned-data.json', 'utf8'));

console.log(`📊 Données disponibles: ${cleanedData.length} produits`);

// Extraire seulement les 56 premiers produits
const sampleData = cleanedData.slice(0, 56);

console.log(`✅ Échantillon extrait: ${sampleData.length} produits`);

// Sauvegarder l'échantillon
fs.writeFileSync('sample-data.json', JSON.stringify(sampleData, null, 2));

console.log('💾 Fichier échantillon sauvegardé: sample-data.json');

// Afficher la répartition par marque dans l'échantillon
const brands = {};
sampleData.forEach(item => {
  if (item['MARQUE']) {
    brands[item['MARQUE']] = (brands[item['MARQUE']] || 0) + 1;
  }
});

console.log('\n📊 Répartition par marque dans l\'échantillon:');
Object.entries(brands).forEach(([brand, count]) => {
  console.log(`  • ${brand}: ${count} produits`);
});

console.log('\n🔍 Échantillon complet:');
sampleData.forEach((item, index) => {
  console.log(`  ${index + 1}. ${item['MARQUE']} ${item['MODELE']} (${item['N° DE SERIE']})`);
});


