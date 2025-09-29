// Script pour tester l'import avec un petit échantillon
// Utilisation: node test-import.cjs

const fs = require('fs');

const jsonFile = 'cleaned-data.json';
const testFile = 'test-sample.json';

try {
  console.log('🔍 Lecture du fichier JSON...');
  const data = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));
  
  console.log(`📊 Fichier original: ${data.length} objets`);
  
  // Prendre seulement les 5 premiers objets pour tester
  const sample = data.slice(0, 5);
  
  console.log('🧪 Création d\'un échantillon de test...');
  
  // Nettoyer les données de l'échantillon
  const cleanedSample = sample.map(row => {
    // Fonction pour nettoyer les valeurs
    const cleanValue = (value) => {
      if (value === null || value === undefined || value === 'NaN') return '';
      return String(value);
    };

    // Fonction pour convertir les dates
    const parseDate = (dateStr) => {
      if (!dateStr || dateStr === 'NaN' || dateStr === 'null') return null;
      
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
          
          const dateStr = `${year}-${month}-${day}`;
          const date = new Date(dateStr);
          
          if (isNaN(date.getTime())) {
            console.warn(`Date invalide: ${dateStr}`);
            return null;
          }
          
          return dateStr;
        }
      }
      
      return null;
    };

    // Fonction pour convertir les booléens
    const parseBoolean = (value) => {
      if (value === null || value === undefined || value === 'NaN') return false;
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value === 1;
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'oui';
      }
      return false;
    };

    const model = cleanValue(row['MODELE']);
    const name = cleanValue(row['MODELE']);
    const brand = cleanValue(row['MARQUE']);
    const sku = cleanValue(row['N° DE SERIE']);
    const client = cleanValue(row['CLIENT']);
    
    let category = 'Informatique';
    if (name.toLowerCase().includes('surface') || name.toLowerCase().includes('tablette')) {
      category = 'Tablette';
    }

    return {
      name: `${brand} ${name}`.trim(),
      sku: sku,
      price: 299.99,
      quantity: 1,
      category: category,
      description: cleanValue(row['AUTRES']),
      serialNumber: sku,
      barcode: '',
      qrCode: '',
      supplier: cleanValue(row['entrée par']),
      location: '',
      client: client,
      brand: brand,
      model: model,
      receptionDate: parseDate(cleanValue(row['DATE RECEPT°'])),
      expeditionDate: parseDate(cleanValue(row['DATE EXPEDIT°'])),
      transporter: cleanValue(row['TRANSPORTEUR']),
      trackingNumber: cleanValue(row['N° ENVOI']),
      warrantyStartDate: parseDate(cleanValue(row['DATE DEBUT GARANTIE'])),
      warrantyDuration: parseInt(cleanValue(row['DUREE GARANTIE EN ANNEE'])) || 0,
      defect: parseBoolean(row['Rebut']),
      problemInProgress: parseBoolean(row['Problème en cours']),
      clientAssignmentHistory: cleanValue(row['Historique Affectations Clientes']),
      remarks: cleanValue(row['Remarques']),
      // Champs spécifiques aux tablettes
      simCardReference: cleanValue(row['N° CARTE SIM (Vincent)'] || row['N° CARTE SIM (Orange)'] || row['N° CARTE SIM (Vincent-Auto)']),
      operator: cleanValue(row['GESTION CARTE SIM']).toLowerCase().includes('orange') ? 'orange' : 
               cleanValue(row['GESTION CARTE SIM']).toLowerCase().includes('hapysim') ? 'hapysim' : undefined,
      locationOrSale: cleanValue(row['LOCATION CLT / VENTE CLT']).toLowerCase().includes('location') ? 'location' : 
                     cleanValue(row['LOCATION CLT / VENTE CLT']).toLowerCase().includes('vente') ? 'vente' : undefined,
      accessories: {
        stylus: parseBoolean(row['STYLET OFFICIEL\n(1=oui)'] || row['STYLET OFFICIEL']),
        stylusCompatible: parseBoolean(row['STYLET COMPATIBLE\n(1=oui)'] || row['STYLET COMPATIBLE']),
        keyboard: parseBoolean(row['CLAVIER\n(0=non / 1=oui)'] || row['CLAVIER']),
        case: parseBoolean(row['SACOCHE']),
      },
      tabletModel: model,
      financingExpiry: parseDate(cleanValue(row['ECHEANCE FINANCEMENT LIXXBAIL'])),
      simCardManagement: cleanValue(row['GESTION CARTE SIM']),
      status: 'en-stock',
    };
  });
  
  // Sauvegarder l'échantillon
  fs.writeFileSync(testFile, JSON.stringify(cleanedSample, null, 2), 'utf8');
  
  console.log(`✅ Échantillon de test créé: ${testFile}`);
  console.log(`📊 ${cleanedSample.length} objets dans l'échantillon`);
  console.log('🚀 Vous pouvez maintenant importer test-sample.json pour tester');
  
  // Afficher un exemple
  console.log('\n📋 Exemple d\'objet nettoyé:');
  console.log(JSON.stringify(cleanedSample[0], null, 2));
  
} catch (error) {
  console.error('❌ Erreur:', error.message);
}








