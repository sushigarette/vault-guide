# ✅ Étapes finales après le build réussi

Le build a réussi ! Maintenant, suivez ces étapes :

## 1. Vérifier que dist/ existe

```bash
ls -la /var/www/mhstock/dist/
ls -la /var/www/mhstock/dist/index.html
ls -la /var/www/mhstock/dist/assets/
```

## 2. Corriger les permissions (IMPORTANT)

```bash
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
```

Si la configuration est valide, vous verrez :
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

## 4. Recharger Nginx

```bash
sudo systemctl reload nginx
```

## 5. Tester

```bash
# Tester depuis le serveur
curl -I http://localhost/mhstock/

# Tester les fichiers statiques
curl -I http://localhost/sw.js
curl -I http://localhost/manifest.json
```

## 6. Vérifier dans le navigateur

Ouvrez : `https://mhcerts.infra.mhcomm.fr/mhstock/`

## Si ça ne fonctionne toujours pas

Vérifiez les logs :
```bash
sudo tail -f /var/log/nginx/error.log
```

Et vérifiez les permissions :
```bash
ls -la /var/www/mhstock/dist/
sudo chown -R www-data:www-data /var/www/mhstock/dist/
```

