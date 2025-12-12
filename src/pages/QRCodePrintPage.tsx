import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  QrCode, 
  Printer, 
  CheckSquare, 
  Square,
  Download,
  Search,
  Filter,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '@/types/stock';
import { useStockSupabase } from '@/hooks/useStockSupabase';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import { getAppUrl } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';

export const QRCodePrintPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { products, loading } = useStockSupabase();
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterEquipmentType, setFilterEquipmentType] = useState<string[]>([]);
  const [filterAssignment, setFilterAssignment] = useState<string[]>([]);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingQRCodes, setIsGeneratingQRCodes] = useState(false);

  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.assignment?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus.length === 0 || filterStatus.includes(product.status || '');
    const matchesEquipmentType = filterEquipmentType.length === 0 || filterEquipmentType.includes(product.equipmentType || '');
    const matchesAssignment = filterAssignment.length === 0 || filterAssignment.includes(product.assignment || '');

    return matchesSearch && matchesStatus && matchesEquipmentType && matchesAssignment;
  });

  // Obtenir les types d'équipement uniques
  const equipmentTypes = Array.from(new Set(products.map(p => p.equipmentType).filter(Boolean)));
  
  // Obtenir les affectations uniques
  const assignments = Array.from(new Set(products.map(p => p.assignment).filter(Boolean))).sort();

  // Fonctions pour gérer les filtres multiples
  const toggleFilter = (filterType: 'status' | 'equipmentType' | 'assignment', value: string) => {
    switch (filterType) {
      case 'status':
        setFilterStatus(prev => 
          prev.includes(value) 
            ? prev.filter(v => v !== value)
            : [...prev, value]
        );
        break;
      case 'equipmentType':
        setFilterEquipmentType(prev => 
          prev.includes(value) 
            ? prev.filter(v => v !== value)
            : [...prev, value]
        );
        break;
      case 'assignment':
        setFilterAssignment(prev => 
          prev.includes(value) 
            ? prev.filter(v => v !== value)
            : [...prev, value]
        );
        break;
    }
  };

  const clearAllFilters = () => {
    setFilterStatus([]);
    setFilterEquipmentType([]);
    setFilterAssignment([]);
  };

  // Sélectionner/désélectionner tous les produits
  const toggleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  // Sélectionner/désélectionner un produit
  const toggleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  // Générer les QR codes pour tous les produits visibles
  const generateQRCodes = async () => {
    setIsGeneratingQRCodes(true);
    
    for (const product of filteredProducts) {
      const canvas = document.getElementById(`qr-${product.id}`) as HTMLCanvasElement;
      if (canvas) {
        try {
          const qrUrl = getAppUrl(`/product/${product.id}`);
          
          await QRCode.toCanvas(canvas, qrUrl, {
            width: 120,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
        } catch (error) {
          console.error(`Erreur génération QR code pour ${product.id}:`, error);
        }
      }
    }
    
    setIsGeneratingQRCodes(false);
  };

  // Imprimer les QR codes sélectionnés
  const printQRCodes = () => {
    if (selectedProducts.size === 0) {
      alert('Veuillez sélectionner au moins un produit à imprimer.');
      return;
    }

    setIsPrinting(true);
    
    // Générer les QR codes des produits sélectionnés d'abord
    const generateSelectedQRCodes = async () => {
      const selectedProductsList = products.filter(p => selectedProducts.has(p.id));
      
      for (const product of selectedProductsList) {
        const canvas = document.getElementById(`qr-${product.id}`) as HTMLCanvasElement;
        if (canvas) {
          try {
            const qrUrl = getAppUrl(`/product/${product.id}`);
            await QRCode.toCanvas(canvas, qrUrl, {
              width: 200,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#FFFFFF'
              }
            });
          } catch (error) {
            console.error(`Erreur génération QR code pour ${product.id}:`, error);
          }
        }
      }
    };

    generateSelectedQRCodes().then(() => {
      // Créer une nouvelle fenêtre pour l'impression
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Veuillez autoriser les popups pour l\'impression.');
        setIsPrinting(false);
        return;
      }

      const selectedProductsList = products.filter(p => selectedProducts.has(p.id));
      
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Étiquettes</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @page {
              size: A4;
              margin: 0.5mm 0 0 0;
              padding: 0;
              transform: scale(1);
            }
            
            @media print {
              @page {
                margin: 0.5mm 0 0 0;
              }
            }
            
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background: white;
            }
            
            .page {
              width: 210mm;
              height: 296.5mm;
              display: grid;
              grid-template-columns: 105mm 105mm;
              grid-template-rows: repeat(8, 37mm);
              gap: 0;
              page-break-after: always;
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            .label {
              width: 105mm;
              height: 37mm;
              border: none;
              border-collapse: collapse;
              padding: 1mm;
              box-sizing: border-box;
              page-break-inside: avoid;
              overflow: hidden;
            }
            
            .label-info {
              width: 70%;
              text-align: center;
              vertical-align: middle;
              padding-right: 2mm;
            }
            
            .label-brand {
              font-weight: bold;
              font-size: 10px;
              margin-bottom: 1mm;
              line-height: 1.1;
              text-align: center;
            }
            
            .label-model {
              font-size: 8px;
              color: #666;
              margin-bottom: 1mm;
              word-break: break-word;
              line-height: 1.1;
              text-align: center;
            }
            
            .label-serial {
              font-size: 8px;
              font-family: monospace;
              color: #333;
              line-height: 1.1;
              text-align: center;
            }
            
            
            .qr-code {
              flex-shrink: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 30mm;
              height: 30mm;
            }
            
            .qr-code canvas {
              max-width: 30mm;
              max-height: 30mm;
              width: auto;
              height: auto;
            }
            
            @media print {
              * {
                box-sizing: border-box !important;
              }
              
              body {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                height: 100% !important;
              }
              
              .page {
                width: 210mm !important;
                height: 296.5mm !important;
                margin: 0 !important;
                padding: 0 !important;
                display: grid !important;
                grid-template-columns: 105mm 105mm !important;
                grid-template-rows: repeat(8, 37mm) !important;
                page-break-after: always;
              }
              
              .label {
                width: 105mm !important;
                height: 37mm !important;
                margin: 0 !important;
                padding: 1mm !important;
                border: none !important;
                border-collapse: collapse !important;
                box-sizing: border-box !important;
                display: table !important;
                page-break-inside: avoid !important;
                overflow: hidden !important;
              }

              .label-info {
                text-align: center !important;
                vertical-align: middle !important;
                width: 70% !important;
                padding-right: 2mm !important;
              }

              .label-brand, .label-model, .label-serial {
                text-align: center !important;
                display: block !important;
              }

              .qr-code {
                text-align: center !important;
                vertical-align: middle !important;
                width: 30% !important;
              }
            }
          </style>
        </head>
        <body>
          ${selectedProductsList.map((product, index) => {
            const pageNumber = Math.floor(index / 16);
            const positionInPage = index % 16;
            const isNewPage = positionInPage === 0;
            const isEndOfPage = positionInPage === 15 || index === selectedProductsList.length - 1;
            
            return `
              ${isNewPage ? `<div class="page">` : ''}
                <table class="label" style="width: 105mm; height: 37mm; border: none; border-collapse: collapse; padding: 1mm; box-sizing: border-box;">
                  <tr>
                    <td class="label-info" style="width: 70%; text-align: center; vertical-align: middle; padding-right: 2mm;">
                      <div style="text-align: center; font-weight: bold; font-size: 10px; margin-bottom: 1mm; line-height: 1.1;">${product.brand || 'N/A'}</div>
                      <div style="text-align: center; font-size: 8px; color: #666; margin-bottom: 1mm; word-break: break-word; line-height: 1.1;">${product.model || 'N/A'}</div>
                      <div style="text-align: center; font-size: 8px; font-family: monospace; color: #333; line-height: 1.1;">${product.serialNumber || 'N/A'}</div>
                    </td>
                    <td class="qr-code" style="width: 30%; text-align: center; vertical-align: middle;">
                      <canvas id="qr-${product.id}" width="80" height="80" style="max-width: 30mm; max-height: 30mm; width: auto; height: auto;"></canvas>
                    </td>
                  </tr>
                </table>
              ${isEndOfPage ? `</div>` : ''}
            `;
          }).join('')}
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();

      // Générer les QR codes dans la nouvelle fenêtre
      setTimeout(() => {
        selectedProductsList.forEach(async (product) => {
          const canvas = printWindow.document.getElementById(`qr-${product.id}`) as HTMLCanvasElement;
          if (canvas) {
            try {
              const qrUrl = getAppUrl(`/product/${product.id}`);
              await QRCode.toCanvas(canvas, qrUrl, {
                width: 100,
                margin: 1,
                color: {
                  dark: '#000000',
                  light: '#FFFFFF'
                }
              });
            } catch (error) {
              console.error(`Erreur génération QR code pour ${product.id}:`, error);
            }
          }
        });

        // Imprimer après un délai pour laisser le temps aux QR codes de se générer
        setTimeout(() => {
          // Forcer l'échelle à 100% pour l'impression
          printWindow.document.body.style.transform = 'scale(1)';
          printWindow.document.body.style.transformOrigin = 'top left';
          
          printWindow.print();
          printWindow.close();
          setIsPrinting(false);
        }, 1000);
      }, 500);
    });
  };

  // Générer les QR codes au chargement de la page et quand les filtres changent
  useEffect(() => {
    if (filteredProducts.length > 0) {
      // Attendre que les éléments canvas soient rendus dans le DOM
      const timer = setTimeout(() => {
        generateQRCodes();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [filteredProducts]);

  // Afficher un loader pendant l'authentification
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Afficher le formulaire d'authentification si l'utilisateur n'est pas connecté
  if (!user) {
    return <AuthForm onAuthSuccess={() => window.location.reload()} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des produits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Impression QR Codes</h1>
              <p className="text-muted-foreground">
                Sélectionnez les produits dont vous souhaitez imprimer les QR codes
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Format d'impression : Étiquettes 105 x 37 mm (16 par page A4 - 2 colonnes × 8 lignes)
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={generateQRCodes} 
                variant="outline"
                disabled={isGeneratingQRCodes}
                className="flex items-center gap-2"
              >
                <QrCode className="h-4 w-4" />
                {isGeneratingQRCodes ? 'Génération...' : 'Régénérer QR Codes'}
              </Button>
              <Button 
                onClick={printQRCodes} 
                disabled={selectedProducts.size === 0 || isPrinting}
                className="bg-gradient-primary"
              >
                <Printer className="h-4 w-4 mr-2" />
                {isPrinting ? 'Impression...' : `Imprimer (${selectedProducts.size} - ${Math.ceil(selectedProducts.size / 16)} page${Math.ceil(selectedProducts.size / 16) > 1 ? 's' : ''})`}
              </Button>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtres et recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Recherche */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <Input
                  placeholder="Rechercher par série, marque, modèle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filtres multiples */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Filtre par statut */}
              <div>
                <h4 className="font-semibold mb-2">Statut</h4>
                <div className="space-y-2">
                  {['EN_STOCK', 'SAV', 'EN_UTILISATION', 'HS'].map(status => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${status}`}
                        checked={filterStatus.includes(status)}
                        onCheckedChange={() => toggleFilter('status', status)}
                      />
                      <label htmlFor={`status-${status}`} className="text-sm">
                        {status === 'EN_STOCK' ? 'En stock' :
                         status === 'SAV' ? 'SAV' :
                         status === 'EN_UTILISATION' ? 'En utilisation' :
                         'Hors service'}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filtre par type de matériel */}
              <div>
                <h4 className="font-semibold mb-2">Type de matériel</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {equipmentTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type}`}
                        checked={filterEquipmentType.includes(type)}
                        onCheckedChange={() => toggleFilter('equipmentType', type)}
                      />
                      <label htmlFor={`type-${type}`} className="text-sm">
                        {type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filtre par affectation */}
              <div>
                <h4 className="font-semibold mb-2">Affectation</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {assignments.map(assignment => (
                    <div key={assignment} className="flex items-center space-x-2">
                      <Checkbox
                        id={`assignment-${assignment}`}
                        checked={filterAssignment.includes(assignment)}
                        onCheckedChange={() => toggleFilter('assignment', assignment)}
                      />
                      <label htmlFor={`assignment-${assignment}`} className="text-sm">
                        {assignment}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Effacer tous les filtres
              </Button>
              <Button
                variant="outline"
                onClick={toggleSelectAll}
                className="flex items-center gap-2"
              >
                {selectedProducts.size === filteredProducts.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                {selectedProducts.size === filteredProducts.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Liste des produits */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="relative">
              <CardContent className="p-4">
                {/* Checkbox de sélection */}
                <div className="absolute top-2 right-2">
                  <Checkbox
                    checked={selectedProducts.has(product.id)}
                    onCheckedChange={() => toggleSelectProduct(product.id)}
                  />
                </div>

                {/* Informations du produit */}
                <div className="mb-4">
                  <h3 className="font-semibold text-sm mb-1">
                    {product.brand} {product.model}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    N°: {product.serialNumber || 'N/A'}
                  </p>
                  <div className="flex gap-1 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {product.equipmentType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                    </Badge>
                    <Badge 
                      variant={product.status === 'EN_STOCK' ? 'default' : 'secondary'} 
                      className="text-xs"
                    >
                      {product.status?.replace('_', ' ') || 'N/A'}
                    </Badge>
                  </div>
                </div>

                {/* QR Code */}
                <div className="text-center">
                  {isGeneratingQRCodes ? (
                    <div className="w-[120px] h-[120px] border rounded mx-auto flex items-center justify-center bg-muted">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <canvas 
                      id={`qr-${product.id}`} 
                      width="120" 
                      height="120"
                      className="border rounded mx-auto"
                    />
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    QR Code
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Message si aucun produit trouvé */}
        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <QrCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
              <p className="text-muted-foreground">
                Aucun produit ne correspond aux critères de recherche.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Statistiques */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          {filteredProducts.length} produit(s) trouvé(s) • {selectedProducts.size} sélectionné(s)
        </div>
      </div>
    </div>
  );
};
