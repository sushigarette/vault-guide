# ✅ Étapes après le build

## 1. Vérifier que le build a réussi

```bash
# Vérifier que dist/ existe maintenant
ls -la /var/www/mhstock/dist/

# Vérifier les fichiers importants
ls -la /var/www/mhstock/dist/index.html
ls -la /var/www/mhstock/dist/assets/ | head -10
ls -la /var/www/mhstock/dist/sw.js
ls -la /var/www/mhstock/dist/manifest.json
```

## 2. Corriger les permissions

```bash
# Donner les bonnes permissions à www-data
sudo chown -R www-data:www-data /var/www/mhstock/dist/
sudo chmod -R 755 /var/www/mhstock/dist/

# Vérifier
ls -la /var/www/mhstock/dist/ | head -5
```

## 3. Appliquer la configuration Nginx

```bash
# Copier la configuration
sudo cp /var/www/mhstock/nginx-configs/mhcerts-complete.conf /etc/nginx/sites-available/mhcerts

# Tester la configuration
sudo nginx -t

# Si OK, recharger Nginx
sudo systemctl reload nginx
```

## 4. Tester

```bash
# Tester depuis le serveur
curl -I http://localhost/mhstock/

# Tester les fichiers statiques
curl -I http://localhost/sw.js
curl -I http://localhost/manifest.json
```

## 5. Vérifier dans le navigateur

Ouvrez : `https://mhcerts.infra.mhcomm.fr/mhstock/`

Si ça ne fonctionne toujours pas, vérifiez les logs :
```bash
sudo tail -f /var/log/nginx/error.log
```

## Note sur les avertissements

Les avertissements que vous avez vus sont normaux :
- ✅ **Browserslist outdated** : Ce n'est qu'un avertissement, pas une erreur
- ✅ **Chunks > 500 kB** : C'est normal pour une application React avec toutes ses dépendances

Le build a réussi si vous voyez :
```
✓ built in X.XXs
```

