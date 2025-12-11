# 🔧 Guide de dépannage - mhstock ne fonctionne pas

## 📋 Informations nécessaires

Pour diagnostiquer le problème, j'ai besoin de :

### 1. Quelle est l'erreur exacte ?

- [ ] Page blanche
- [ ] Erreur 404
- [ ] Erreur 403 (Forbidden)
- [ ] Erreur 500
- [ ] Les assets ne se chargent pas (CSS/JS)
- [ ] Autre : _______________

### 2. Commandes à exécuter sur le Raspberry Pi

```bash
# 1. Vérifier la configuration Nginx
sudo nginx -t

# 2. Vérifier que les fichiers existent
ls -la /var/www/mhstock/dist/
ls -la /var/www/mhstock/dist/index.html
ls -la /var/www/mhstock/dist/assets/

# 3. Vérifier les permissions
ls -la /var/www/mhstock/dist/ | head -5

# 4. Voir les dernières erreurs
sudo tail -20 /var/log/nginx/error.log

# 5. Tester les URLs
curl -I http://localhost/mhstock/
curl -I http://localhost/sw.js
curl -I http://localhost/mhstock/assets/ 2>&1 | head -5

# 6. Vérifier que la configuration est bien chargée
sudo nginx -T | grep -A 3 "location.*mhstock" | head -20
```

### 3. Dans la console du navigateur (F12)

Ouvrez la console (F12) et regardez les erreurs. Copiez :
- Les erreurs en rouge
- Les requêtes qui échouent (onglet Network)

## 🚀 Solutions rapides

### Solution 1 : Rebuild et permissions

```bash
cd /var/www/mhstock
git pull origin main
npm run build
sudo chown -R www-data:www-data /var/www/mhstock/dist/
sudo chmod -R 755 /var/www/mhstock/dist/
sudo systemctl reload nginx
```

### Solution 2 : Vérifier la configuration Nginx

```bash
# Vérifier que le fichier est bien appliqué
sudo cp /var/www/mhstock/nginx-configs/mhcerts-complete.conf /etc/nginx/sites-available/mhcerts

# Tester
sudo nginx -t

# Recharger
sudo systemctl reload nginx
```

### Solution 3 : Vider le cache du navigateur

- Chrome/Edge : `Ctrl+Shift+Delete` (Windows) ou `Cmd+Shift+Delete` (Mac)
- Firefox : `Ctrl+Shift+Delete` (Windows) ou `Cmd+Shift+Delete` (Mac)
- Safari : `Cmd+Option+E`

Ou utiliser le mode navigation privée pour tester.

## 📝 Checklist de vérification

- [ ] Le dossier `/var/www/mhstock/dist/` existe
- [ ] Le fichier `index.html` existe dans `dist/`
- [ ] Le dossier `dist/assets/` existe et contient des fichiers
- [ ] Les permissions sont correctes (`www-data:www-data`)
- [ ] La configuration Nginx est valide (`sudo nginx -t`)
- [ ] Nginx a été rechargé (`sudo systemctl reload nginx`)
- [ ] Le cache du navigateur a été vidé

## 🆘 Si rien ne fonctionne

Envoyez-moi :
1. La sortie complète de `sudo nginx -t`
2. La sortie de `ls -la /var/www/mhstock/dist/`
3. Les 50 dernières lignes de `sudo tail -50 /var/log/nginx/error.log`
4. Les erreurs de la console du navigateur (F12)
5. Une capture d'écran de la page si possible

