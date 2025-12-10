# Configuration PWA pour iPhone

L'application est maintenant configurée comme Progressive Web App (PWA) et peut être installée sur iPhone.

## Fonctionnalités PWA

✅ **Manifest.json** - Configuration de l'application  
✅ **Service Worker** - Cache et fonctionnement hors ligne  
✅ **Meta tags iOS** - Support natif iPhone  
✅ **Icônes** - Support des icônes d'application  

## Installation sur iPhone

### Méthode 1 : Via Safari

1. Ouvrez l'application dans Safari sur iPhone
2. Appuyez sur le bouton **Partager** (icône carrée avec flèche)
3. Faites défiler et sélectionnez **Sur l'écran d'accueil**
4. Personnalisez le nom si nécessaire
5. Appuyez sur **Ajouter**

### Méthode 2 : Via le menu Safari

1. Ouvrez l'application dans Safari
2. Appuyez sur le bouton **Menu** (trois points)
3. Sélectionnez **Sur l'écran d'accueil**
4. Confirmez l'ajout

## Génération des icônes

Pour une expérience optimale, générez les icônes PNG nécessaires :

### Option 1 : Outil en ligne (Recommandé)

1. Allez sur https://realfavicongenerator.net/
2. Uploadez votre `favicon.svg` ou une image 512x512
3. Configurez les options pour iOS
4. Téléchargez et placez les fichiers dans `/public/` :
   - `apple-touch-icon.png` (180x180)
   - `icon-192.png` (192x192)
   - `icon-512.png` (512x512)

### Option 2 : Outil PWA Builder

1. Allez sur https://www.pwabuilder.com/imageGenerator
2. Uploadez votre image
3. Téléchargez les icônes générées
4. Placez-les dans `/public/`

### Option 3 : Script Node.js (si sharp est installé)

```bash
npm install --save-dev sharp
node scripts/generate-icons.js
```

## Fichiers créés

- `/public/manifest.json` - Manifest PWA
- `/public/sw.js` - Service Worker
- `/index.html` - Meta tags iOS ajoutés
- `/src/main.tsx` - Enregistrement du service worker

## Test de l'installation

1. Déployez l'application sur un serveur HTTPS (requis pour PWA)
2. Ouvrez l'URL sur iPhone Safari
3. Vérifiez que l'option "Sur l'écran d'accueil" apparaît
4. Installez l'application
5. L'icône devrait apparaître sur l'écran d'accueil

## Fonctionnalités hors ligne

Le service worker met en cache :
- La page d'accueil
- Les fichiers statiques essentiels
- Permet un fonctionnement basique hors ligne

## Notes importantes

- **HTTPS requis** : Les PWA nécessitent HTTPS en production
- **Service Worker** : S'enregistre automatiquement au chargement
- **Cache** : Les ressources sont mises en cache pour un chargement plus rapide
- **Mise à jour** : Le cache est mis à jour automatiquement lors des nouvelles versions

## Dépannage

### L'option "Sur l'écran d'accueil" n'apparaît pas

- Vérifiez que vous êtes en HTTPS
- Vérifiez que le manifest.json est accessible
- Vérifiez la console pour les erreurs

### L'icône ne s'affiche pas correctement

- Vérifiez que les fichiers PNG sont présents dans `/public/`
- Vérifiez les tailles des icônes (180x180, 192x192, 512x512)
- Videz le cache de Safari

### Le service worker ne fonctionne pas

- Vérifiez la console pour les erreurs
- Vérifiez que `/sw.js` est accessible
- Vérifiez que vous êtes en HTTPS

