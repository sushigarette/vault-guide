#!/bin/bash
# Script de test pour vérifier la configuration Nginx

echo "🔍 Test de la configuration Nginx pour mhstock"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Test de la configuration
echo "1️⃣ Test de la syntaxe Nginx..."
if sudo nginx -t; then
    echo -e "${GREEN}✅ Configuration Nginx valide${NC}"
else
    echo -e "${RED}❌ Erreur dans la configuration Nginx${NC}"
    exit 1
fi

echo ""

# 2. Vérifier les fichiers
echo "2️⃣ Vérification des fichiers dans dist/..."
if [ -d "/var/www/mhstock/dist" ]; then
    echo -e "${GREEN}✅ Dossier dist/ existe${NC}"
    
    # Vérifier les fichiers importants
    files=("index.html" "sw.js" "manifest.json" "favicon.svg")
    for file in "${files[@]}"; do
        if [ -f "/var/www/mhstock/dist/$file" ]; then
            echo -e "  ${GREEN}✅ $file existe${NC}"
        else
            echo -e "  ${RED}❌ $file manquant${NC}"
        fi
    done
    
    # Vérifier les assets
    if [ -d "/var/www/mhstock/dist/assets" ]; then
        asset_count=$(ls -1 /var/www/mhstock/dist/assets/*.js 2>/dev/null | wc -l)
        echo -e "  ${GREEN}✅ Dossier assets/ existe ($asset_count fichiers JS)${NC}"
    else
        echo -e "  ${RED}❌ Dossier assets/ manquant${NC}"
    fi
else
    echo -e "${RED}❌ Dossier dist/ n'existe pas${NC}"
    echo "   Exécutez: npm run build"
    exit 1
fi

echo ""

# 3. Vérifier les permissions
echo "3️⃣ Vérification des permissions..."
if [ -r "/var/www/mhstock/dist/index.html" ]; then
    echo -e "${GREEN}✅ Permissions OK${NC}"
else
    echo -e "${YELLOW}⚠️  Problème de permissions, correction en cours...${NC}"
    sudo chown -R www-data:www-data /var/www/mhstock/dist/
    sudo chmod -R 755 /var/www/mhstock/dist/
    echo -e "${GREEN}✅ Permissions corrigées${NC}"
fi

echo ""

# 4. Test des URLs
echo "4️⃣ Test des URLs (depuis localhost)..."
echo ""

urls=(
    "http://localhost/mhstock/"
    "http://localhost/sw.js"
    "http://localhost/manifest.json"
    "http://localhost/favicon.svg"
)

for url in "${urls[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    if [ "$status" = "200" ]; then
        echo -e "  ${GREEN}✅ $url → $status${NC}"
    elif [ "$status" = "404" ]; then
        echo -e "  ${RED}❌ $url → $status (Not Found)${NC}"
    else
        echo -e "  ${YELLOW}⚠️  $url → $status${NC}"
    fi
done

echo ""
echo "✅ Tests terminés !"

