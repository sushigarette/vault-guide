# Configuration Nginx complète - Guide d'installation

## 📋 Vue d'ensemble

Ce guide vous permet de configurer Nginx proprement pour tous vos projets :
- **mhcerts** : Projet principal (racine `/`)
- **mhstock** : Gestion de stock (`/mhstock/`)
- **mhcse** : CSE Bonnes Affaires (`/mhcse/`)

## 🚀 Installation rapide

### Option 1 : Fichier unique (recommandé pour simplicité)

```bash
# 1. Sauvegarder l'ancienne configuration
sudo cp /etc/nginx/sites-available/mhcerts /etc/nginx/sites-available/mhcerts.backup

# 2. Copier la nouvelle configuration complète
sudo cp nginx-configs/mhcerts-complete.conf /etc/nginx/sites-available/mhcerts

# 3. Tester la configuration
sudo nginx -t

# 4. Si OK, recharger Nginx
sudo systemctl reload nginx
```

### Option 2 : Fichiers séparés (pour organisation)

```bash
# 1. Copier chaque fichier
sudo cp nginx-configs/mhcerts.conf /etc/nginx/sites-available/mhcerts
sudo cp nginx-configs/mhstock.conf /etc/nginx/sites-available/mhstock
sudo cp nginx-configs/mhcse.conf /etc/nginx/sites-available/mhcse

# 2. Créer les liens symboliques
sudo ln -sf /etc/nginx/sites-available/mhcerts /etc/nginx/sites-enabled/mhcerts
sudo ln -sf /etc/nginx/sites-available/mhstock /etc/nginx/sites-enabled/mhstock
sudo ln -sf /etc/nginx/sites-available/mhcse /etc/nginx/sites-enabled/mhcse

# 3. Supprimer l'ancien fichier si nécessaire
sudo rm /etc/nginx/sites-enabled/default  # Si vous n'en avez plus besoin

# 4. Tester
sudo nginx -t

# 5. Recharger
sudo systemctl reload nginx
```

## ✅ Vérifications

Après installation, vérifiez que tout fonctionne :

```bash
# Vérifier que Nginx fonctionne
sudo systemctl status nginx

# Vérifier les erreurs
sudo tail -f /var/log/nginx/error.log

# Tester les URLs
curl -I https://mhcerts.infra.mhcomm.fr/
curl -I https://mhcerts.infra.mhcomm.fr/mhstock/
curl -I https://mhcerts.infra.mhcomm.fr/mhcse/
```

## 🔧 Structure des fichiers

- `nginx-configs/mhcerts-complete.conf` : Configuration complète en un seul fichier
- `nginx-configs/mhcerts.conf` : Configuration pour mhcerts uniquement
- `nginx-configs/mhstock.conf` : Configuration pour mhstock uniquement
- `nginx-configs/mhcse.conf` : Configuration pour mhcse uniquement

## 📝 Notes importantes

1. **Ordre des locations** : Les locations spécifiques (`/mhstock/assets/`) doivent être AVANT les locations générales (`/mhstock/`)
2. **Alias vs Root** : Utilisez `alias` pour les sous-dossiers, `root` pour la racine
3. **Fallback SPA** : Le `@mhstock_fallback` permet le routing React (toutes les routes pointent vers `index.html`)

## 🐛 Dépannage

Si vous avez des erreurs :

```bash
# Voir les erreurs de configuration
sudo nginx -t

# Voir les logs d'erreur
sudo tail -50 /var/log/nginx/error.log

# Vérifier les permissions
ls -la /var/www/mhstock/dist/
sudo chown -R www-data:www-data /var/www/mhstock/dist/
```

