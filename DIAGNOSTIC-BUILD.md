# 🔍 Diagnostic du problème de build

## Vérifications à faire

### 1. Vérifier que vous êtes au bon endroit

```bash
# Vérifier le chemin actuel
pwd
# Devrait afficher : /var/www/mhstock

# Vérifier que les fichiers sources existent
ls -la
ls -la src/
ls -la package.json
ls -la vite.config.ts
```

### 2. Vérifier si le build a vraiment réussi

```bash
# Relancer le build et regarder la fin du message
npm run build

# À la fin, vous devriez voir quelque chose comme :
# ✓ built in 15.23s
# ou
# ✗ [ERROR] ...
```

### 3. Vérifier les erreurs potentielles

```bash
# Vérifier les logs complets
npm run build 2>&1 | tee build.log

# Regarder la fin du fichier
tail -50 build.log
```

### 4. Vérifier les permissions

```bash
# Vérifier qui est l'utilisateur actuel
whoami

# Vérifier les permissions du dossier
ls -la /var/www/mhstock/

# Si nécessaire, corriger les permissions
sudo chown -R mhcerts:mhcerts /var/www/mhstock/
```

### 5. Vérifier si dist/ existe ailleurs

```bash
# Chercher le dossier dist
find /var/www -name "dist" -type d 2>/dev/null

# Chercher index.html
find /var/www -name "index.html" -path "*/dist/*" 2>/dev/null
```

### 6. Vérifier Node.js et npm

```bash
# Vérifier la version de Node.js
node --version
# Devrait être 20.x ou supérieur

# Vérifier npm
npm --version

# Vérifier que vite est installé
npm list vite
```

### 7. Réinstaller les dépendances si nécessaire

```bash
# Supprimer node_modules et réinstaller
rm -rf node_modules package-lock.json
npm install

# Relancer le build
npm run build
```

## Problèmes courants

### Problème 1 : Build silencieux qui échoue
**Solution** : Vérifier les logs avec `npm run build 2>&1 | tee build.log`

### Problème 2 : Permissions insuffisantes
**Solution** : 
```bash
sudo chown -R mhcerts:mhcerts /var/www/mhstock/
npm run build
```

### Problème 3 : Node.js trop ancien
**Solution** :
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Problème 4 : Dépendances manquantes
**Solution** :
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

