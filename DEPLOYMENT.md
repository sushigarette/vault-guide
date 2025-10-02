# Guide de Déploiement - Vault Guide (mhstock)

Ce guide vous explique comment déployer l'application Vault Guide sur votre serveur en parallèle de votre projet mhcert existant, sans casser la configuration Nginx actuelle.

## 🎯 Objectif

Déployer l'application de gestion de stock (mhstock) sur votre serveur en utilisant :
- Un sous-domaine dédié (recommandé)
- Ou un sous-dossier (alternative)

## 📋 Prérequis

- Serveur avec Nginx installé et configuré
- Node.js et npm installés localement
- Accès SSH à votre serveur
- Domaine configuré (optionnel mais recommandé)

## 🚀 Déploiement Rapide

### Option 1 : Déploiement Automatique (Recommandé)

1. **Configurez les variables dans `deploy.sh`** :
   ```bash
   SERVER_USER="votre-utilisateur"
   SERVER_HOST="votre-serveur.com"
   ```

2. **Lancez le déploiement** :
   ```bash
   ./deploy.sh
   ```

### Option 2 : Déploiement Manuel

1. **Build de l'application** :
   ```bash
   ./build-production.sh
   ```

2. **Upload des fichiers** :
   ```bash
   scp -r dist/ votre-utilisateur@votre-serveur.com:/var/www/mhstock/
   ```

3. **Configuration Nginx** :
   ```bash
   sudo cp nginx-vault-guide.conf /etc/nginx/sites-available/mhstock
   sudo ln -s /etc/nginx/sites-available/mhstock /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## 🌐 Configuration des Domaines

### Option A : Sous-domaine (Recommandé)

1. **Configurez votre DNS** pour pointer `mhstock.votre-domaine.com` vers votre serveur
2. **Modifiez `nginx-vault-guide.conf`** :
   ```nginx
   server_name mhstock.votre-domaine.com;
   ```
3. **Obtenez un certificat SSL** :
   ```bash
   sudo certbot --nginx -d mhstock.votre-domaine.com
   ```

### Option B : Sous-dossier

1. **Décommentez la section "Configuration alternative"** dans `nginx-vault-guide.conf`
2. **Modifiez la configuration** pour utiliser `/vault-guide/` au lieu d'un sous-domaine
3. **Redémarrez Nginx** :
   ```bash
   sudo systemctl restart nginx
   ```

## 🔧 Configuration Avancée

### Variables d'Environnement

Si votre application utilise des variables d'environnement, créez un fichier `.env.production` :

```bash
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon
```

### Base de Données

Assurez-vous que votre base de données Supabase est configurée et accessible depuis votre serveur.

### Monitoring

Pour surveiller l'application :

```bash
# Logs Nginx
sudo tail -f /var/log/nginx/vault-guide.access.log
sudo tail -f /var/log/nginx/vault-guide.error.log

# Status Nginx
sudo systemctl status nginx
```

## 🔄 Mise à Jour

Pour mettre à jour l'application :

1. **Pull des dernières modifications** :
   ```bash
   git pull origin main
   ```

2. **Redéploiement** :
   ```bash
   ./deploy.sh
   ```

## 🛠️ Dépannage

### Problèmes Courants

1. **Erreur 502 Bad Gateway** :
   - Vérifiez que les fichiers sont dans `/var/www/vault-guide/dist/`
   - Vérifiez les permissions : `sudo chown -R www-data:www-data /var/www/vault-guide/`

2. **Erreur de configuration Nginx** :
   - Testez la config : `sudo nginx -t`
   - Vérifiez les logs : `sudo journalctl -u nginx`

3. **Problème de certificat SSL** :
   - Renouvelez le certificat : `sudo certbot renew`
   - Vérifiez la configuration SSL dans Nginx

### Commandes Utiles

```bash
# Vérifier le statut de Nginx
sudo systemctl status nginx

# Recharger la configuration Nginx
sudo systemctl reload nginx

# Tester la configuration Nginx
sudo nginx -t

# Vérifier les sites activés
ls -la /etc/nginx/sites-enabled/

# Vérifier les permissions
ls -la /var/www/vault-guide/
```

## 📁 Structure des Fichiers

```
/var/www/vault-guide/
├── dist/                    # Fichiers buildés
│   ├── index.html
│   ├── assets/
│   └── version.txt
└── nginx-vault-guide.conf   # Configuration Nginx

/etc/nginx/sites-available/
└── vault-guide              # Configuration Nginx

/etc/nginx/sites-enabled/
└── vault-guide -> ../sites-available/vault-guide
```

## 🔒 Sécurité

- ✅ HTTPS activé avec certificat SSL
- ✅ Headers de sécurité configurés
- ✅ Permissions restrictives (755)
- ✅ Masquage de la version Nginx
- ✅ Gestion des erreurs personnalisées

## 📞 Support

En cas de problème, vérifiez :
1. Les logs Nginx
2. La configuration DNS
3. Les certificats SSL
4. Les permissions des fichiers
