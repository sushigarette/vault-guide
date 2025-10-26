# Guide d'import - Nouvelle structure

## 📋 Format du fichier CSV

Votre fichier d'import doit contenir les colonnes suivantes **dans cet ordre** :

⚠️ **IMPORTANT** : Toutes les colonnes sont maintenant **OBLIGATOIRES**. Si une donnée est manquante, le système générera automatiquement une valeur "FAKE" pour remplacer la donnée manquante.

| Colonne | Nom dans le fichier | Type | Obligatoire | Exemple |
|---------|---------------------|------|-------------|---------|
| 1 | N° SERIE | Texte | ✅ **Obligatoire** | `3514C008` ou `FAKE_SERIAL_abc123` |
| 2 | MARQUE | Texte | ✅ **Obligatoire** | `CANON` ou `FAKE_BRAND_xyz789` |
| 3 | MODELE ou DESCRIPTION | Texte | ✅ **Obligatoire** | `Imprimante ISENSYS MF443dw` ou `FAKE_MODEL_def456` |
| 4 | TYPE MATERIEL | Liste | ✅ **Obligatoire** | `Imprimante` (voir liste ci-dessous) |
| 5 | AFFECTATION | Texte | ✅ **Obligatoire** | `Jean Dupont` ou `FAKE_ASSIGNMENT_ghi789` |
| 6 | DATE ENTREE | Date | ✅ **Obligatoire** | `2022-01-17`, `14/04/25`, `14/04/2025` ou date du jour |
| 7 | FOURNISSEUR | Texte | ✅ **Obligatoire** | `INMACWSTORE` ou `FAKE_SUPPLIER_jkl012` |
| 8 | N° FACTURE | Texte | ✅ **Obligatoire** | `FAC-2022-001` ou `FAKE_INVOICE_mno345` |
| 9 | PRIX ACHAT HT | Nombre | ✅ **Obligatoire** | `329.00` ou nombre aléatoire |
| 10 | DUREE PROBABLE D'UTILISATION en mois | Nombre | ✅ **Obligatoire** | `60` (5 ans) ou nombre aléatoire |
| 11 | DATE REEVALUATION | Date | ✅ **Obligatoire** | `2027-01-17`, `14/04/25`, `14/04/2025` ou date du jour |

## 🤖 Génération automatique de données FAKE

Si une colonne est vide ou manquante dans votre fichier, le système générera automatiquement une valeur de remplacement :

### **Pour les champs texte :**
- Format : `FAKE_[NOM_DU_CHAMP]_[ID_ALEATOIRE]`
- Exemples : `FAKE_SERIAL_abc123`, `FAKE_BRAND_xyz789`, `FAKE_SUPPLIER_def456`

### **Pour les champs numériques :**
- **Prix** : `null` si manquant ou vide (les prix à 0 sont conservés)
- **Durée** : `null` si manquante, vide ou égale à 0

### **Pour les dates :**
- **Date d'entrée** : Date du jour d'import
- **Date de réévaluation** : Date du jour d'import

**Formats de date acceptés :**
- `YYYY-MM-DD` : `2025-04-14`
- `DD/MM/YYYY` : `14/04/2025`
- `DD/MM/YY` : `14/04/25` (25 = 2025, 24 = 2024, etc.)
- Objets Date Excel (convertis automatiquement)

### **Pour le type de matériel :**
- Si non spécifié : `pc_portable` par défaut

## 🏷️ Types de matériel acceptés

Voici la liste des types de matériel (respectez la casse) :

- `Accessoires`
- `Borne Wifi`
- `Casque audio`
- `Chargeur tel`
- `Chargeur universel`
- `Ecran PC`
- `Ecran TV`
- `Imprimante`
- `Kit clavier/souris`
- `Visioconf`
- `Mobilier`
- `UC`
- `PC Portable`
- `Routeur`
- `Sacoche`
- `Station d'accueil`
- `Station d'écrans`
- `Tel Mobile`
- `Webcam`

## 📝 Exemple de fichier (Excel ou CSV)

### Format Excel (.xlsx) - **Recommandé** ⭐
Créez un fichier Excel avec ces colonnes dans la première feuille :

| N° SERIE | MARQUE | MODELE ou DESCRIPTION | TYPE MATERIEL | AFFECTATION | DATE ENTREE | FOURNISSEUR | N° FACTURE | PRIX ACHAT HT | DUREE PROBABLE D'UTILISATION en mois | DATE REEVALUATION |
|----------|--------|----------------------|---------------|-------------|-------------|-------------|------------|---------------|-------------------------------------|------------------|
| 3514C008 | CANON | Imprimante ISENSYS MF443dw | Imprimante | | 2022-01-17 | INMACWSTORE | FAC-2022-001 | 329.00 | 60 | 2027-01-17 |
| SMP222QD8 | LENOVO | PC Portable THINKBOOK 15 | PC Portable | Jean Dupont | 2021-10-12 | INMACWSTORE | FAC-2021-089 | 805.00 | 36 | 2024-10-12 |
| XU2294HSU-B1 | IIYAMA | Ecran PROLITE | Ecran PC | Flex Office | 2022-03-22 | LDLC PRO | FAC-2022-045 | 131.00 | 60 | 2027-03-22 |
| | | | | | | | | | | |
| **Exemple avec données FAKE générées automatiquement :** |
| FAKE_SERIAL_abc123 | FAKE_BRAND_xyz789 | FAKE_MODEL_def456 | PC Portable | FAKE_ASSIGNMENT_ghi789 | 2024-01-15 | FAKE_SUPPLIER_jkl012 | FAKE_INVOICE_mno345 | 456 | 72 | 2024-01-15 |

### Format CSV
```csv
N° SERIE,MARQUE,MODELE ou DESCRIPTION,TYPE MATERIEL,AFFECTATION,DATE ENTREE,FOURNISSEUR,N° FACTURE,PRIX ACHAT HT,DUREE PROBABLE D'UTILISATION en mois,DATE REEVALUATION
3514C008,CANON,Imprimante ISENSYS MF443dw,Imprimante,Jean Dupont,17/01/22,INMACWSTORE,FAC-2022-001,329.00,60,17/01/27
SMP222QD8,LENOVO,PC Portable THINKBOOK 15,PC Portable,Marie Martin,12/10/21,INMACWSTORE,FAC-2021-089,805.00,36,12/10/24
XU2294HSU-B1,IIYAMA,Ecran PROLITE,Ecran PC,Flex Office,22/03/22,LDLC PRO,FAC-2022-045,131.00,60,22/03/27
,,,,,,,,,,
FAKE_SERIAL_abc123,FAKE_BRAND_xyz789,FAKE_MODEL_def456,PC Portable,FAKE_ASSIGNMENT_ghi789,15/01/24,FAKE_SUPPLIER_jkl012,FAKE_INVOICE_mno345,456,72,15/01/24
```

### 📁 Fichiers d'exemple disponibles

**Fichiers CSV d'exemple créés pour vous :**

1. **`exemple-import-complet.csv`** - 30 produits avec données complètes
   - Tous les types de matériel représentés
   - Dates au format DD/MM/YY (comme dans votre Excel)
   - Données réalistes basées sur votre inventaire

2. **`exemple-import-avec-fake.csv`** - Même contenu + ligne vide pour tester la génération FAKE
   - Parfait pour tester le système de génération automatique
   - Montre comment les données manquantes sont gérées

3. **`INSTRUCTIONS-EXCEL.md`** - Instructions pour créer le fichier Excel d'exemple
   - Guide étape par étape pour convertir le CSV en Excel
   - Format des dates et types de matériel expliqués

## 🔧 Étapes pour nettoyer et importer

### 1. Nettoyer la base de données

Exécutez le script SQL dans Supabase Dashboard > SQL Editor :

```bash
# Contenu du fichier: sql/migrate-new-structure.sql
```

Ou via la console SQL de Supabase.

### 2. Préparer votre fichier

- ✅ **Formats acceptés**: Excel (.xlsx, .xls) ou CSV UTF-8
- ✅ **Excel recommandé** : Plus facile à utiliser, gestion automatique des formats
- ✅ **CSV** : Séparateur virgule (`,`), guillemets pour les valeurs contenant des virgules
- ✅ Première ligne: en-têtes de colonnes
- ✅ Toutes les colonnes sont optionnelles (peuvent être vides)

### 3. Importer via l'interface web

1. Allez sur votre site web
2. Cliquez sur "Importer"
3. Sélectionnez votre fichier CSV
4. Vérifiez les données dans l'aperçu
5. Lancez l'import

## 📊 Après l'import

Le système va automatiquement :
- ✅ Générer un QR code pour chaque produit
- ✅ Définir le statut sur "EN_STOCK" par défaut
- ✅ Créer les entrées de collaborateurs si nécessaire
- ✅ Calculer les dates de réévaluation si manquantes

## ⚠️ Points d'attention

- **Tous les champs sont optionnels** - vous pouvez laisser des colonnes vides
- Les N° SERIE doivent être uniques (si renseignés)
- Les dates au format: `YYYY-MM-DD` (ex: `2022-01-17`)
- Les prix avec point comme séparateur décimal (ex: `329.00`)
- La durée d'utilisation en mois (60 mois = 5 ans)
- Le système générera automatiquement un ID unique pour chaque produit
