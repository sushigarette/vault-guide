import fs from 'fs';

// Lire le fichier JSON nettoyé
const cleanedData = JSON.parse(fs.readFileSync('cleaned-data.json', 'utf8'));

console.log(`📊 Analyse des données nettoyées: ${cleanedData.length} entrées`);

// Analyser les données par critères
const analysis = {
  withSerialNumber: 0,
  withBrand: 0,
  withModel: 0,
  withEquipmentType: 0,
  withSupplier: 0,
  withPrice: 0,
  withAssignment: 0,
  validProducts: 0,
  emptyProducts: 0
};

const sampleData = [];

cleanedData.forEach((item, index) => {
  // Compter les critères
  if (item['N° DE SERIE']) analysis.withSerialNumber++;
  if (item['MARQUE']) analysis.withBrand++;
  if (item['MODELE']) analysis.withModel++;
  if (item['TYPE DE MATERIEL']) analysis.withEquipmentType++;
  if (item['FOURNISSEUR']) analysis.withSupplier++;
  if (item['PRIX ACHAT HT'] && item['PRIX ACHAT HT'] !== '0') analysis.withPrice++;
  if (item['AFFECTATION']) analysis.withAssignment++;
  
  // Vérifier si c'est un produit valide (a au moins marque + modèle)
  if (item['MARQUE'] && item['MODELE']) {
    analysis.validProducts++;
    if (sampleData.length < 10) {
      sampleData.push({
        index,
        serial: item['N° DE SERIE'],
        brand: item['MARQUE'],
        model: item['MODELE'],
        type: item['TYPE DE MATERIEL'],
        price: item['PRIX ACHAT HT']
      });
    }
  } else {
    analysis.emptyProducts++;
  }
});

console.log('\n📈 Analyse des critères:');
console.log(`  • Avec numéro de série: ${analysis.withSerialNumber}`);
console.log(`  • Avec marque: ${analysis.withBrand}`);
console.log(`  • Avec modèle: ${analysis.withModel}`);
console.log(`  • Avec type de matériel: ${analysis.withEquipmentType}`);
console.log(`  • Avec fournisseur: ${analysis.withSupplier}`);
console.log(`  • Avec prix: ${analysis.withPrice}`);
console.log(`  • Avec affectation: ${analysis.withAssignment}`);
console.log(`  • Produits valides (marque + modèle): ${analysis.validProducts}`);
console.log(`  • Produits vides: ${analysis.emptyProducts}`);

console.log('\n🔍 Échantillon de données valides:');
sampleData.forEach(item => {
  console.log(`  ${item.index}: ${item.brand} ${item.model} (${item.serial}) - ${item.type} - ${item.price}€`);
});

// Filtrer seulement les produits vraiment valides
const validProducts = cleanedData.filter(item => 
  item['MARQUE'] && 
  item['MODELE'] && 
  item['MARQUE'] !== '' && 
  item['MODELE'] !== ''
);

console.log(`\n✅ Produits vraiment valides: ${validProducts.length}`);

// Sauvegarder les produits valides
fs.writeFileSync('valid-products.json', JSON.stringify(validProducts, null, 2));

console.log('💾 Fichier des produits valides sauvegardé: valid-products.json');


