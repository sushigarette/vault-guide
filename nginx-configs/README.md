# Configuration Nginx - Fichiers séparés par projet

Cette structure permet de gérer chaque projet indépendamment.

## Structure

- `mhcerts.conf` - Configuration pour mhcerts (projet principal)
- `mhstock.conf` - Configuration pour mhstock (gestion de stock)
- `mhcse.conf` - Configuration pour mhcse (CSE Bonnes Affaires)

## Installation

### Option 1 : Fichiers séparés (recommandé)

```bash
# 1. Copier chaque fichier dans sites-available
sudo cp nginx-configs/mhcerts.conf /etc/nginx/sites-available/mhcerts
sudo cp nginx-configs/mhstock.conf /etc/nginx/sites-available/mhstock
sudo cp nginx-configs/mhcse.conf /etc/nginx/sites-available/mhcse

# 2. Créer les liens symboliques
sudo ln -s /etc/nginx/sites-available/mhcerts /etc/nginx/sites-enabled/mhcerts
sudo ln -s /etc/nginx/sites-available/mhstock /etc/nginx/sites-enabled/mhstock
sudo ln -s /etc/nginx/sites-available/mhcse /etc/nginx/sites-enabled/mhcse

# 3. Tester la configuration
sudo nginx -t

# 4. Recharger Nginx
sudo systemctl reload nginx
```

### Option 2 : Un seul fichier (si vous préférez)

Vous pouvez aussi copier tout le contenu dans votre fichier principal `/etc/nginx/sites-available/mhcerts` en respectant l'ordre :

1. mhcerts (location /)
2. mhstock (location /mhstock/)
3. mhcse (location /mhcse/)

## Ordre important

L'ordre des `location` dans Nginx est crucial. Les locations plus spécifiques doivent être AVANT les locations générales :

1. `/mhstock/assets/` AVANT `/mhstock/`
2. `/mhcse/assets/` AVANT `/mhcse/`
3. `/assets/` AVANT `/`

## Vérification

Après configuration, vérifiez que :
- ✅ `https://mhcerts.infra.mhcomm.fr/` → mhcerts
- ✅ `https://mhcerts.infra.mhcomm.fr/mhstock/` → mhstock
- ✅ `https://mhcerts.infra.mhcomm.fr/mhcse/` → mhcse
- ✅ Les assets se chargent correctement (pas d'erreur 404)

