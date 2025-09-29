// Script pour corriger spécifiquement votre JSON avec NaN
// Utilisation: node fix-json.cjs

const fs = require('fs');

const jsonFile = 'parc_machines.json';
const outputFile = 'cleaned-data.json';

try {
  console.log('🔍 Lecture du fichier JSON...');
  let content = fs.readFileSync(jsonFile, 'utf8');
  
  console.log('🧹 Nettoyage des valeurs NaN...');
  
  // Remplacer toutes les occurrences de NaN par null
  content = content.replace(/NaN/g, 'null');
  
  console.log('✅ NaN remplacés par null');
  console.log('🔍 Validation du JSON...');
  
  // Parser pour valider
  const data = JSON.parse(content);
  
  console.log('✅ JSON valide !');
  console.log(`📊 Nombre d'objets: ${data.length}`);
  
  // Sauvegarder le fichier nettoyé
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf8');
  
  console.log(`💾 Fichier nettoyé sauvegardé: ${outputFile}`);
  console.log('🚀 Vous pouvez maintenant importer cleaned-data.json');
  
  // Afficher un exemple de l'objet nettoyé
  if (data.length > 0) {
    console.log('\n📋 Exemple d\'objet nettoyé:');
    console.log(JSON.stringify(data[0], null, 2));
  }
  
} catch (error) {
  console.error('❌ Erreur lors du nettoyage:', error.message);
  
  // Afficher plus de détails sur l'erreur
  try {
    const content = fs.readFileSync(jsonFile, 'utf8');
    const lines = content.split('\n');
    console.log('\n📋 Premières lignes du fichier:');
    lines.slice(0, 15).forEach((line, index) => {
      console.log(`${index + 1}: ${line}`);
    });
    
    // Chercher les NaN dans le fichier
    const nanMatches = content.match(/NaN/g);
    if (nanMatches) {
      console.log(`\n🔍 Trouvé ${nanMatches.length} occurrences de NaN`);
    }
    
  } catch (readError) {
    console.log('Impossible de lire le fichier');
  }
}








