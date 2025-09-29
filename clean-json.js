// Script pour nettoyer et valider votre JSON
// Utilisation: node clean-json.js

import fs from 'fs';

// Lire votre fichier JSON
const jsonFile = 'parc_machines.json'; // Remplacez par le nom de votre fichier
const outputFile = 'cleaned-data.json';

try {
  // Lire le fichier
  let content = fs.readFileSync(jsonFile, 'utf8');
  
  console.log('🔍 Nettoyage du JSON...');
  
  // Nettoyer les caractères problématiques
  content = content
    // Remplacer les valeurs NaN par null
    .replace(/:\s*NaN\s*,/g, ': null,')
    .replace(/:\s*NaN\s*}/g, ': null}')
    .replace(/:\s*NaN\s*]/g, ': null]')
    // Remplacer les guillemets simples par des guillemets doubles
    .replace(/'/g, '"')
    // Nettoyer les retours à la ligne dans les chaînes
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    // Nettoyer les espaces multiples
    .replace(/\s+/g, ' ')
    // S'assurer que c'est un tableau
    .trim();
  
  // Ajouter des crochets si nécessaire
  if (!content.startsWith('[')) {
    content = '[' + content + ']';
  }
  
  // Parser pour valider
  const data = JSON.parse(content);
  
  console.log('✅ JSON valide !');
  console.log(`📊 Nombre d'objets: ${data.length}`);
  
  // Sauvegarder le fichier nettoyé
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf8');
  
  console.log(`💾 Fichier nettoyé sauvegardé: ${outputFile}`);
  console.log('🚀 Vous pouvez maintenant importer cleaned-data.json');
  
} catch (error) {
  console.error('❌ Erreur lors du nettoyage:', error.message);
  console.log('💡 Vérifiez la syntaxe de votre JSON');
  
  // Afficher les premières lignes pour diagnostic
  try {
    const content = fs.readFileSync(jsonFile, 'utf8');
    const lines = content.split('\n');
    console.log('\n📋 Premières lignes du fichier:');
    lines.slice(0, 10).forEach((line, index) => {
      console.log(`${index + 1}: ${line}`);
    });
  } catch (readError) {
    console.log('Impossible de lire le fichier');
  }
}
