#!/bin/bash

# Script de déploiement pour Vault Guide (mhstock)
# Ce script déploie l'application sur votre serveur

# Configuration - MODIFIEZ CES VARIABLES SELON VOTRE SERVEUR
SERVER_USER="votre-utilisateur"  # Remplacez par votre nom d'utilisateur
SERVER_HOST="votre-serveur.com"  # Remplacez par l'IP ou domaine de votre serveur
SERVER_PATH="/var/www/mhstock"  # Chemin sur le serveur
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Déploiement de Vault Guide (mhstock)${NC}"

# Vérifier que le build existe
if [ ! -d "dist" ]; then
    echo -e "${YELLOW}⚠️  Le dossier 'dist' n'existe pas. Lancement du build...${NC}"
    ./build-production.sh
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Le build a échoué. Arrêt du déploiement.${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}📦 Préparation des fichiers...${NC}"

# Créer un fichier de déploiement temporaire
tar -czf vault-guide-deploy.tar.gz -C dist .

echo -e "${BLUE}📤 Upload vers le serveur...${NC}"

# Upload vers le serveur
scp vault-guide-deploy.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/

echo -e "${BLUE}🔧 Installation sur le serveur...${NC}"

# Exécuter les commandes sur le serveur
ssh ${SERVER_USER}@${SERVER_HOST} << EOF
    echo "📁 Création du dossier de déploiement..."
    sudo mkdir -p ${SERVER_PATH}
    
    echo "📦 Extraction des fichiers..."
    cd ${SERVER_PATH}
    sudo tar -xzf /tmp/vault-guide-deploy.tar.gz
    
    echo "🔐 Configuration des permissions..."
    sudo chown -R www-data:www-data ${SERVER_PATH}
    sudo chmod -R 755 ${SERVER_PATH}
    
    echo "🧹 Nettoyage..."
    rm /tmp/vault-guide-deploy.tar.gz
    
    echo "✅ Installation terminée sur le serveur"
EOF

echo -e "${BLUE}🌐 Configuration de Nginx...${NC}"

# Upload de la configuration Nginx
scp nginx-vault-guide.conf ${SERVER_USER}@${SERVER_HOST}:/tmp/

# Configuration Nginx sur le serveur
ssh ${SERVER_USER}@${SERVER_HOST} << EOF
    echo "📝 Installation de la configuration Nginx..."
    sudo cp /tmp/nginx-vault-guide.conf ${NGINX_SITES_AVAILABLE}/mhstock
    
    echo "🔗 Activation du site..."
    sudo ln -sf ${NGINX_SITES_AVAILABLE}/mhstock ${NGINX_SITES_ENABLED}/mhstock
    
    echo "🧪 Test de la configuration Nginx..."
    sudo nginx -t
    
    if [ \$? -eq 0 ]; then
        echo "🔄 Redémarrage de Nginx..."
        sudo systemctl reload nginx
        echo "✅ Nginx rechargé avec succès"
    else
        echo "❌ Erreur dans la configuration Nginx"
        exit 1
    fi
    
    echo "🧹 Nettoyage..."
    rm /tmp/nginx-vault-guide.conf
EOF

# Nettoyage local
rm vault-guide-deploy.tar.gz

echo -e "${GREEN}🎉 Déploiement terminé avec succès !${NC}"
echo -e "${YELLOW}📝 N'oubliez pas de :${NC}"
echo -e "   1. Configurer votre domaine DNS pour pointer vers votre serveur"
echo -e "   2. Obtenir un certificat SSL avec Let's Encrypt :"
echo -e "      sudo certbot --nginx -d vault-guide.votre-domaine.com"
echo -e "   3. Modifier la configuration Nginx avec votre vrai domaine"
echo -e "   4. Redémarrer Nginx : sudo systemctl restart nginx"
