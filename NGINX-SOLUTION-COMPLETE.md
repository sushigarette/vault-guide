# Solution complète Nginx pour mhstock

## Option 1 : Servir mhstock à la racine (Recommandé)

Si vous voulez accéder à mhstock directement à `https://mhcerts.infra.mhcomm.fr/` (sans `/mhstock/`), utilisez cette configuration :

```nginx
# Configuration pour mhstock à la racine
location / {
    root /var/www/mhstock/dist;
    index index.html;
    try_files $uri $uri/ /index.html;

    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}

# Assets statiques
location /assets/ {
    root /var/www/mhstock/dist;
    expires 1y;
    add_header Cache-Control "public, immutable";
    
    location ~* \.js$ {
        add_header Content-Type "application/javascript; charset=utf-8";
    }
    
    location ~* \.css$ {
        add_header Content-Type "text/css; charset=utf-8";
    }
}

# Service Worker et fichiers statiques
location ~* ^/(sw\.js|manifest\.json|favicon\.(ico|svg)|apple-touch-icon\.png|icon-.*\.png|robots\.txt|placeholder\.svg)$ {
    root /var/www/mhstock/dist;
    add_header Cache-Control "public, max-age=3600";
}
```

## Option 2 : Garder /mhstock/ et corriger la config

Si vous devez garder `/mhstock/`, utilisez cette configuration (et remettre `base: "/mhstock/"` dans vite.config.ts) :

```nginx
# Assets pour mhstock (AVANT /mhstock/)
location /mhstock/assets/ {
    alias /var/www/mhstock/dist/assets/;
    expires 1y;
    add_header Cache-Control "public, immutable";
    
    location ~* \.js$ {
        add_header Content-Type "application/javascript; charset=utf-8";
    }
    
    location ~* \.css$ {
        add_header Content-Type "text/css; charset=utf-8";
    }
}

# Service Worker et fichiers statiques
location ~* ^/mhstock/(sw\.js|manifest\.json|favicon\.(ico|svg)|apple-touch-icon\.png|icon-.*\.png|robots\.txt|placeholder\.svg)$ {
    alias /var/www/mhstock/dist/;
    rewrite ^/mhstock/(.*)$ /$1 break;
    add_header Cache-Control "public, max-age=3600";
}

# Configuration principale pour mhstock
location /mhstock/ {
    alias /var/www/mhstock/dist/;
    index index.html;
    try_files $uri $uri/ @mhstock_fallback;

    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}

# Fallback pour routing React
location @mhstock_fallback {
    rewrite ^/mhstock/(.*)$ /mhstock/index.html last;
}
```

## Quelle option choisir ?

- **Option 1** : Plus simple, pas besoin de base path dans le code
- **Option 2** : Si vous avez d'autres applications sur le même domaine et que mhstock doit être dans `/mhstock/`

