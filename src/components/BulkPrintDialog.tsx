import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Printer, Download, Check } from 'lucide-react';
import { Product } from '@/types/stock';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

interface BulkPrintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export const BulkPrintDialog = ({ isOpen, onClose, products }: BulkPrintDialogProps) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [printSettings, setPrintSettings] = useState({
    width: 2,
    height: 100,
    fontSize: 12,
    margin: 10,
    itemsPerPage: 4,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Sélectionner tous les produits par défaut
      setSelectedProducts(products.map(p => p.id));
    }
  }, [isOpen, products]);

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAll = () => {
    setSelectedProducts(products.map(p => p.id));
  };

  const selectNone = () => {
    setSelectedProducts([]);
  };

  const generateBarcode = (canvas: HTMLCanvasElement, value: string) => {
    try {
      JsBarcode(canvas, value, {
        format: 'CODE128',
        width: printSettings.width,
        height: printSettings.height,
        displayValue: true,
        fontSize: printSettings.fontSize,
        margin: printSettings.margin,
      });
    } catch (error) {
      console.error('Erreur génération code-barres:', error);
    }
  };

  const generateQRCode = async (canvas: HTMLCanvasElement, value: string) => {
    try {
      const qrDataURL = await QRCode.toDataURL(value, {
        width: 150,
        margin: 2,
      });
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, 150, 150);
        };
        img.src = qrDataURL;
      }
    } catch (error) {
      console.error('Erreur génération QR code:', error);
    }
  };

  const printSelected = async () => {
    if (selectedProducts.length === 0) return;

    setIsGenerating(true);
    
    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));
    
    // Générer le contenu HTML pour l'impression
    const printContent = `
      <html>
        <head>
          <title>Impression en lot - Codes-barres</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 20px;
            }
            .print-container {
              display: grid;
              grid-template-columns: repeat(${printSettings.itemsPerPage}, 1fr);
              gap: 20px;
              page-break-inside: avoid;
            }
            .barcode-item {
              border: 1px solid #ccc;
              padding: 10px;
              text-align: center;
              page-break-inside: avoid;
              margin-bottom: 20px;
            }
            .product-name {
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 5px;
            }
            .product-sku {
              font-size: 12px;
              color: #666;
              margin-bottom: 10px;
            }
            .barcode-container {
              margin: 10px 0;
            }
            .qrcode-container {
              margin: 10px 0;
            }
            canvas {
              max-width: 100%;
              height: auto;
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .barcode-item { margin-bottom: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${selectedProductsData.map(product => `
              <div class="barcode-item">
                <div class="product-name">${product.name}</div>
                <div class="product-sku">SKU: ${product.sku}</div>
                ${product.barcode ? `
                  <div class="barcode-container">
                    <canvas id="barcode-${product.id}" width="200" height="100"></canvas>
                  </div>
                ` : ''}
                ${product.qrCode ? `
                  <div class="qrcode-container">
                    <canvas id="qrcode-${product.id}" width="150" height="150"></canvas>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();

      // Générer les codes-barres et QR codes
      setTimeout(async () => {
        for (const product of selectedProductsData) {
          if (product.barcode) {
            const canvas = printWindow.document.getElementById(`barcode-${product.id}`) as HTMLCanvasElement;
            if (canvas) {
              generateBarcode(canvas, product.barcode);
            }
          }
          if (product.qrCode) {
            const canvas = printWindow.document.getElementById(`qrcode-${product.id}`) as HTMLCanvasElement;
            if (canvas) {
              await generateQRCode(canvas, product.qrCode);
            }
          }
        }
        
        printWindow.print();
        setIsGenerating(false);
      }, 1000);
    }
  };

  const downloadSelected = async () => {
    if (selectedProducts.length === 0) return;

    setIsGenerating(true);
    
    // Créer un canvas pour combiner tous les codes
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));
    const itemsPerRow = printSettings.itemsPerPage;
    const itemWidth = 200;
    const itemHeight = 200;
    const padding = 20;

    canvas.width = itemsPerRow * itemWidth + (itemsPerRow - 1) * padding;
    canvas.height = Math.ceil(selectedProductsData.length / itemsPerRow) * itemHeight + 
                   (Math.ceil(selectedProductsData.length / itemsPerRow) - 1) * padding;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < selectedProductsData.length; i++) {
      const product = selectedProductsData[i];
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      const x = col * (itemWidth + padding);
      const y = row * (itemHeight + padding);

      // Dessiner le nom du produit
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(product.name, x + itemWidth / 2, y + 20);
      ctx.fillText(`SKU: ${product.sku}`, x + itemWidth / 2, y + 40);

      // Générer le code-barres si disponible
      if (product.barcode) {
        const barcodeCanvas = document.createElement('canvas');
        generateBarcode(barcodeCanvas, product.barcode);
        ctx.drawImage(barcodeCanvas, x + 10, y + 50, itemWidth - 20, 60);
      }

      // Générer le QR code si disponible
      if (product.qrCode) {
        const qrCanvas = document.createElement('canvas');
        await generateQRCode(qrCanvas, product.qrCode);
        ctx.drawImage(qrCanvas, x + itemWidth / 2 - 50, y + 120, 100, 100);
      }
    }

    // Télécharger l'image
    const link = document.createElement('a');
    link.download = `codes_barres_lot_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL();
    link.click();

    setIsGenerating(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Impression en lot des codes-barres</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Paramètres d'impression */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
            <div>
              <label className="text-sm font-medium">Articles par page</label>
              <select
                className="w-full mt-1 p-2 border rounded"
                value={printSettings.itemsPerPage}
                onChange={(e) => setPrintSettings(prev => ({ ...prev, itemsPerPage: parseInt(e.target.value) }))}
              >
                <option value={2}>2 par page</option>
                <option value={4}>4 par page</option>
                <option value={6}>6 par page</option>
                <option value={8}>8 par page</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Largeur code-barres</label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.5"
                className="w-full mt-1 p-2 border rounded"
                value={printSettings.width}
                onChange={(e) => setPrintSettings(prev => ({ ...prev, width: parseFloat(e.target.value) }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Hauteur code-barres</label>
              <input
                type="number"
                min="50"
                max="200"
                className="w-full mt-1 p-2 border rounded"
                value={printSettings.height}
                onChange={(e) => setPrintSettings(prev => ({ ...prev, height: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Taille police</label>
              <input
                type="number"
                min="8"
                max="20"
                className="w-full mt-1 p-2 border rounded"
                value={printSettings.fontSize}
                onChange={(e) => setPrintSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          {/* Sélection des produits */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Sélectionner les produits à imprimer</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Tout sélectionner
                </Button>
                <Button variant="outline" size="sm" onClick={selectNone}>
                  Tout désélectionner
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
              {products.map((product) => (
                <Card key={product.id} className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={() => toggleProduct(product.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{product.name}</div>
                      <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
                      <div className="flex gap-1 mt-2">
                        {product.barcode && (
                          <Badge variant="outline" className="text-xs">
                            <Barcode className="h-3 w-3 mr-1" />
                            Code-barres
                          </Badge>
                        )}
                        {product.qrCode && (
                          <Badge variant="outline" className="text-xs">
                            <QrCode className="h-3 w-3 mr-1" />
                            QR Code
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Résumé */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                {selectedProducts.length} produit(s) sélectionné(s)
              </span>
              <div className="flex items-center gap-2">
                {selectedProducts.length > 0 && (
                  <Badge variant="secondary">
                    <Check className="h-3 w-3 mr-1" />
                    Prêt à imprimer
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="outline"
            onClick={downloadSelected}
            disabled={selectedProducts.length === 0 || isGenerating}
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? 'Génération...' : 'Télécharger'}
          </Button>
          <Button
            onClick={printSelected}
            disabled={selectedProducts.length === 0 || isGenerating}
            className="bg-gradient-primary"
          >
            <Printer className="h-4 w-4 mr-2" />
            {isGenerating ? 'Génération...' : 'Imprimer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
