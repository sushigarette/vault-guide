# Guide des QR Codes - Système de Gestion de Stock

## 🎯 Fonctionnalité QR Code

Les QR codes générés par le système de gestion de stock sont **interactifs** et permettent d'accéder directement à la fiche produit en les scannant.

## 📱 Comment ça fonctionne

### 1. Génération automatique des QR codes
- Chaque produit peut avoir un QR code unique
- Le QR code contient une URL directe vers la fiche produit
- Format de l'URL : `https://votre-domaine.com/product/[ID_PRODUIT]`

### 2. Contenu du QR code
- **URL complète** : `http://localhost:8083/product/1`
- **Redirection automatique** vers la page de détail du produit
- **Accessible depuis n'importe quel appareil** avec un lecteur QR

### 3. Page de détail produit
Quand un QR code est scanné, l'utilisateur accède à une page complète contenant :
- **Informations du produit** : nom, description, SKU, catégorie
- **Statut du stock** : quantité disponible, seuils d'alerte
- **Codes d'identification** : code-barres et QR code
- **Historique des mouvements** : entrées, sorties, ajustements
- **Informations système** : dates de création/modification

## 🖨️ Impression des QR codes

### Impression individuelle
1. Cliquez sur l'icône d'impression (🖨️) dans le tableau des produits
2. Configurez les paramètres d'impression
3. Imprimez le QR code avec le code-barres

### Impression en lot
1. Utilisez la fonction d'impression en lot
2. Sélectionnez les produits à imprimer
3. Configurez le nombre d'articles par page
4. Imprimez tous les codes en une fois

## 📋 Utilisation pratique

### Pour les employés
- **Scan rapide** : Accès instantané aux informations produit
- **Vérification de stock** : Voir la quantité disponible
- **Historique** : Consulter les derniers mouvements
- **Modification** : Accès direct aux fonctions d'édition

### Pour les clients
- **Informations produit** : Détails complets du produit
- **Disponibilité** : Statut du stock en temps réel
- **Traçabilité** : Historique des mouvements

## 🔧 Configuration technique

### Génération des URLs
```typescript
const generateQRCode = (productId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/product/${productId}`;
};
```

### Structure des URLs
- **Développement** : `http://localhost:8083/product/1`
- **Production** : `https://votre-domaine.com/product/1`

### Compatibilité
- ✅ **Tous les lecteurs QR** (smartphones, tablettes)
- ✅ **Tous les navigateurs** (Chrome, Safari, Firefox, Edge)
- ✅ **Responsive design** (mobile, tablette, desktop)

## 📱 Test des QR codes

### Méthode 1 : Scanner avec un smartphone
1. Ouvrez l'appareil photo ou une app de lecture QR
2. Pointez vers le QR code affiché à l'écran
3. Suivez le lien qui s'affiche

### Méthode 2 : Test en développement
1. Copiez l'URL du QR code
2. Collez-la dans un nouvel onglet
3. Vérifiez que la page produit s'affiche correctement

## 🎨 Personnalisation

### Paramètres d'impression
- **Format** : Code 128, EAN-13, EAN-8, UPC, Code 39
- **Taille** : Largeur et hauteur ajustables
- **Police** : Taille de police personnalisable
- **Marges** : Espacement configurable

### Mise en page
- **Articles par page** : 2, 4, 6, ou 8
- **Orientation** : Portrait ou paysage
- **Informations** : Nom, SKU, codes d'identification

## 🚀 Avantages

### Pour l'entreprise
- **Efficacité** : Accès rapide aux informations
- **Traçabilité** : Historique complet des mouvements
- **Mobilité** : Utilisation sur tous les appareils
- **Intégration** : Liens directs vers les fiches produits

### Pour les utilisateurs
- **Simplicité** : Un scan suffit
- **Rapidité** : Accès instantané aux données
- **Complétude** : Toutes les informations en un endroit
- **Mise à jour** : Données toujours à jour

## 📝 Notes importantes

1. **URLs absolues** : Les QR codes contiennent des URLs complètes
2. **Accessibilité** : Fonctionne même hors du réseau local
3. **Sécurité** : Accès en lecture seule aux informations publiques
4. **Performance** : Chargement rapide des pages produit

## 🔄 Mise à jour des QR codes

Si vous changez l'URL de base de votre application :
1. Les nouveaux QR codes utiliseront automatiquement la nouvelle URL
2. Les anciens QR codes continueront de fonctionner si l'ancienne URL est accessible
3. Pour une migration complète, regénérez tous les QR codes

---

**💡 Conseil** : Testez toujours vos QR codes après génération pour vous assurer qu'ils fonctionnent correctement !








