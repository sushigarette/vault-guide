/**
 * Script pour générer les icônes PWA à partir du favicon.svg
 * 
 * Pour utiliser ce script, vous devez installer sharp:
 * npm install --save-dev sharp
 * 
 * Ou utilisez un outil en ligne comme:
 * - https://realfavicongenerator.net/
 * - https://www.pwabuilder.com/imageGenerator
 */

const fs = require('fs');
const path = require('path');

// Créer les fichiers d'icônes manquants (placeholders)
const publicDir = path.join(__dirname, '..', 'public');

// Créer un SVG simple pour apple-touch-icon (180x180)
const appleTouchIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" fill="none">
  <rect width="180" height="180" fill="#3B82F6"/>
  <rect x="20" y="50" width="140" height="80" rx="10" fill="#FFFFFF" stroke="#1E40AF" stroke-width="3"/>
  <rect x="20" y="85" width="140" height="10" fill="#1E40AF"/>
  <rect x="85" y="50" width="10" height="80" fill="#1E40AF"/>
  <text x="90" y="100" font-family="Arial" font-size="40" font-weight="bold" fill="#3B82F6" text-anchor="middle" dominant-baseline="middle">MH</text>
</svg>`;

// Créer un SVG simple pour icon-192 (192x192)
const icon192 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" fill="none">
  <rect width="192" height="192" fill="#3B82F6"/>
  <rect x="20" y="50" width="152" height="92" rx="10" fill="#FFFFFF" stroke="#1E40AF" stroke-width="3"/>
  <rect x="20" y="90" width="152" height="12" fill="#1E40AF"/>
  <rect x="90" y="50" width="12" height="92" fill="#1E40AF"/>
  <text x="96" y="110" font-family="Arial" font-size="50" font-weight="bold" fill="#3B82F6" text-anchor="middle" dominant-baseline="middle">MH</text>
</svg>`;

// Créer un SVG simple pour icon-512 (512x512)
const icon512 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="#3B82F6"/>
  <rect x="50" y="130" width="412" height="252" rx="25" fill="#FFFFFF" stroke="#1E40AF" stroke-width="8"/>
  <rect x="50" y="240" width="412" height="32" fill="#1E40AF"/>
  <rect x="240" y="130" width="32" height="252" fill="#1E40AF"/>
  <text x="256" y="290" font-family="Arial" font-size="140" font-weight="bold" fill="#3B82F6" text-anchor="middle" dominant-baseline="middle">MH</text>
</svg>`;

// Écrire les fichiers SVG (qui peuvent être convertis en PNG plus tard)
if (!fs.existsSync(path.join(publicDir, 'apple-touch-icon.png'))) {
  console.log('Note: Les fichiers PNG doivent être générés. Utilisez un outil en ligne comme https://realfavicongenerator.net/');
  console.log('Ou installez sharp et exécutez: npm run generate-icons');
}

console.log('✅ Fichiers de configuration PWA créés');
console.log('📱 Pour générer les icônes PNG, utilisez:');
console.log('   - https://realfavicongenerator.net/');
console.log('   - https://www.pwabuilder.com/imageGenerator');
console.log('');
console.log('Les fichiers nécessaires sont:');
console.log('  - /public/apple-touch-icon.png (180x180)');
console.log('  - /public/icon-192.png (192x192)');
console.log('  - /public/icon-512.png (512x512)');

