# Configuration pour Coolify - Résolution erreur Node.js 18.x

## ❌ **Problème**
```
error: Node.js 18.x has reached End-Of-Life and has been removed
```

## ✅ **Solution**

J'ai ajouté deux fichiers pour résoudre ce problème :

### **1. `.node-version`**
```bash
20
```
Ce fichier spécifie la version de Node.js à utiliser (version 20).

### **2. `nixpacks.toml`**
```toml
# Configuration Nixpacks pour Coolify
# Utilise Node.js 20 (Node.js 18.x est EOL)

[phases]
setup = """
  nixpkgs = [
    "nodejs_20"
  ]
"""

[start]
cmd = "npm run preview"

[variables]
NODE_ENV = "production"
```

## 🚀 **Déploiement avec Coolify**

### **Configuration Coolify :**
1. **Build Command** : `npm install && npm run build`
2. **Start Command** : `npm run preview`
3. **Variables d'environnement** :
   - `VITE_SUPABASE_URL` : URL de votre instance Supabase
   - `VITE_SUPABASE_ANON_KEY` : Clé anonyme Supabase

### **Variables d'environnement requises :**
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anonyme
NODE_ENV=production
```

## 📝 **Configuration recommandée**

### **Port :**
- Coolify utilise automatiquement le port défini
- Vite preview utilise le port 4173 par défaut

### **Build :**
- **Node.js** : Version 20+
- **Npm** : Installé automatiquement
- **Build output** : `dist/`

### **Routes :**
- Base path : `/mhstock` (configuré dans `vite.config.ts`)

## ⚠️ **Notes importantes**

1. **Node.js 20** : Utilisez Node.js 20 car Node.js 18.x est EOL
2. **Variables d'environnement** : Configurez-les dans Coolify
3. **Build** : Le build est automatique lors du déploiement
4. **Preview** : Utilise `npm run preview` pour servir les fichiers statiques

Le déploiement devrait maintenant fonctionner correctement avec Coolify ! 🎉
