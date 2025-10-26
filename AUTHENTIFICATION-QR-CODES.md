# Authentification pour les QR codes

## ✅ **Solution implémentée**

J'ai ajouté l'authentification aux pages `ProductDetail.tsx` et `QRCodePrintPage.tsx` :

### **Comportement maintenant :**

1. **Utilisateur scanne le QR code** 
   - Lien : `https://mhstock.crdstech.fr/product/94f8f590-ba1b-4d1a-9639-a0a8b8152891`

2. **Si non connecté** :
   - Formulaire d'authentification affiché
   - Après connexion : Page produit s'affiche automatiquement

3. **Si déjà connecté** :
   - Page produit affichée directement

### **Modifications apportées :**

**`src/pages/ProductDetail.tsx`** :
```typescript
const { user, loading: authLoading } = useAuth();

// Afficher formulaire d'authentification si non connecté
if (!user) {
  return <AuthForm onAuthSuccess={() => window.location.reload()} />;
}
```

**`src/pages/QRCodePrintPage.tsx`** :
```typescript
const { user, loading: authLoading } = useAuth();

// Même vérification d'authentification
if (!user) {
  return <AuthForm onAuthSuccess={() => window.location.reload()} />;
}
```

## 🔄 **Action nécessaire**

**Redéployez l'application dans Coolify** pour que les modifications prennent effet.

Ensuite, quand vous scannerez un QR code :
1. Si non connecté → Formulaire de connexion
2. Après connexion → Page du produit s'affiche automatiquement
