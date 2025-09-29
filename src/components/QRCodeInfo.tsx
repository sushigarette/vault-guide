import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Smartphone, ExternalLink } from 'lucide-react';

interface QRCodeInfoProps {
  qrValue: string;
  productName: string;
}

export const QRCodeInfo = ({ qrValue, productName }: QRCodeInfoProps) => {
  const isUrl = qrValue.startsWith('http');

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code - {productName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isUrl ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">QR Code interactif</p>
                <p className="text-sm text-blue-700">
                  Scannez ce code pour accéder directement à la fiche produit
                </p>
              </div>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">URL de destination :</p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-background px-2 py-1 rounded flex-1 truncate">
                  {qrValue}
                </code>
                <a
                  href={qrValue}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="text-center">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <QrCode className="h-3 w-3 mr-1" />
                Scannable
              </Badge>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <QrCode className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">QR Code simple</p>
                <p className="text-sm text-gray-700">
                  Code d'identification du produit
                </p>
              </div>
            </div>
            
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Valeur :</p>
              <code className="text-xs bg-background px-2 py-1 rounded">
                {qrValue}
              </code>
            </div>

            <div className="text-center">
              <Badge variant="outline" className="text-gray-600 border-gray-600">
                <QrCode className="h-3 w-3 mr-1" />
                Code simple
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};








