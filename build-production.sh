#!/bin/bash

# Script de build pour la production - Projet Vault Guide (mhstock)
# Ce script prépare l'application pour le déploiement

echo "🚀 Construction de l'application Vault Guide pour la production..."

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier que npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Installer les dépendances si nécessaire
echo "📦 Installation des dépendances..."
npm ci --production=false

# Nettoyer le dossier de build précédent
echo "🧹 Nettoyage des builds précédents..."
rm -rf dist/

# Build de l'application
echo "🔨 Construction de l'application..."
npm run build

# Vérifier que le build a réussi
if [ ! -d "dist" ]; then
    echo "❌ Le build a échoué. Le dossier 'dist' n'existe pas."
    exit 1
fi

# Créer un fichier de version
echo "📝 Création du fichier de version..."
echo "Build: $(date)" > dist/version.txt
echo "Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')" >> dist/version.txt

echo "✅ Build terminé avec succès !"
echo "📁 Dossier de déploiement: $(pwd)/dist"
echo "🌐 Prêt pour le déploiement sur le serveur"





