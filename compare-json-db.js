import fs from 'fs';

// Lire le fichier JSON
const jsonData = JSON.parse(fs.readFileSync('template_import_cleaned_final.json', 'utf8'));

console.log('📄 Analyse du fichier JSON:');
console.log(`Total produits: ${jsonData.length}`);

// Analyser les produits par type
const productsWithSerial = jsonData.filter(item => item['N° DE SERIE'] && item['N° DE SERIE'].trim() !== '');
const productsWithoutSerial = jsonData.filter(item => !item['N° DE SERIE'] || item['N° DE SERIE'].trim() === '');

console.log(`✅ Avec numéro de série: ${productsWithSerial.length}`);
console.log(`❌ Sans numéro de série: ${productsWithoutSerial.length}`);

// Analyser les marques des produits sans serial
const brandsWithoutSerial = {};
productsWithoutSerial.forEach(item => {
  const brand = item['MARQUE'] || 'INCONNU';
  brandsWithoutSerial[brand] = (brandsWithoutSerial[brand] || 0) + 1;
});

console.log('\n🏷️  Marques des produits sans numéro de série:');
Object.entries(brandsWithoutSerial).forEach(([brand, count]) => {
  console.log(`  • ${brand}: ${count} produits`);
});

// Analyser les modèles des produits sans serial
const modelsWithoutSerial = {};
productsWithoutSerial.forEach(item => {
  const model = item['MODELE'] || 'INCONNU';
  modelsWithoutSerial[model] = (modelsWithoutSerial[model] || 0) + 1;
});

console.log('\n📱 Modèles des produits sans numéro de série:');
Object.entries(modelsWithoutSerial).forEach(([model, count]) => {
  console.log(`  • ${model}: ${count} produits`);
});

// Identifier les produits potentiellement problématiques
console.log('\n🔍 Produits potentiellement problématiques:');
const problematicProducts = jsonData.filter(item => {
  const hasSerial = item['N° DE SERIE'] && item['N° DE SERIE'].trim() !== '';
  const hasBrand = item['MARQUE'] && item['MARQUE'].trim() !== '';
  const hasModel = item['MODELE'] && item['MODELE'].trim() !== '';
  const hasPrice = item['PRIX ACHAT HT'] && parseFloat(item['PRIX ACHAT HT']) > 0;
  
  // Produit problématique si pas de serial ET (pas de prix OU prix = 0)
  return !hasSerial && (!hasPrice || parseFloat(item['PRIX ACHAT HT']) === 0);
});

console.log(`🚨 Produits sans serial ET sans prix: ${problematicProducts.length}`);

if (problematicProducts.length > 0) {
  console.log('\nExemples de produits problématiques:');
  problematicProducts.slice(0, 5).forEach((item, index) => {
    console.log(`  ${index + 1}. ${item['MARQUE']} ${item['MODELE']} - Prix: ${item['PRIX ACHAT HT']}€`);
  });
}

// Calculer le total attendu
const expectedTotal = jsonData.length;
const actualTotal = 93;
const missing = expectedTotal - actualTotal;

console.log(`\n📊 Résumé:`);
console.log(`• Produits attendus: ${expectedTotal}`);
console.log(`• Produits en base: ${actualTotal}`);
console.log(`• Produits manquants: ${missing}`);
console.log(`• Produits sans serial: ${productsWithoutSerial.length}`);
console.log(`• Produits problématiques: ${problematicProducts.length}`);

if (missing === productsWithoutSerial.length) {
  console.log('\n💡 HYPOTHÈSE: Les produits sans numéro de série ne sont pas importés correctement');
} else if (missing === problematicProducts.length) {
  console.log('\n💡 HYPOTHÈSE: Les produits sans prix ne sont pas importés correctement');
} else {
  console.log('\n💡 HYPOTHÈSE: Problème de déduplication ou de contraintes de base de données');
}


