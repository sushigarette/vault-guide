// Script pour convertir votre JSON en CSV
// Utilisation: node json-to-csv-converter.js

import fs from 'fs';

// Fonction pour nettoyer les valeurs
function cleanValue(value) {
  if (value === null || value === undefined || value === 'NaN') return '';
  return String(value).replace(/"/g, '""'); // Échapper les guillemets
}

// Fonction pour convertir les dates
function parseDate(dateStr) {
  if (!dateStr || dateStr === 'NaN') return '';
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      let year = parts[2];
      if (year.length === 2) {
        const yearNum = parseInt(year);
        year = yearNum > 50 ? `19${year}` : `20${year}`;
      }
      return `${year}-${month}-${day}`;
    }
  }
  return dateStr;
}

// Fonction pour convertir les booléens
function parseBoolean(value) {
  if (value === null || value === undefined || value === 'NaN') return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'oui';
  }
  return false;
}

try {
  // Lire le fichier JSON
  const jsonFile = 'your-file.json'; // Remplacez par votre fichier
  const csvFile = 'converted-data.csv';
  
  let content = fs.readFileSync(jsonFile, 'utf8');
  
  // Nettoyer le contenu
  content = content
    .replace(/'/g, '"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
  
  if (!content.startsWith('[')) {
    content = '[' + content + ']';
  }
  
  const data = JSON.parse(content);
  
  console.log(`📊 Conversion de ${data.length} enregistrements...`);
  
  // En-têtes CSV
  const headers = [
    'nom', 'sku', 'prix', 'quantité', 'catégorie', 'description', 'numéro de série',
    'code-barres', 'fournisseur', 'emplacement', 'client', 'marque', 'modèle', 'date_réception',
    'date_expédition', 'transporteur', 'n°_envoi', 'date_début_garantie', 'durée_garantie_années',
    'rebut', 'problème_en_cours', 'historique_affectations', 'remarques', 'statut',
    'référence_carte_sim', 'opérateur', 'location_ou_vente', 'stylet_officiel', 'stylet_compatible',
    'clavier', 'sacoche', 'modèle_tablette', 'échéance_financement', 'gestion_carte_sim'
  ];
  
  const csvRows = [headers.join(',')];
  
  // Convertir chaque objet
  data.forEach((row, index) => {
    try {
      const model = cleanValue(row['MODELE']);
      const name = cleanValue(row['MODELE']);
      const brand = cleanValue(row['MARQUE']);
      const sku = cleanValue(row['N° DE SERIE']);
      const client = cleanValue(row['CLIENT']);
      
      // Déterminer la catégorie
      let category = 'Informatique';
      if (name.toLowerCase().includes('surface') || name.toLowerCase().includes('tablette')) {
        category = 'Tablette';
      }
      
      const csvRow = [
        `"${brand} ${name}".trim()`, // nom
        `"${sku}"`, // sku
        '299.99', // prix (par défaut)
        '1', // quantité (par défaut)
        `"${category}"`, // catégorie
        `"${cleanValue(row['AUTRES'])}"`, // description
        `"${sku}"`, // numéro de série
        '""', // code-barres
        `"${cleanValue(row['entrée par'])}"`, // fournisseur
        '""', // emplacement
        `"${client}"`, // client
        `"${brand}"`, // marque
        `"${model}"`, // modèle
        `"${parseDate(cleanValue(row['DATE RECEPT°']))}"`, // date_réception
        `"${parseDate(cleanValue(row['DATE EXPEDIT°']))}"`, // date_expédition
        `"${cleanValue(row['TRANSPORTEUR'])}"`, // transporteur
        `"${cleanValue(row['N° ENVOI'])}"`, // n°_envoi
        `"${parseDate(cleanValue(row['DATE DEBUT GARANTIE']))}"`, // date_début_garantie
        `"${cleanValue(row['DUREE GARANTIE EN ANNEE'])}"`, // durée_garantie_années
        parseBoolean(row['Rebut']) ? 'true' : 'false', // rebut
        parseBoolean(row['Problème en cours']) ? 'true' : 'false', // problème_en_cours
        `"${cleanValue(row['Historique Affectations Clientes'])}"`, // historique_affectations
        `"${cleanValue(row['Remarques'])}"`, // remarques
        'en-stock', // statut
        `"${cleanValue(row['N° CARTE SIM (Vincent)'] || row['N° CARTE SIM (Orange)'] || row['N° CARTE SIM (Vincent-Auto)'])}"`, // référence_carte_sim
        cleanValue(row['GESTION CARTE SIM']).toLowerCase().includes('orange') ? 'orange' : 
          cleanValue(row['GESTION CARTE SIM']).toLowerCase().includes('hapysim') ? 'hapysim' : '', // opérateur
        cleanValue(row['LOCATION CLT / VENTE CLT']).toLowerCase().includes('location') ? 'location' : 
          cleanValue(row['LOCATION CLT / VENTE CLT']).toLowerCase().includes('vente') ? 'vente' : '', // location_ou_vente
        parseBoolean(row['STYLET OFFICIEL\n(1=oui)']) ? 'true' : 'false', // stylet_officiel
        parseBoolean(row['STYLET COMPATIBLE\n(1=oui)']) ? 'true' : 'false', // stylet_compatible
        parseBoolean(row['CLAVIER\n(0=non / 1=oui)']) ? 'true' : 'false', // clavier
        parseBoolean(row['SACOCHE']) ? 'true' : 'false', // sacoche
        `"${model}"`, // modèle_tablette
        `"${parseDate(cleanValue(row['ECHEANCE FINANCEMENT LIXXBAIL']))}"`, // échéance_financement
        `"${cleanValue(row['GESTION CARTE SIM'])}"` // gestion_carte_sim
      ];
      
      csvRows.push(csvRow.join(','));
      
    } catch (rowError) {
      console.error(`❌ Erreur ligne ${index + 1}:`, rowError.message);
    }
  });
  
  // Sauvegarder le CSV
  fs.writeFileSync(csvFile, csvRows.join('\n'), 'utf8');
  
  console.log(`✅ Conversion terminée !`);
  console.log(`📁 Fichier CSV créé: ${csvFile}`);
  console.log(`📊 ${data.length} enregistrements convertis`);
  console.log(`🚀 Vous pouvez maintenant importer ${csvFile}`);
  
} catch (error) {
  console.error('❌ Erreur lors de la conversion:', error.message);
  console.log('💡 Vérifiez que votre fichier JSON est valide');
}
