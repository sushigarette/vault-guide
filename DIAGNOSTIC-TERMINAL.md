# 🔍 Diagnostic du terminal

## Problème : `pwd` n'affiche rien

Cela peut indiquer un problème avec le terminal ou l'environnement.

## Vérifications de base

### 1. Vérifier que vous êtes dans un shell valide

```bash
# Tester des commandes simples
echo "test"
whoami
date
```

### 2. Vérifier le chemin manuellement

```bash
# Essayer différentes façons d'afficher le chemin
pwd
echo $PWD
cd /var/www/mhstock && pwd
```

### 3. Vérifier que le dossier existe

```bash
# Vérifier que vous pouvez accéder au dossier
cd /var/www/mhstock
ls -la

# Si ça ne fonctionne pas, vérifier les permissions
ls -la /var/www/
ls -la /var/www/mhstock/
```

### 4. Vérifier les permissions

```bash
# Vérifier qui vous êtes
whoami

# Vérifier les permissions du dossier
ls -ld /var/www/mhstock

# Si nécessaire, demander les permissions
sudo ls -la /var/www/mhstock/
```

## Solution alternative : Utiliser le chemin absolu

Si le terminal ne fonctionne pas correctement, utilisez directement les chemins absolus :

```bash
# Aller directement au dossier
cd /var/www/mhstock

# Vérifier que vous y êtes
ls -la

# Builder depuis là
cd /var/www/mhstock && npm run build

# Vérifier le résultat
ls -la /var/www/mhstock/dist/
```

## Si rien ne fonctionne

Essayez de vous reconnecter au serveur ou ouvrir un nouveau terminal.

