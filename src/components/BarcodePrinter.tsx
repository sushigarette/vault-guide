import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, Barcode, Printer, Download, Copy, Settings } from 'lucide-react';
import { Product } from '@/types/stock';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

interface BarcodePrinterProps {
  product: Product;
  onClose: () => void;
}

const barcodeFormats = [
  { value: 'CODE128', label: 'Code 128' },
  { value: 'EAN13', label: 'EAN-13' },
  { value: 'EAN8', label: 'EAN-8' },
  { value: 'UPC', label: 'UPC' },
  { value: 'CODE39', label: 'Code 39' },
];

export const BarcodePrinter = ({ product, onClose }: BarcodePrinterProps) => {
  const [barcodeFormat, setBarcodeFormat] = useState('CODE128');
  const [barcodeValue, setBarcodeValue] = useState(product.serialNumber);
  const [qrValue, setQrValue] = useState(`${window.location.origin}/product/${product.id}`);
  const [showSettings, setShowSettings] = useState(false);
  const [printSettings, setPrintSettings] = useState({
    width: 2,
    height: 100,
    fontSize: 12,
    margin: 10,
  });

  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const printBarcodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const printQrCanvasRef = useRef<HTMLCanvasElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateBarcode();
    generateQRCodeImage();
    generatePrintBarcode();
    generatePrintQRCode();
  }, [barcodeValue, barcodeFormat, printSettings, qrValue]);

  const generateBarcode = () => {
    if (barcodeCanvasRef.current && barcodeValue) {
      try {
        // Calculer la largeur adaptative basée sur la longueur du numéro de série
        const serialLength = barcodeValue.length;
        const adaptiveWidth = Math.max(1, Math.min(3, 300 / (serialLength * 8)));
        
        JsBarcode(barcodeCanvasRef.current, barcodeValue, {
          format: barcodeFormat as any,
          width: adaptiveWidth,
          height: printSettings.height,
          displayValue: true,
          fontSize: printSettings.fontSize,
          margin: printSettings.margin,
        });
      } catch (error) {
        console.error('Erreur génération code-barres:', error);
      }
    }
  };

  const generateQRCodeImage = async () => {
    if (qrCanvasRef.current && qrValue) {
      try {
        await QRCode.toCanvas(qrCanvasRef.current, qrValue, {
          width: 200,
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
  };

  const generatePrintBarcode = () => {
    if (printBarcodeCanvasRef.current && barcodeValue) {
      try {
        // Calculer la largeur adaptative basée sur la longueur du numéro de série
        const serialLength = barcodeValue.length;
        const adaptiveWidth = Math.max(1, Math.min(3, 300 / (serialLength * 8)));
        
        JsBarcode(printBarcodeCanvasRef.current, barcodeValue, {
          format: barcodeFormat as any,
          width: adaptiveWidth,
          height: printSettings.height,
          displayValue: true,
          fontSize: printSettings.fontSize,
          margin: printSettings.margin,
        });
      } catch (error) {
        console.error('Erreur génération code-barres d\'impression:', error);
      }
    }
  };

  const generatePrintQRCode = async () => {
    if (printQrCanvasRef.current && qrValue) {
      try {
        await QRCode.toCanvas(printQrCanvasRef.current, qrValue, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
      } catch (error) {
        console.error('Erreur génération QR code d\'impression:', error);
      }
    }
  };

  const printBarcode = async () => {
    // S'assurer que les codes d'impression sont générés
    await generatePrintBarcode();
    await generatePrintQRCode();
    
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Code-barres - ${product.name}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px;
                  text-align: center;
                }
                .barcode-container {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  gap: 20px;
                  page-break-inside: avoid;
                }
                .product-info {
                  margin-bottom: 10px;
                }
                .product-name {
                  font-weight: bold;
                  font-size: 16px;
                  margin-bottom: 5px;
                }
                .product-sku {
                  font-size: 14px;
                  color: #666;
                }
                canvas {
                  border: 1px solid #ccc;
                  margin: 10px 0;
                }
                @media print {
                  body { margin: 0; }
                  .barcode-container { margin: 0; }
                }
              </style>
            </head>
            <body>
              <div class="barcode-container">
                <div class="product-info">
                  <div class="product-name">${product.serialNumber}</div>
                </div>
                <canvas id="barcode" width="300" height="150"></canvas>
                <canvas id="qrcode" width="200" height="200"></canvas>
              </div>
              <script>
                // Génération du code-barres
                try {
                  const canvas = document.getElementById('barcode');
                  const ctx = canvas.getContext('2d');
                  // Code-barres généré côté client
                } catch (e) {
                  console.error('Erreur génération code-barres:', e);
                }
              </script>
            </body>
          </html>
        `);
        
        // Copier les canvas vers la nouvelle fenêtre
        setTimeout(() => {
          const barcodeCanvas = printBarcodeCanvasRef.current;
          const qrCanvas = printQrCanvasRef.current;
          const printBarcodeCanvas = printWindow.document.getElementById('barcode') as HTMLCanvasElement;
          const printQrCanvas = printWindow.document.getElementById('qrcode') as HTMLCanvasElement;
          
          if (barcodeCanvas && printBarcodeCanvas) {
            const ctx = printBarcodeCanvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(barcodeCanvas, 0, 0);
            }
          }
          
          if (qrCanvas && printQrCanvas) {
            const ctx = printQrCanvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(qrCanvas, 0, 0);
            }
          }
          
          printWindow.document.close();
          printWindow.print();
        }, 500);
      }
    }
  };

  const downloadBarcode = () => {
    if (barcodeCanvasRef.current) {
      const link = document.createElement('a');
      link.download = `${product.sku}_barcode.png`;
      link.href = barcodeCanvasRef.current.toDataURL();
      link.click();
    }
  };

  const downloadQRCode = () => {
    if (qrCanvasRef.current) {
      const link = document.createElement('a');
      link.download = `${product.sku}_qrcode.png`;
      link.href = qrCanvasRef.current.toDataURL();
      link.click();
    }
  };

  const copyBarcodeValue = () => {
    navigator.clipboard.writeText(barcodeValue);
  };

  const copyQRValue = () => {
    navigator.clipboard.writeText(qrValue);
  };

  const printBarcodeOnly = async () => {
    await generatePrintBarcode();
    
    if (printBarcodeCanvasRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Code-barres - ${product.serialNumber}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px;
                  text-align: center;
                }
                .barcode-container {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  gap: 20px;
                  page-break-inside: avoid;
                }
                .product-info {
                  margin-bottom: 10px;
                }
                .product-name {
                  font-weight: bold;
                  font-size: 16px;
                  margin-bottom: 5px;
                }
                canvas {
                  border: 1px solid #ccc;
                  margin: 10px 0;
                  max-width: 100%;
                  height: auto;
                }
                @media print {
                  body { margin: 0; }
                  .barcode-container { margin: 0; }
                }
              </style>
            </head>
            <body>
              <div class="barcode-container">
                <div class="product-info">
                  <div class="product-name">${product.serialNumber}</div>
                </div>
                <canvas id="barcode" width="300" height="150"></canvas>
              </div>
              <script>
                // Génération du code-barres
                try {
                  const canvas = document.getElementById('barcode');
                  const ctx = canvas.getContext('2d');
                  const img = new Image();
                  img.onload = function() {
                    ctx.drawImage(img, 0, 0);
                  };
                  img.src = '${printBarcodeCanvasRef.current.toDataURL()}';
                } catch (error) {
                  console.error('Erreur génération code-barres:', error);
                }
              </script>
            </body>
          </html>
        `);
        
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
  };

  const printQRCodeOnly = async () => {
    await generatePrintQRCode();
    
    if (printQrCanvasRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>QR Code - ${product.serialNumber}</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 20px;
                  text-align: center;
                }
                .qr-container {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  gap: 20px;
                  page-break-inside: avoid;
                }
                .product-info {
                  margin-bottom: 10px;
                }
                .product-name {
                  font-weight: bold;
                  font-size: 16px;
                  margin-bottom: 5px;
                }
                canvas {
                  border: 1px solid #ccc;
                  margin: 10px 0;
                }
                @media print {
                  body { margin: 0; }
                  .qr-container { margin: 0; }
                }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <div class="product-info">
                  <div class="product-name">${product.serialNumber}</div>
                </div>
                <canvas id="qrcode" width="200" height="200"></canvas>
              </div>
              <script>
                // Génération du QR code
                try {
                  const canvas = document.getElementById('qrcode');
                  const ctx = canvas.getContext('2d');
                  const img = new Image();
                  img.onload = function() {
                    ctx.drawImage(img, 0, 0);
                  };
                  img.src = '${printQrCanvasRef.current.toDataURL()}';
                } catch (error) {
                  console.error('Erreur génération QR code:', error);
                }
              </script>
            </body>
          </html>
        `);
        
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Barcode className="h-5 w-5" />
              Impression des codes - {product.name}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Paramètres d'impression */}
          {showSettings && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
              <div>
                <Label htmlFor="format">Format code-barres</Label>
                <Select value={barcodeFormat} onValueChange={setBarcodeFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {barcodeFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="width">Largeur</Label>
                <Input
                  id="width"
                  type="number"
                  min="1"
                  max="5"
                  step="0.5"
                  value={printSettings.width}
                  onChange={(e) => setPrintSettings(prev => ({ ...prev, width: parseFloat(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="height">Hauteur</Label>
                <Input
                  id="height"
                  type="number"
                  min="50"
                  max="200"
                  value={printSettings.height}
                  onChange={(e) => setPrintSettings(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="fontSize">Taille police</Label>
                <Input
                  id="fontSize"
                  type="number"
                  min="8"
                  max="20"
                  value={printSettings.fontSize}
                  onChange={(e) => setPrintSettings(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          )}

          {/* Valeurs des codes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valeur code-barres</Label>
              <div className="flex gap-2">
                <Input
                  value={barcodeValue}
                  onChange={(e) => setBarcodeValue(e.target.value)}
                  placeholder="Valeur du code-barres"
                />
                <Button variant="outline" size="sm" onClick={copyBarcodeValue}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valeur QR code</Label>
              <div className="flex gap-2">
                <Input
                  value={qrValue}
                  onChange={(e) => setQrValue(e.target.value)}
                  placeholder="Valeur du QR code"
                />
                <Button variant="outline" size="sm" onClick={copyQRValue}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Aperçu des codes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Barcode className="h-4 w-4" />
                <h3 className="font-medium">Code-barres</h3>
                <Badge variant="outline">{barcodeFormat}</Badge>
              </div>
              <div className="p-4 border rounded-lg bg-white overflow-hidden">
                <canvas 
                  ref={barcodeCanvasRef} 
                  width="300" 
                  height="150"
                  className="max-w-full h-auto"
                  style={{ maxWidth: '100%' }}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadBarcode}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
                <Button variant="outline" size="sm" onClick={printBarcodeOnly}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                <h3 className="font-medium">QR Code</h3>
              </div>
              <div className="p-4 border rounded-lg bg-white">
                <canvas ref={qrCanvasRef} width="200" height="200"></canvas>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadQRCode}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
                <Button variant="outline" size="sm" onClick={printQRCodeOnly}>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </Button>
              </div>
            </div>
          </div>

          {/* Actions d'impression */}
          <div className="flex justify-center gap-4 pt-4 border-t">
            <Button onClick={printBarcode} className="bg-gradient-primary">
              <Printer className="h-4 w-4 mr-2" />
              Imprimer les codes
            </Button>
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Zone d'impression cachée */}
      <div ref={printRef} className="hidden">
        <div className="barcode-container">
          <div className="product-info">
            <div className="product-name">{product.serialNumber}</div>
          </div>
          <canvas ref={printBarcodeCanvasRef} width="300" height="150"></canvas>
          <canvas ref={printQrCanvasRef} width="200" height="200"></canvas>
        </div>
      </div>
    </div>
  );
};
