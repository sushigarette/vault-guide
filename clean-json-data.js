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
    
    // Nettoyer les données
    const cleanedItem = {
      'N° DE SERIE': item['N° DE SERIE'] || '',
      'MARQUE': item['MARQUE'] || '',
      'MODELE': item['MODELE'] || '',
      'TYPE DE MATERIEL': item['TYPE DE MATERIEL'] || null,
      'STATUT': item['STATUT'] || null,
      'AFFECTATION': item['AFFECTATION'] || null,
      'DUREE UTILISATION ANNEE': item['DUREE UTILISATION ANNEE'] || null,
      'DATE RECEPTION': item['DATE RECEPTION'] || null,
      'FOURNISSEUR': item['FOURNISSEUR'] || null,
      'N° FACTURE': item['N° FACTURE'] || null,
      'QUANTITE': item['QUANTITE'] || null,
      'PRIX ACHAT HT': item['PRIX ACHAT HT'] || null,
      'MONTANT TOTAL': item['MONTANT TOTAL'] || null,
      'DATE SORTIE': item['DATE SORTIE'] || null,
      'QUANTITE SORTIE': item['QUANTITE SORTIE'] || null,
      'PRIX UNITAIRE SORTIE HT': item['PRIX UNITAIRE SORTIE HT'] || null,
      'MONTANT SORTIE': item['MONTANT SORTIE'] || null,
      'QUANTITE ACTUELLE': item['QUANTITE ACTUELLE'] || null,
      'VALEUR ACTUELLE': item['VALEUR ACTUELLE'] || null,
      'COMMENTAIRES': item['COMMENTAIRES'] || null
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

// Analyser les types de matériel
const equipmentTypes = {};
const suppliers = {};
const brands = {};

cleanedData.forEach(item => {
  // Types de matériel
  if (item['TYPE DE MATERIEL']) {
    equipmentTypes[item['TYPE DE MATERIEL']] = (equipmentTypes[item['TYPE DE MATERIEL']] || 0) + 1;
  }
  
  // Fournisseurs
  if (item['FOURNISSEUR']) {
    suppliers[item['FOURNISSEUR']] = (suppliers[item['FOURNISSEUR']] || 0) + 1;
  }
  
  // Marques
  if (item['MARQUE']) {
    brands[item['MARQUE']] = (brands[item['MARQUE']] || 0) + 1;
  }
});

console.log('\n📋 Types de matériel trouvés:');
Object.entries(equipmentTypes).forEach(([type, count]) => {
  console.log(`  • ${type}: ${count} produits`);
});

console.log('\n🏢 Fournisseurs trouvés:');
Object.entries(suppliers).forEach(([supplier, count]) => {
  console.log(`  • ${supplier}: ${count} produits`);
});

console.log('\n🏷️  Marques trouvées:');
Object.entries(brands).forEach(([brand, count]) => {
  console.log(`  • ${brand}: ${count} produits`);
});

// Sauvegarder les données nettoyées
fs.writeFileSync('cleaned-data.json', JSON.stringify(cleanedData, null, 2));

console.log('\n💾 Fichier nettoyé sauvegardé: cleaned-data.json');
console.log(`📊 Résumé: ${cleanedData.length} produits valides prêts pour l'import`);