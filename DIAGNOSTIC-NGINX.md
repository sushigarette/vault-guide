# 🔍 Guide de diagnostic Nginx pour mhstock

## 1. Vérifier que la configuration est appliquée

```bash
# Vérifier que la configuration est bien chargée
sudo nginx -t

# Vérifier que Nginx utilise bien le bon fichier
sudo nginx -T | grep -A 5 "location.*mhstock"
```

## 2. Vérifier les fichiers dans dist/

```bash
# Vérifier que les fichiers sont bien présents
ls -la /var/www/mhstock/dist/
ls -la /var/www/mhstock/dist/sw.js
ls -la /var/www/mhstock/dist/manifest.json
ls -la /var/www/mhstock/dist/favicon.svg

# Vérifier les permissions
sudo chown -R www-data:www-data /var/www/mhstock/dist/
sudo chmod -R 755 /var/www/mhstock/dist/
```

## 3. Vérifier les logs Nginx

```bash
# Voir les erreurs en temps réel
sudo tail -f /var/log/nginx/error.log

# Voir les accès
sudo tail -f /var/log/nginx/access.log
```

## 4. Tester les URLs directement

```bash
# Tester depuis le serveur
curl -I http://localhost/mhstock/
curl -I http://localhost/sw.js
curl -I http://localhost/mhstock/sw.js
curl -I http://localhost/manifest.json
curl -I http://localhost/mhstock/manifest.json

# Tester les assets
curl -I http://localhost/mhstock/assets/index-*.js
```

## 5. Vérifier la configuration Nginx active

```bash
# Voir la configuration complète
sudo nginx -T | grep -A 20 "location.*sw.js"
sudo nginx -T | grep -A 20 "location.*mhstock"
```

## 6. Problèmes courants

### Problème 1 : Fichiers 404
**Symptôme** : Erreurs 404 dans les logs
**Solution** : Vérifier que les fichiers existent dans `/var/www/mhstock/dist/`

### Problème 2 : Permissions
**Symptôme** : Erreurs 403 (Forbidden)
**Solution** : 
```bash
sudo chown -R www-data:www-data /var/www/mhstock/dist/
sudo chmod -R 755 /var/www/mhstock/dist/
```

### Problème 3 : Configuration non appliquée
**Symptôme** : Les locations ne matchent pas
**Solution** :
```bash
# Vérifier que le fichier est bien dans sites-enabled
ls -la /etc/nginx/sites-enabled/mhcerts

# Recharger Nginx
sudo systemctl reload nginx
```

### Problème 4 : Cache du navigateur
**Symptôme** : Ancienne version chargée
**Solution** : Vider le cache du navigateur (Ctrl+Shift+R ou Cmd+Shift+R)

## 7. Commandes de test complètes

```bash
# 1. Vérifier la configuration
sudo nginx -t

# 2. Vérifier les fichiers
ls -la /var/www/mhstock/dist/

# 3. Vérifier les permissions
sudo chown -R www-data:www-data /var/www/mhstock/dist/
sudo chmod -R 755 /var/www/mhstock/dist/

# 4. Recharger Nginx
sudo systemctl reload nginx

# 5. Tester
curl -I http://localhost/mhstock/
```

## 8. Informations à fournir pour le diagnostic

Si le problème persiste, fournissez :

1. **Sortie de `sudo nginx -t`**
2. **Sortie de `ls -la /var/www/mhstock/dist/`**
3. **Dernières lignes de `sudo tail -50 /var/log/nginx/error.log`**
4. **Résultat de `curl -I http://localhost/mhstock/`**
5. **Résultat de `curl -I http://localhost/sw.js`**
6. **Erreurs dans la console du navigateur (F12)**

