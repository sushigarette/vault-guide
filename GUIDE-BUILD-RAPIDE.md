# 🚀 Guide de build rapide pour mhstock

## Problème : Le dossier `dist/` n'existe pas

Si `ls -la /var/www/mhstock/dist/` ne retourne rien, c'est que le projet n'a pas été buildé.

## Solution : Builder le projet

```bash
# 1. Aller dans le dossier
cd /var/www/mhstock

# 2. Vérifier que vous êtes dans le bon dossier
pwd
# Devrait afficher : /var/www/mhstock

# 3. Vérifier que les fichiers sources existent
ls -la src/
ls -la package.json

# 4. Installer les dépendances si nécessaire
npm install

# 5. Builder le projet
npm run build

# 6. Vérifier que dist/ a été créé
ls -la dist/
ls -la dist/index.html
ls -la dist/assets/

# 7. Corriger les permissions
sudo chown -R www-data:www-data /var/www/mhstock/dist/
sudo chmod -R 755 /var/www/mhstock/dist/

# 8. Vérifier que tout est OK
ls -la dist/ | head -10
```

## Si le build échoue

### Erreur : "command not found: npm"
```bash
# Installer Node.js et npm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Erreur : "EACCES: permission denied"
```bash
# Nettoyer le dossier dist avec sudo
sudo rm -rf dist
npm run build
```

### Erreur : "Cannot find module"
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Vérification finale

Après le build, vous devriez avoir :
- ✅ `/var/www/mhstock/dist/index.html`
- ✅ `/var/www/mhstock/dist/assets/` (avec des fichiers .js et .css)
- ✅ `/var/www/mhstock/dist/sw.js` (si le service worker existe)
- ✅ `/var/www/mhstock/dist/manifest.json` (si le manifest existe)

## Ensuite

Une fois le build terminé, suivez le guide de configuration Nginx :
```bash
sudo cp /var/www/mhstock/nginx-configs/mhcerts-complete.conf /etc/nginx/sites-available/mhcerts
sudo nginx -t
sudo systemctl reload nginx
```

