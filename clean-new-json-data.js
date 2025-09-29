import fs from 'fs';

// Lire le fichier JSON en gérant les valeurs NaN
let rawData;
try {
  const fileContent = fs.readFileSync('parc_machines.json', 'utf8');
  // Remplacer les valeurs NaN par null
  const cleanedContent = fileContent.replace(/:\s*NaN/g, ': null');
  rawData = JSON.parse(cleanedContent);
} catch (error) {
  console.error('Erreur lors de la lecture du fichier JSON:', error.message);
  process.exit(1);
}

console.log(`📊 Données brutes: ${rawData.length} entrées`);

// Fonction pour nettoyer et valider les données
function cleanAndValidateData(data) {
  const cleanedData = [];
  const seenSerialNumbers = new Set();
  
  for (const item of data) {
    // Ignorer les entrées complètement vides
    if (!item['N° DE SERIE'] && !item['MARQUE'] && !item['MODELE']) {
      continue;
    }
    
    // Ignorer les entrées avec des valeurs null partout
    const hasAnyValue = Object.values(item).some(value => 
      value !== null && value !== undefined && value !== '' && value !== '0' && value !== 0
    );
    
    if (!hasAnyValue) {
      continue;
    }
    
    // Mapper les nouveaux champs vers l'ancien format
    const cleanedItem = {
      'N° DE SERIE': item['N° DE SERIE'] || '',
      'MARQUE': item['MARQUE'] || '',
      'MODELE': item['MODELE'] || '',
      'TYPE DE MATERIEL': null, // Pas de champ correspondant dans le nouveau format
      'STATUT': 'EN_STOCK', // Valeur par défaut
      'AFFECTATION': null, // Pas de champ correspondant
      'DUREE UTILISATION ANNEE': item['DUREE GARANTIE EN ANNEE'] || null,
      'DATE RECEPTION': item['DATE RECEPT°'] || null,
      'FOURNISSEUR': null, // Pas de champ correspondant
      'N° FACTURE': null, // Pas de champ correspondant
      'QUANTITE': 1, // Valeur par défaut
      'PRIX ACHAT HT': null, // Pas de champ correspondant
      'MONTANT TOTAL': null, // Pas de champ correspondant
      'DATE SORTIE': null,
      'QUANTITE SORTIE': null,
      'PRIX UNITAIRE SORTIE HT': null,
      'MONTANT SORTIE': null,
      'QUANTITE ACTUELLE': 1, // Valeur par défaut
      'VALEUR ACTUELLE': null, // Pas de champ correspondant
      'COMMENTAIRES': item['Remarques'] || null
    };
    
    // Vérifier les doublons par numéro de série
    const serialNumber = cleanedItem['N° DE SERIE'];
    if (serialNumber && seenSerialNumbers.has(serialNumber)) {
      console.log(`⚠️  Doublon ignoré: ${serialNumber}`);
      continue;
    }
    
    if (serialNumber) {
      seenSerialNumbers.add(serialNumber);
    }
    
    // Vérifier que l'entrée a au moins un identifiant valide
    if (serialNumber || cleanedItem['MARQUE'] || cleanedItem['MODELE']) {
      cleanedData.push(cleanedItem);
    }
  }
  
  return cleanedData;
}

// Nettoyer les données
const cleanedData = cleanAndValidateData(rawData);

console.log(`✅ Données nettoyées: ${cleanedData.length} entrées valides`);

// Analyser les marques
const brands = {};
const models = {};

cleanedData.forEach(item => {
  // Marques
  if (item['MARQUE']) {
    brands[item['MARQUE']] = (brands[item['MARQUE']] || 0) + 1;
  }
  
  // Modèles
  if (item['MODELE']) {
    models[item['MODELE']] = (models[item['MODELE']] || 0) + 1;
  }
});

console.log('\n🏷️  Marques trouvées:');
Object.entries(brands).forEach(([brand, count]) => {
  console.log(`  • ${brand}: ${count} produits`);
});

console.log('\n📱 Modèles trouvés:');
Object.entries(models).forEach(([model, count]) => {
  console.log(`  • ${model}: ${count} produits`);
});

// Sauvegarder les données nettoyées
fs.writeFileSync('cleaned-data.json', JSON.stringify(cleanedData, null, 2));

console.log('\n💾 Fichier nettoyé sauvegardé: cleaned-data.json');
console.log(`📊 Résumé: ${cleanedData.length} produits valides prêts pour l'import`);

// Afficher un échantillon
console.log('\n🔍 Échantillon des données:');
cleanedData.slice(0, 5).forEach((item, index) => {
  console.log(`  ${index + 1}. ${item['MARQUE']} ${item['MODELE']} (${item['N° DE SERIE']})`);
});


