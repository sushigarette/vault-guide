import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Download } from 'lucide-react';
import { ImportResult } from '@/types/stock';

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<ImportResult>;
}

export const ImportDialog = ({ isOpen, onClose, onImport }: ImportDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    try {
      const importResult = await onImport(file);
      setResult(importResult);
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      setResult({
        success: 0,
        errors: ['Erreur lors de l\'import du fichier'],
        total: 0,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  const downloadTemplate = () => {
    // Créer un template avec le nouveau modèle de données
    const templateData = [
      ['N° DE SERIE', 'MARQUE', 'MODELE', 'TYPE DE MATERIEL', 'STATUT', 'AFFECTATION', 'DUREE UTILISATION ANNEE', 'DATE RECEPTION', 'FOURNISSEUR', 'N° FACTURE', 'QUANTITE', 'PRIX ACHAT HT', 'MONTANT TOTAL', 'DATE SORTIE', 'QUANTITE SORTIE', 'PRIX UNITAIRE SORTIE HT', 'MONTANT SORTIE', 'QUANTITE ACTUELLE', 'VALEUR ACTUELLE', 'COMMENTAIRES'],
      ['0B3337H214733F', 'MICROSOFT', 'SURFACE GO3', 'ordinateur', 'EN_STOCK', 'CARDENAS Lionel', '1', '15/01/25', 'MICROSOFT', 'FAC-2025-001', '1', '620.00', '620.00', '', '', '', '', '1', '620.00', 'Tablette Surface Go3 avec clavier et stylet'],
      ['ABC123456789', 'DELL', 'LATITUDE 5520', 'ordinateur', 'EN_UTILISATION', 'AÏSSA ABDI Djanet', '2', '10/12/23', 'DELL', 'FAC-2023-045', '1', '850.00', '850.00', '', '', '', '', '1', '850.00', 'Ordinateur portable professionnel'],
      ['XYZ987654321', 'HP', 'PROBOOK 450', 'ordinateur', 'SAV', '', '3', '05/03/22', 'HP', 'FAC-2022-012', '1', '750.00', '750.00', '', '', '', '', '1', '750.00', 'En réparation - problème écran'],
      ['DEF456789123', 'CISCO', 'SG350-28', 'switch', 'EN_STOCK', '', '0', '20/11/24', 'CISCO', 'FAC-2024-078', '1', '450.00', '450.00', '', '', '', '', '1', '450.00', 'Switch 28 ports Gigabit'],
      ['GHI789123456', 'NETGEAR', 'AC1200', 'borne_wifi', 'EN_UTILISATION', 'MARTIN Pierre', '1', '15/09/24', 'NETGEAR', 'FAC-2024-056', '1', '120.00', '120.00', '', '', '', '', '1', '120.00', 'Point d\'accès WiFi']
    ];

    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_import_stock.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import massif de produits</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!result && (
            <>
              <div className="text-center">
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Importer des produits depuis Excel</h3>
                <p className="text-muted-foreground mb-4">
                  Téléchargez le template et remplissez-le avec vos données, puis importez le fichier.
                </p>
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="mb-4"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger le template
                </Button>
              </div>

              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <div className="mb-4">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isImporting}
                    >
                      Sélectionner un fichier
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv,.json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Formats acceptés: .xlsx, .xls, .csv, .json
                  </p>
                </div>
              </div>

              {file && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span className="font-medium">{file.name}</span>
                      <Badge variant="secondary">
                        {(file.size / 1024).toFixed(1)} KB
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {isImporting && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Import en cours...</p>
              </div>
              <Progress value={66} className="w-full" />
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <Alert className={result.errors.length > 0 ? 'border-warning' : 'border-success'}>
                <div className="flex items-center gap-2">
                  {result.errors.length > 0 ? (
                    <XCircle className="h-4 w-4 text-warning" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-success" />
                  )}
                  <AlertDescription>
                    Import terminé: {result.imported} produits importés
                  </AlertDescription>
                </div>
              </Alert>

              {result.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-destructive">Erreurs rencontrées:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-success/10 rounded-lg">
                  <div className="text-2xl font-bold text-success">{result.imported}</div>
                  <div className="text-sm text-muted-foreground">Importés</div>
                </div>
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <div className="text-2xl font-bold text-destructive">{result.errors.length}</div>
                  <div className="text-sm text-muted-foreground">Erreurs</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {result ? 'Fermer' : 'Annuler'}
          </Button>
          {file && !result && (
            <Button
              onClick={handleImport}
              disabled={isImporting}
              className="bg-gradient-primary"
            >
              {isImporting ? 'Import en cours...' : 'Importer'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
