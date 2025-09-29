import fs from 'fs';

// Lire le fichier JSON
const data = JSON.parse(fs.readFileSync('template_import_filled_cleaned.json', 'utf8'));

console.log(`📊 Données brutes: ${data.length} entrées`);

// Filtrer les lignes vides
const cleanedData = data.filter(item => {
  // Une ligne est considérée comme vide si elle n'a pas de marque, modèle ou numéro de série
  const hasBrand = item['MARQUE'] && item['MARQUE'].trim() !== '';
  const hasModel = item['MODELE'] && item['MODELE'].trim() !== '';
  const hasSerial = item['N° DE SERIE'] && item['N° DE SERIE'].trim() !== '';
  
  return hasBrand || hasModel || hasSerial;
});

console.log(`✅ Données nettoyées: ${cleanedData.length} entrées valides`);
console.log(`🗑️  Lignes vides supprimées: ${data.length - cleanedData.length}`);

// Sauvegarder les données nettoyées
fs.writeFileSync('template_import_cleaned_final.json', JSON.stringify(cleanedData, null, 2));

console.log('\n💾 Fichier final sauvegardé: template_import_cleaned_final.json');

// Afficher un échantillon
console.log('\n🔍 Échantillon des données valides:');
cleanedData.slice(0, 5).forEach((item, index) => {
  console.log(`  ${index + 1}. ${item['MARQUE']} ${item['MODELE']} (${item['N° DE SERIE']})`);
});

// Analyser les marques
const brands = {};
cleanedData.forEach(item => {
  if (item['MARQUE']) {
    brands[item['MARQUE']] = (brands[item['MARQUE']] || 0) + 1;
  }
});

console.log('\n🏷️  Répartition par marque:');
Object.entries(brands).forEach(([brand, count]) => {
  console.log(`  • ${brand}: ${count} produits`);
});


