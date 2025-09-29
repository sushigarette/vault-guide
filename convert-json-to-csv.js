// Script pour convertir votre JSON en CSV utilisable
// Exécutez avec: node convert-json-to-csv.js

const fs = require('fs');

// Votre JSON (remplacez par le contenu de votre fichier)
const jsonData = [
  {
    "entrée par": "ib",
    "CLIENT": "MHCOMM",
    "N° DE SERIE": "0B3337H214733F",
    "MARQUE": "MICROSOFT",
    "MODELE": "SURFACE GO3",
    "LOCATION CLT / VENTE CLT": null,
    "ECHEANCE FINANCEMENT LIXXBAIL": null,
    "GESTION CARTE SIM": null,
    "N° CARTE SIM (Vincent)": null,
    "N° CARTE SIM (Orange)": null,
    "N° CARTE SIM (Vincent-Auto)": null,
    "Etat SIM": null,
    "DATE DEBUT GARANTIE": "10/12/24",
    "DUREE GARANTIE EN ANNEE": "1",
    "DATE RECEPT°": "15/01/25",
    "CLAVIER\n(0=non / 1=oui)": 1.0,
    "STYLET OFFICIEL\n(1=oui)": 1.0,
    "STYLET COMPATIBLE\n(1=oui)": null,
    "SACOCHE": 1.0,
    "AUTRES": null,
    "DATE EXPEDIT°": null,
    "TRANSPORTEUR": null,
    "N° ENVOI": null,
    "Rebut": null,
    "Problème en cours": null,
    "Historique Affectations Clientes": null,
    "Remarques": null
  }
];

// Fonction pour nettoyer les valeurs
function cleanValue(value) {
  if (value === null || value === undefined || value === 'NaN' || (typeof value === 'number' && isNaN(value))) {
    return '';
  }
  return String(value);
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

// Convertir en format CSV
function convertToCSV(data) {
  const csvRows = [];
  
  // En-têtes
  const headers = [
    'nom', 'sku', 'prix', 'quantité', 'catégorie', 'description', 'numéro de série',
    'code-barres', 'fournisseur', 'emplacement', 'client', 'marque', 'modèle', 'date_réception',
    'date_expédition', 'transporteur', 'n°_envoi', 'date_début_garantie', 'durée_garantie_années',
    'rebut', 'problème_en_cours', 'historique_affectations', 'remarques', 'statut',
    'référence_carte_sim', 'opérateur', 'location_ou_vente', 'stylet_officiel', 'stylet_compatible',
    'clavier', 'sacoche', 'modèle_tablette', 'échéance_financement', 'gestion_carte_sim'
  ];
  
  csvRows.push(headers.join(','));
  
  // Données
  data.forEach(row => {
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
      `${brand} ${name}`.trim(), // nom
      sku, // sku
      '299.99', // prix (par défaut)
      '1', // quantité (par défaut)
      category, // catégorie
      cleanValue(row['AUTRES']), // description
      sku, // numéro de série
      '', // code-barres
      cleanValue(row['entrée par']), // fournisseur
      '', // emplacement
      client, // client
      brand, // marque
      model, // modèle
      parseDate(cleanValue(row['DATE RECEPT°'])), // date_réception
      parseDate(cleanValue(row['DATE EXPEDIT°'])), // date_expédition
      cleanValue(row['TRANSPORTEUR']), // transporteur
      cleanValue(row['N° ENVOI']), // n°_envoi
      parseDate(cleanValue(row['DATE DEBUT GARANTIE'])), // date_début_garantie
      cleanValue(row['DUREE GARANTIE EN ANNEE']), // durée_garantie_années
      parseBoolean(row['Rebut']) ? 'true' : 'false', // rebut
      parseBoolean(row['Problème en cours']) ? 'true' : 'false', // problème_en_cours
      cleanValue(row['Historique Affectations Clientes']), // historique_affectations
      cleanValue(row['Remarques']), // remarques
      'en-stock', // statut
      cleanValue(row['N° CARTE SIM (Vincent)'] || row['N° CARTE SIM (Orange)'] || row['N° CARTE SIM (Vincent-Auto)']), // référence_carte_sim
      cleanValue(row['GESTION CARTE SIM']).toLowerCase().includes('orange') ? 'orange' : 
        cleanValue(row['GESTION CARTE SIM']).toLowerCase().includes('hapysim') ? 'hapysim' : '', // opérateur
      cleanValue(row['LOCATION CLT / VENTE CLT']).toLowerCase().includes('location') ? 'location' : 
        cleanValue(row['LOCATION CLT / VENTE CLT']).toLowerCase().includes('vente') ? 'vente' : '', // location_ou_vente
      parseBoolean(row['STYLET OFFICIEL\n(1=oui)']) ? 'true' : 'false', // stylet_officiel
      parseBoolean(row['STYLET COMPATIBLE\n(1=oui)']) ? 'true' : 'false', // stylet_compatible
      parseBoolean(row['CLAVIER\n(0=non / 1=oui)']) ? 'true' : 'false', // clavier
      parseBoolean(row['SACOCHE']) ? 'true' : 'false', // sacoche
      model, // modèle_tablette
      parseDate(cleanValue(row['ECHEANCE FINANCEMENT LIXXBAIL'])), // échéance_financement
      cleanValue(row['GESTION CARTE SIM']) // gestion_carte_sim
    ];
    
    csvRows.push(csvRow.map(field => `"${field}"`).join(','));
  });
  
  return csvRows.join('\n');
}

// Convertir et sauvegarder
const csvContent = convertToCSV(jsonData);
fs.writeFileSync('converted-data.csv', csvContent, 'utf8');

console.log('✅ Conversion terminée ! Fichier créé: converted-data.csv');
console.log('📊 Nombre d\'enregistrements:', jsonData.length);
console.log('📁 Vous pouvez maintenant importer converted-data.csv dans votre système de stock');
