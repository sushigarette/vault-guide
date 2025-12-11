# 🔍 Vérification du build et du cache

## Problème : L'erreur 404 persiste après les modifications

Cela peut venir de :
1. Le build n'a pas été fait avec les nouvelles modifications
2. Le cache du navigateur utilise encore l'ancienne version
3. Le fichier JS n'a pas été mis à jour

## Étapes de vérification

### 1. Vérifier que le code a été commité et pushé

```bash
# Sur votre machine locale (Mac)
git status
git add .
git commit -m "Fix: Add basename to BrowserRouter for /mhstock/"
git push origin main
```

### 2. Sur le Raspberry Pi, récupérer les modifications

```bash
cd /var/www/mhstock
git pull origin main

# Vérifier que le fichier a bien été modifié
grep "basename" src/App.tsx
```

### 3. Rebuilder le projet

```bash
# Nettoyer et rebuilder
npm run build

# Vérifier que le nouveau build est différent
ls -la dist/assets/
# Le nom du fichier JS devrait être différent (ex: main-XXXXX.js)
```

### 4. Vérifier les permissions et recharger Nginx

```bash
sudo chown -R www-data:www-data /var/www/mhstock/dist/
sudo systemctl reload nginx
```

### 5. Vider le cache du navigateur

**Important** : Le navigateur peut avoir mis en cache l'ancien fichier JS.

#### Chrome/Edge :
- Ouvrez les DevTools (F12)
- Clic droit sur le bouton de rechargement
- Sélectionnez "Vider le cache et actualiser de force" (ou "Empty Cache and Hard Reload")

#### Firefox :
- Ctrl+Shift+Delete (Windows/Linux) ou Cmd+Shift+Delete (Mac)
- Cochez "Cache" et "Cookies"
- Cliquez sur "Effacer maintenant"

#### Safari :
- Cmd+Option+E (vider le cache)
- Cmd+Shift+R (recharger sans cache)

### 6. Tester en navigation privée

Ouvrez une fenêtre de navigation privée et testez l'URL pour éviter le cache.

## Vérification du fichier JS

Pour vérifier que le nouveau build est bien servi :

1. Ouvrez les DevTools (F12)
2. Onglet Network
3. Rechargez la page
4. Cherchez le fichier `main-*.js`
5. Cliquez dessus → onglet Response
6. Cherchez "basename" dans le contenu
7. Vous devriez voir `basename:"/mhstock"`

Si vous ne voyez pas `basename:"/mhstock"`, c'est que l'ancien build est encore servi.

## Solution alternative : Forcer le rechargement

Si le cache persiste, vous pouvez forcer le rechargement en ajoutant un paramètre de version dans l'URL :
- `https://mhcerts.infra.mhcomm.fr/mhstock/?v=2`

Mais normalement, vider le cache devrait suffire.

