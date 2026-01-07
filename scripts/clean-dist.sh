#!/bin/bash
# Script pour nettoyer le dossier dist avant le build
# Résout les problèmes de permissions avec les fichiers copiés

set -e

echo "🧹 Nettoyage du dossier dist..."

# Supprimer le dossier dist s'il existe
if [ -d "dist" ]; then
    echo "Suppression du dossier dist..."
    rm -rf dist
fi

# Créer un nouveau dossier dist vide
mkdir -p dist

echo "✅ Dossier dist nettoyé avec succès !"







