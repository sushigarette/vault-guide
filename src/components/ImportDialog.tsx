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
    // Créer un template avec le nouveau modèle de données (11 colonnes)
    const templateData = [
      ['N° SERIE', 'MARQUE', 'MODELE ou DESCRIPTION', 'TYPE MATERIEL', 'AFFECTATION', 'DATE ENTREE', 'FOURNISSEUR', 'N° FACTURE', 'PRIX ACHAT HT', 'DUREE PROBABLE D\'UTILISATION en mois', 'DATE REEVALUATION'],
      ['3514C008', 'CANON', 'Imprimante ISENSYS MF443dw', 'Imprimante', 'Jean Dupont', '17/01/22', 'INMACWSTORE', 'FAC-2022-001', '329.00', '60', '17/01/27'],
      ['SMP222QD8', 'LENOVO', 'PC Portable THINKBOOK 15', 'PC Portable', 'Marie Martin', '12/10/21', 'INMACWSTORE', 'FAC-2021-089', '805.00', '36', '12/10/24'],
      ['XU2294HSU-B1', 'IIYAMA', 'Ecran PROLITE', 'Ecran PC', 'Flex Office', '22/03/22', 'LDLC PRO', 'FAC-2022-045', '131.00', '60', '22/03/27'],
      ['5MWCH9DW110194', 'SAMSUNG', 'Ecran 24"', 'Ecran PC', 'Sarah Johnson', '05/06/23', 'LDLC PRO', 'FAC-2023-156', '98.00', '60', '05/06/28'],
      ['352904115200385', 'IPHONE', 'Iphone 11 128 Go', 'Tel Mobile', 'Communication', '23/03/23', 'BACKMARKET', 'FAC-2023-034', '332.00', '48', '23/03/27'],
      ['UP701QL9', 'LENOVO', 'Station accueil Thinkpad USB 3.0 Pro', 'Station d\'accueil', 'Nicolas MONNIER', '04/07/23', 'ARTO / VIA BACK MARKET', 'FAC-2023-078', '42.00', '60', '04/07/28'],
      ['ED40A00FHD', 'EDENWOOD', 'Ecran TV et support', 'Ecran TV', 'MHComm Interne', '16/05/23', 'ELECTRO DEPOT', 'FAC-2023-067', '217.00', '60', '16/05/28'],
      ['', '', '', '', '', '', '', '', '', '', ''],
      ['FAKE_SERIAL_abc123', 'FAKE_BRAND_xyz789', 'FAKE_MODEL_def456', 'PC Portable', 'FAKE_ASSIGNMENT_ghi789', '15/01/24', 'FAKE_SUPPLIER_jkl012', 'FAKE_INVOICE_mno345', '456', '72', '15/01/24']
    ];

    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_import_stock_nouveau.csv');
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
                  Téléchargez le template avec les 11 nouvelles colonnes et remplissez-le avec vos données. 
                  <br />
                  <strong>Toutes les colonnes sont obligatoires</strong> - les données manquantes seront remplacées par des valeurs "FAKE".
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
