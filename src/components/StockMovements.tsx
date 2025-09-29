import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUp, ArrowDown, RotateCw } from 'lucide-react';
import { StockMovement, Product } from '@/types/stock';

interface StockMovementsProps {
  movements: StockMovement[];
  products: Product[];
  onAddMovement: () => void;
}

export const StockMovements = ({
  movements,
  products,
  onAddMovement,
}: StockMovementsProps) => {
  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Produit inconnu';
  };

  const getMovementIcon = (type: StockMovement['type']) => {
    switch (type) {
      case 'in':
        return <ArrowUp className="h-4 w-4 text-success" />;
      case 'out':
        return <ArrowDown className="h-4 w-4 text-destructive" />;
      case 'sale':
        return <ArrowDown className="h-4 w-4 text-blue-500" />;
      case 'return':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'adjustment':
        return <RotateCw className="h-4 w-4 text-warning" />;
    }
  };

  const getMovementBadge = (type: StockMovement['type']) => {
    switch (type) {
      case 'in':
        return <Badge className="bg-success text-success-foreground">Entrée</Badge>;
      case 'out':
        return <Badge variant="destructive">Sortie</Badge>;
      case 'sale':
        return <Badge className="bg-blue-500 text-white">Vente</Badge>;
      case 'return':
        return <Badge className="bg-green-500 text-white">Retour</Badge>;
      case 'adjustment':
        return <Badge className="bg-warning text-warning-foreground">Ajustement</Badge>;
    }
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

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Mouvements de Stock</CardTitle>
          <Button onClick={onAddMovement} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau mouvement
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {movements.slice(0, 10).map((movement) => (
            <div
              key={movement.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-gradient-card"
            >
              <div className="flex items-center gap-4">
                {getMovementIcon(movement.type)}
                <div>
                  <div className="font-medium">
                    {getProductName(movement.productId)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {movement.reason}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  {getMovementBadge(movement.type)}
                  <span className="font-semibold">
                    {movement.type === 'out' || movement.type === 'sale' ? '-' : '+'}{movement.quantity}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(movement.date)}
                  {movement.reference && (
                    <div className="text-xs text-muted-foreground">
                      Ref: {movement.reference}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {movements.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun mouvement enregistré
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};