import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProductForm } from '@/components/ProductForm';
import { BarcodeDisplay } from '@/components/BarcodeDisplay';
import { BarcodePrinter } from '@/components/BarcodePrinter';
import { 
  ArrowLeft, 
  Package, 
  Edit, 
  Printer,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Building,
  FileText,
  Hash,
  QrCode,
  Barcode
} from 'lucide-react';
import { Product, StockMovement, ProductModification } from '@/types/stock';
import { useStockSupabase as useStock } from '@/hooks/useStockSupabase';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, modifications, updateProduct, loadModifications, loadProducts, loading } = useStock();
  const [product, setProduct] = useState<Product | null>(null);
  const [productModifications, setProductModifications] = useState<ProductModification[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      // Si les produits sont en cours de chargement, attendre
      if (loading) {
        setIsLoading(true);
        setNotFound(false);
        return;
      }

      // Si les produits sont chargés, chercher le produit
      if (products.length > 0) {
        const foundProduct = products.find(p => p.id === id);
        if (foundProduct) {
          setProduct(foundProduct);
          setNotFound(false);
          setIsLoading(false);
          // Récupérer les modifications pour ce produit
          const productMods = modifications.filter(m => m.productId === id);
          setProductModifications(productMods);
        } else {
          // Produit non trouvé
          setNotFound(true);
          setIsLoading(false);
        }
      } else {
        // Pas de produits chargés et pas en cours de chargement
        setNotFound(true);
        setIsLoading(false);
      }
    }
  }, [id, products, modifications, loading]);

  // Charger les modifications quand le produit change
  useEffect(() => {
    if (id) {
      loadModifications(id);
    }
  }, [id]); // Retirer loadModifications des dépendances pour éviter la boucle

  // Générer les codes visuels quand le produit change
  useEffect(() => {
    if (product && product.serialNumber) {
      generateQRCode();
      generateBarcode();
    }
  }, [product]);

  // Affichage de l'état de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Chargement du produit...</h2>
          <p className="text-muted-foreground">
            Veuillez patienter pendant que nous récupérons les informations.
          </p>
        </div>
      </div>
    );
  }

  // Affichage de l'état "non trouvé"
  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Produit non trouvé</h2>
          <p className="text-muted-foreground mb-4">
            Le produit que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getStockStatus = (status: string) => {
    switch (status) {
      case 'EN_STOCK':
        return { 
          status: 'En stock', 
          color: 'success', 
          icon: CheckCircle,
          description: 'Produit disponible en stock'
        };
      case 'SAV':
        return { 
          status: 'SAV', 
          color: 'warning', 
          icon: AlertTriangle,
          description: 'Produit en service après-vente'
        };
      case 'EN_UTILISATION':
        return { 
          status: 'En utilisation', 
          color: 'purple', 
          icon: CheckCircle,
          description: 'Produit actuellement utilisé'
        };
      case 'HS':
        return { 
          status: 'HS', 
          color: 'destructive', 
          icon: XCircle,
          description: 'Produit hors service'
        };
      default:
        return { 
          status: 'Inconnu', 
          color: 'outline', 
          icon: AlertTriangle,
          description: 'Statut non défini'
        };
    }
  };

  const stockInfo = getStockStatus(product.status);
  const StockIcon = stockInfo.icon;

  // Générer le QR code
  const generateQRCode = async () => {
    if (product && product.id) {
      const qrUrl = `${window.location.origin}/product/${product.id}`;
      const canvas = document.getElementById(`qr-${product.id}`) as HTMLCanvasElement;
      if (canvas) {
        try {
          await QRCode.toCanvas(canvas, qrUrl, {
            width: 150,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
        } catch (error) {
          console.error('Erreur génération QR code:', error);
        }
      }
    }
  };

  // Générer le code-barres
  const generateBarcode = () => {
    if (product && product.serialNumber) {
      const canvas = document.getElementById(`barcode-${product.id}`) as HTMLCanvasElement;
      if (canvas) {
        try {
          // Calculer la largeur adaptative basée sur la longueur du numéro de série
          const serialLength = product.serialNumber.length;
          const adaptiveWidth = Math.max(1, Math.min(3, 300 / (serialLength * 8)));
          
          JsBarcode(canvas, product.serialNumber, {
            format: "CODE128",
            width: adaptiveWidth,
            height: 60,
            displayValue: true,
            fontSize: 10,
            margin: 5
          });
        } catch (error) {
          console.error('Erreur génération code-barres:', error);
        }
      }
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const handleShowBarcodes = () => {
    setShowBarcodeModal(true);
  };

  const handleProductSubmit = async (data: any) => {
    if (product) {
      try {
        // Mettre à jour le produit dans la base de données
        const updatedProductData = await updateProduct(product.id, data);
        setShowEditModal(false);
        
        // Mettre à jour le produit local avec les nouvelles données
        if (updatedProductData) {
          setProduct(updatedProductData);
        } else {
          // Si updateProduct ne retourne pas les données, recharger depuis la liste
          const updatedProduct = products.find(p => p.id === product.id);
          if (updatedProduct) {
            setProduct(updatedProduct);
          }
        }
        
        // Recharger les modifications pour ce produit
        await loadModifications(product.id);
      } catch (error) {
        console.error('Erreur lors de la mise à jour du produit:', error);
      }
    }
  };

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
            Retour à la liste
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.brand} {product.model}</h1>
              <p className="text-muted-foreground text-lg">N° Série: {product.serialNumber}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleEdit} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button onClick={handleShowBarcodes} variant="outline">
                <QrCode className="h-4 w-4 mr-2" />
                Voir codes
              </Button>
              <Button onClick={handlePrint} className="bg-gradient-primary">
                <Printer className="h-4 w-4 mr-2" />
                Imprimer codes
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations de base */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Informations du produit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">N° de série</label>
                    <p className="font-mono text-lg">{product.serialNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Référence interne</label>
                    <p className="font-mono text-lg">{product.parcNumber || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Marque</label>
                    <p className="text-lg">{product.brand}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Modèle</label>
                    <p className="text-lg">{product.model}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type de matériel</label>
                    <Badge variant="outline" className="text-sm">
                      {product.equipmentType ? 
                        product.equipmentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                        'Non défini'
                      }
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Statut</label>
                    <Badge variant={stockInfo.color as any}>
                      {stockInfo.status}
                    </Badge>
                  </div>
                </div>
                
                
                {product.supplier && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fournisseur</label>
                    <p className="text-lg flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {product.supplier}
                    </p>
                  </div>
                )}
                
                {product.invoiceNumber && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">N° de facture</label>
                    <p className="text-lg flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {product.invoiceNumber}
                    </p>
                  </div>
                )}
                
                {product.assignment && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Affectation</label>
                    <p className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {product.assignment}
                    </p>
                  </div>
                )}
                
                {product.comments && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Commentaires</label>
                    <p className="text-lg">{product.comments}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informations d'utilisation */}
            {(product.usageDurationYears || product.entryDate || product.exitDate) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Informations d'utilisation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {product.usageDurationYears && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Durée d'utilisation</label>
                        <p className="text-lg">{product.usageDurationYears} année{product.usageDurationYears > 1 ? 's' : ''}</p>
                      </div>
                    )}
                    {product.entryDate && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Date de réception</label>
                        <p className="text-lg">{new Date(product.entryDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                    )}
                    {product.exitDate && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Date de sortie</label>
                        <p className="text-lg">{new Date(product.exitDate).toLocaleDateString('fr-FR')}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}


            {/* Historique des modifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Historique des modifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productModifications.length > 0 ? (
                  <div className="space-y-3">
                    {productModifications.slice(0, 10).map((modification) => (
                      <div key={modification.id} className="flex items-start justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {modification.modificationType === 'CREATE' ? 'Création' :
                               modification.modificationType === 'UPDATE' ? 'Modification' : 'Suppression'}
                            </Badge>
                            <span className="text-sm font-medium">{modification.fieldName}</span>
                          </div>
                          {modification.oldValue !== null && modification.newValue !== null && (
                            <div className="text-sm text-muted-foreground">
                              <span className="line-through">{modification.oldValue || 'Vide'}</span>
                              <span className="mx-2">→</span>
                              <span className="text-foreground font-medium">{modification.newValue || 'Vide'}</span>
                            </div>
                          )}
                          {modification.modificationType === 'CREATE' && (
                            <div className="text-sm text-muted-foreground">
                              {modification.newValue || 'Vide'}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            Par {modification.modifiedBy}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(modification.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Aucune modification enregistrée pour ce produit
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statut du stock */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StockIcon className="h-5 w-5" />
                  Statut du stock
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{product.currentQuantity}</div>
                  <Badge variant={stockInfo.color as any} className="mb-2">
                    {stockInfo.status === 'En stock' ? (
                      <div className="text-center">
                        <div>EN</div>
                        <div>STOCK</div>
                      </div>
                    ) : (
                      stockInfo.status
                    )}
                  </Badge>
                  <p className="text-sm text-muted-foreground">{stockInfo.description}</p>
                </div>
                
              </CardContent>
            </Card>

            {/* Codes d'identification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  Codes d'identification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* QR Code visuel */}
                {product.serialNumber && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4" />
                      <span className="text-sm font-medium">QR Code</span>
                    </div>
                    <div className="p-4 border rounded-lg bg-white flex justify-center">
                      <canvas 
                        id={`qr-${product.id}`}
                        width="150" 
                        height="150"
                        className="border rounded"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      N° Série: {product.serialNumber}
                    </div>
                  </div>
                )}

                {/* Code-barres visuel */}
                {product.serialNumber && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Barcode className="h-4 w-4" />
                      <span className="text-sm font-medium">Code-barres</span>
                    </div>
                    <div className="p-4 border rounded-lg bg-white flex justify-center overflow-hidden">
                      <canvas 
                        id={`barcode-${product.id}`}
                        width="300" 
                        height="80"
                        className="border rounded max-w-full h-auto"
                        style={{ maxWidth: '100%' }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground text-center">
                      N° Série: {product.serialNumber}
                    </div>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="flex gap-2">
                  <Button 
                    onClick={handleShowBarcodes} 
                    variant="outline" 
                    className="flex-1"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Voir détails
                  </Button>
                  <Button 
                    onClick={handlePrint} 
                    variant="outline" 
                    className="flex-1"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimer
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Informations de création */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Informations système
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Créé le</span>
                  <span className="text-sm">{formatDate(product.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Modifié le</span>
                  <span className="text-sm">{formatDate(product.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal d'édition */}
      <ProductForm
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleProductSubmit}
        product={product}
      />

      {/* Modal d'affichage des codes */}
      <Dialog open={showBarcodeModal} onOpenChange={setShowBarcodeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Codes d'identification - {product?.brand} {product?.model}
            </DialogTitle>
          </DialogHeader>
          {product && (
            <BarcodeDisplay
              product={product}
              onClose={() => setShowBarcodeModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal d'impression des codes */}
      <Dialog open={showPrintModal} onOpenChange={setShowPrintModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Impression des codes - {product?.brand} {product?.model}
            </DialogTitle>
          </DialogHeader>
          {product && (
            <BarcodePrinter
              product={product}
              onClose={() => setShowPrintModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
