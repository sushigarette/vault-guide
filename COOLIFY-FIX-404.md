# Pour déployer avec Coolify

## ✅ **Build réussi !**

Le build fonctionne maintenant. Pour résoudre le problème des assets 404 :

### **Option 1 : Désactiver le base path (recommandé)**

Si l'application est accessible à la racine du domaine (pas dans un sous-dossier) :

1. Modifier `vite.config.ts` :
```typescript
export default defineConfig(({ mode }) => ({
  base: "/",  // Pas de sous-dossier
  // ...
}));
```

2. Modifier `index.html` :
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

### **Option 2 : Garder le base path `/mhstock/`**

Si l'application DOIT être accessible via `http://mhstock.crdstech.fr/mhstock/` :

Dans Coolify, configurez **"Base Path"** ou **"Static Files Path"** à :
- Valeur : `/mhstock`
- OU servez les fichiers statiques à la racine

### **Option 3 : Configuration Nginx (si utilisé)**

Si vous utilisez Nginx, vérifiez que la configuration route correctement :
- `/mhstock/` → `dist/index.html`
- `/mhstock/assets/*` → `dist/assets/*`

## 🔧 **Variables d'environnement dans Coolify :**

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anonyme
```

## 💡 **Recommandation :**

Pour simplifier, désactivez le `base` path dans `vite.config.ts` :
```typescript
base: "/",  // au lieu de base: "/mhstock/"
```

Cela permettra d'accéder à l'application directement à `http://mhstock.crdstech.fr/` sans le préfixe `/mhstock/`.
