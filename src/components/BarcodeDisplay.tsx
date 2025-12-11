import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Barcode, Copy, Download } from 'lucide-react';
import { Product } from '@/types/stock';
import { QRCodeInfo } from './QRCodeInfo';
import { getAppUrl } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

interface BarcodeDisplayProps {
  product: Product;
  onClose: () => void;
}

export const BarcodeDisplay = ({ product, onClose }: BarcodeDisplayProps) => {
  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  const barcodeRef = useRef<HTMLCanvasElement>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Générer le QR code avec l'URL de la page produit
  useEffect(() => {
    if (qrCodeRef.current && product.id) {
      const qrUrl = getAppUrl(`/product/${product.id}`);
      QRCode.toCanvas(qrCodeRef.current, qrUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch(console.error);
    }
  }, [product.id]);

  // Générer le code-barres à partir du numéro de série
  useEffect(() => {
    if (barcodeRef.current && product.serialNumber) {
      try {
        // Calculer la largeur adaptative basée sur la longueur du numéro de série
        const serialLength = product.serialNumber.length;
        const adaptiveWidth = Math.max(1, Math.min(3, 300 / (serialLength * 8)));
        
        JsBarcode(barcodeRef.current, product.serialNumber, {
          format: "CODE128",
          width: adaptiveWidth,
          height: 80,
          displayValue: true,
          fontSize: 12,
          margin: 5
        });
      } catch (error) {
        console.error('Erreur génération code-barres:', error);
      }
    }
  }, [product.serialNumber]);

  const downloadBarcode = (code: string, type: 'barcode' | 'qrcode') => {
    // Dans une vraie application, on générerait une image du code-barres/QR
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${product.sku}_${type}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Barcode className="h-5 w-5" />
          Codes d'identification - {product.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Code-barres */}
          {product.serialNumber && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Barcode className="h-4 w-4" />
                <h3 className="font-medium">Code-barres</h3>
              </div>
              <div className="p-4 border rounded-lg bg-white">
                <div className="flex justify-center">
                  <canvas ref={barcodeRef} className="max-w-full h-auto" />
                </div>
                <div className="text-xs text-muted-foreground text-center mt-2">
                  N° Série: {product.serialNumber}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(product.serialNumber)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadBarcode(product.serialNumber, 'barcode')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            </div>
          )}

          {/* QR Code */}
          {product.serialNumber && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                <h3 className="font-medium">QR Code</h3>
              </div>
              <div className="p-4 border rounded-lg bg-white">
                <div className="flex justify-center">
                  <canvas ref={qrCodeRef} className="max-w-full h-auto" />
                </div>
                <div className="text-xs text-muted-foreground text-center mt-2">
                  N° Série: {product.serialNumber}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(product.serialNumber)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadBarcode(product.serialNumber, 'qrcode')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            </div>
          )}
        </div>

        {!product.serialNumber && (
          <div className="text-center py-8 text-muted-foreground">
            <Barcode className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun code d'identification configuré pour ce produit</p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
