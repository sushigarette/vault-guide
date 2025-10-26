# Configuration Coolify - Routes React

## ❌ **Problème**
Les URLs comme `/product/:id` retournent 404 car Nginx ne les route pas vers `index.html`.

## ✅ **Solution dans Coolify**

### **Configuration à faire dans Coolify :**

1. Allez dans les **Paramètres** de votre application dans Coolify
2. Section **"Static Files"** ou **"Build Settings"**
3. Ajoutez cette configuration :

**Option 1 : Configuration Nginx (recommandé)**
Dans les **"Custom Nginx Configuration"** ou **"Advanced Settings"**, ajoutez :

```nginx
# Toutes les routes doivent pointer vers index.html pour le routing React
try_files $uri $uri/ /index.html;
```

**Option 2 : Configuration en ligne de commande**
Dans les **"Environment Variables"** ou **"Build Script"**, ajoutez :

```
Static Files Config: SPA (Single Page Application)
```

### **Vérification**

Après configuration, les URLs suivantes devraient fonctionner :
- ✅ `http://mhstock.crdstech.fr/` → Page principale
- ✅ `http://mhstock.crdstech.fr/product/2419836a...` → Page produit (actuellement 404)
- ✅ `http://mhstock.crdstech.fr/qr-codes` → Page QR codes

## 📋 **Ce qui a été fait**

1. ✅ `vite.config.ts` : `base: "/"` (pas de sous-dossier)
2. ✅ `src/App.tsx` : Suppression de `basename="/mhstock"`
3. ✅ `public/.nginx.conf` : Configuration Nginx créée

Il reste à configurer Coolify pour utiliser cette configuration Nginx !
