# 📱 Guide d'installation sur iPhone

Votre application MHStock est maintenant une **Progressive Web App (PWA)** et peut être installée directement sur iPhone comme une application native.

## 🚀 Installation rapide

### Étape 1 : Ouvrir dans Safari
1. Ouvrez **Safari** sur votre iPhone (pas Chrome ou autre navigateur)
2. Allez sur l'URL de votre application (en HTTPS)

### Étape 2 : Ajouter à l'écran d'accueil
1. Appuyez sur le bouton **Partager** (icône carrée avec flèche vers le haut) en bas de l'écran
2. Faites défiler vers le bas dans le menu
3. Appuyez sur **"Sur l'écran d'accueil"** (ou "Ajouter à l'écran d'accueil")
4. Personnalisez le nom si vous le souhaitez
5. Appuyez sur **"Ajouter"** en haut à droite

### Étape 3 : Utiliser l'application
- L'icône de l'application apparaît maintenant sur votre écran d'accueil
- Appuyez dessus pour ouvrir l'application en plein écran (sans barre d'adresse Safari)
- L'application fonctionne comme une app native !

## ✨ Fonctionnalités PWA

✅ **Installation native** - Apparaît comme une vraie application  
✅ **Plein écran** - Pas de barre d'adresse du navigateur  
✅ **Icône personnalisée** - Icône sur l'écran d'accueil  
✅ **Cache intelligent** - Chargement plus rapide  
✅ **Fonctionnement hors ligne** - Accès basique même sans internet  

## 📋 Prérequis

- ✅ L'application doit être en **HTTPS** (obligatoire pour les PWA)
- ✅ Utiliser **Safari** (les autres navigateurs iOS ne supportent pas l'installation PWA)
- ✅ iOS 11.3 ou supérieur

## 🎨 Personnalisation des icônes

Pour une meilleure expérience, générez les icônes PNG :

1. Allez sur https://realfavicongenerator.net/
2. Uploadez votre logo ou une image 512x512
3. Configurez pour iOS
4. Téléchargez et placez dans `/public/` :
   - `apple-touch-icon.png` (180x180)
   - `icon-192.png` (192x192)  
   - `icon-512.png` (512x512)

## 🔧 Dépannage

### L'option "Sur l'écran d'accueil" n'apparaît pas
- ✅ Vérifiez que vous êtes en **HTTPS**
- ✅ Utilisez **Safari** (pas Chrome/Firefox)
- ✅ Vérifiez que le manifest.json est accessible

### L'icône ne s'affiche pas
- ✅ Vérifiez que les fichiers PNG sont dans `/public/`
- ✅ Videz le cache de Safari (Réglages > Safari > Effacer historique)

### L'application ne se charge pas
- ✅ Vérifiez la console pour les erreurs
- ✅ Vérifiez que le service worker est enregistré (Console > Application > Service Workers)

## 📝 Notes

- L'application fonctionne en mode **standalone** (plein écran)
- Le **service worker** met en cache les ressources pour un chargement plus rapide
- Les **mises à jour** sont automatiques lors des nouvelles versions

---

**Profitez de votre application installée sur iPhone ! 🎉**

