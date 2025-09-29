import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { Product, StockMovement } from '@/types/stock';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ReportsProps {
  products: Product[];
  movements: StockMovement[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const Reports = ({ products, movements }: ReportsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  // Données pour les graphiques par type de matériel
  const equipmentTypeData = products.reduce((acc, product) => {
    const existing = acc.find(item => item.equipmentType === product.equipmentType);
    if (existing) {
      existing.count += 1;
      existing.value += product.amount || 0;
    } else {
      acc.push({
        equipmentType: product.equipmentType,
        count: 1,
        value: product.amount || 0
      });
    }
    return acc;
  }, [] as Array<{ equipmentType: string; count: number; value: number }>);


  // Statistiques générales
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => sum + (product.amount || 0), 0);
  const averageValue = totalProducts > 0 ? totalValue / totalProducts : 0;

  // Répartition par type de matériel
  const byEquipmentType = products.reduce((acc, product) => {
    acc[product.equipmentType] = (acc[product.equipmentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Export CSV
  const exportToCSV = () => {
    const headers = [
      'N° Série',
      'Marque',
      'Modèle',
      'Affectation',
      'Quantité',
      'Prix HT',
      'Valeur Actuelle',
      'Fournisseur',
      'Date Entrée',
      'Commentaires'
    ];

    const csvContent = [
      headers.join(','),
      ...products.map(product => [
        product.serialNumber,
        product.brand,
        product.model,
        product.assignment,
        product.currentQuantity,
        product.purchasePriceHt || 0,
        product.currentValue || 0,
        product.supplier || '',
        product.entryDate || '',
        product.comments || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rapport_stock_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Produits en stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Totale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Montant total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Moyenne</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageValue)}</div>
            <p className="text-xs text-muted-foreground">
              Par produit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par type de matériel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Type de Matériel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(byEquipmentType).map(([equipmentType, count], index) => {
                const typeData = equipmentTypeData.find(item => item.equipmentType === equipmentType);
                const value = typeData?.value || 0;
                const color = COLORS[index % COLORS.length];
                return (
                  <div key={equipmentType} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge 
                        className="text-white"
                        style={{ backgroundColor: color }}
                      >
                        {equipmentType.charAt(0).toUpperCase() + equipmentType.slice(1).replace('_', ' ')}
                      </Badge>
                      <span className="text-sm">{count} produits</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatCurrency(value)}</div>
                      <div className="text-xs text-muted-foreground">Montant total</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Graphique par Type de Matériel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={equipmentTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ equipmentType, count, value }) => 
                    `${equipmentType.charAt(0).toUpperCase() + equipmentType.slice(1).replace('_', ' ')}: ${count}`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {equipmentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} produits (${formatCurrency(props.payload.value)})`, 
                    'Détails'
                  ]} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>


      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={exportToCSV} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Exporter en CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};