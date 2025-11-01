# Guide d'import du stock

## Formats supportés
- **CSV** : Séparateur virgule (,)
- **JSON** : Format JSON standard

## Champs obligatoires
- `N° DE SERIE` : Numéro de série unique du produit
- `MARQUE` : Marque du produit (ex: DELL, HP, MICROSOFT)
- `MODELE` : Modèle du produit
- `TYPE DE MATERIEL` : Type d'équipement (voir valeurs autorisées)
- `STATUT` : Statut du produit (voir valeurs autorisées)
- `QUANTITE` : Quantité totale achetée
- `QUANTITE ACTUELLE` : Quantité actuellement disponible

## Champs optionnels
- `AFFECTATION` : Nom du collaborateur assigné (ex: "CARDENAS Lionel")
- `DUREE UTILISATION ANNEE` : Durée d'utilisation en années
- `DATE RECEPTION` : Date de réception (format: DD/MM/YY)
- `FOURNISSEUR` : Nom du fournisseur
- `N° FACTURE` : Numéro de facture
- `PRIX ACHAT HT` : Prix d'achat hors taxes
- `MONTANT TOTAL` : Montant total (calculé automatiquement si vide)
- `DATE SORTIE` : Date de sortie (format: DD/MM/YY)
- `QUANTITE SORTIE` : Quantité sortie
- `PRIX UNITAIRE SORTIE HT` : Prix unitaire de sortie
- `MONTANT SORTIE` : Montant de sortie
- `VALEUR ACTUELLE` : Valeur actuelle (calculée automatiquement si vide)
- `COMMENTAIRES` : Commentaires libres

## Valeurs autorisées

### TYPE DE MATERIEL
- `ordinateur`
- `imprimante`
- `claviers_souris`
- `switch`
- `router`
- `borne_wifi`
- `ecran`
- `station_ecrans`
- `chargeur_universelle`

### STATUT
- `EN_STOCK` : En stock disponible
- `SAV` : En service après-vente
- `EN_UTILISATION` : En cours d'utilisation
- `HS` : Hors service

## Calculs automatiques

### MONTANT TOTAL
Si le champ `MONTANT TOTAL` est vide, il sera calculé automatiquement :
```
MONTANT TOTAL = QUANTITE × PRIX ACHAT HT
```

### VALEUR ACTUELLE
Si le champ `VALEUR ACTUELLE` est vide, il sera calculé automatiquement :
```
VALEUR ACTUELLE = PRIX ACHAT HT × (QUANTITE ACTUELLE / QUANTITE)
```

## Exemples de données

### Produit en stock
```csv
N° DE SERIE,MARQUE,MODELE,TYPE DE MATERIEL,STATUT,AFFECTATION,QUANTITE,PRIX ACHAT HT,QUANTITE ACTUELLE
ABC123,DELL,LATITUDE,ordinateur,EN_STOCK,,1,850.00,1
```

### Produit assigné
```csv
N° DE SERIE,MARQUE,MODELE,TYPE DE MATERIEL,STATUT,AFFECTATION,QUANTITE,PRIX ACHAT HT,QUANTITE ACTUELLE
XYZ789,HP,PROBOOK,ordinateur,EN_UTILISATION,CARDENAS Lionel,1,750.00,1
```

### Produit partiellement sorti
```csv
N° DE SERIE,MARQUE,MODELE,TYPE DE MATERIEL,STATUT,AFFECTATION,QUANTITE,PRIX ACHAT HT,QUANTITE ACTUELLE,DATE SORTIE,QUANTITE SORTIE
DEF456,SAMSUNG,24" LED,ecran,EN_STOCK,,2,180.00,1,15/01/25,1
```

## Conseils d'import

1. **Vérifiez les numéros de série** : Ils doivent être uniques
2. **Utilisez les valeurs autorisées** : Respectez les valeurs pour TYPE DE MATERIEL et STATUT
3. **Format des dates** : Utilisez le format DD/MM/YY (ex: 15/01/25)
4. **Nombres décimaux** : Utilisez le point (.) comme séparateur décimal
5. **Champs vides** : Laissez vide ou utilisez "" pour les champs optionnels

## Fichiers template
- `template-import-stock.csv` : Template CSV avec exemples
- `template-import-stock.json` : Template JSON avec exemples















