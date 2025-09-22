import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { StockStats } from '@/types/stock';

interface StockDashboardProps {
  stats: StockStats;
}

export const StockDashboard = ({ stats }: StockDashboardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-card shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{stats.totalProducts}</div>
          <p className="text-xs text-muted-foreground">
            Articles en stock
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alertes Stock</CardTitle>
          <AlertTriangle className="h-4 w-4 text-warning" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-warning">{stats.lowStockAlerts}</div>
            {stats.lowStockAlerts > 0 && (
              <Badge variant="destructive" className="text-xs">
                Attention
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Produits sous seuil minimum
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
          <TrendingUp className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">
            {formatCurrency(stats.totalValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Valeur du stock actuel
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-card shadow-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mouvements</CardTitle>
          <Activity className="h-4 w-4 text-info" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-info">{stats.recentMovements}</div>
          <p className="text-xs text-muted-foreground">
            Cette semaine
          </p>
        </CardContent>
      </Card>
    </div>
  );
};