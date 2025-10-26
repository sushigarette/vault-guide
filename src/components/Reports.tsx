import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { Product, StockMovement } from '@/types/stock';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface ReportsProps {
  products: Product[];
  movements: StockMovement[];
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
];

export const Reports = ({ products, movements }: ReportsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  // Fonction pour obtenir une couleur unique pour chaque type de matériel
  const getColorForEquipmentType = (equipmentType: string) => {
    const types = Array.from(new Set(products.map(p => p.equipmentType || 'Non défini')));
    const index = types.indexOf(equipmentType);
    return COLORS[index % COLORS.length];
  };

  // Données pour les graphiques par type de matériel
  const equipmentTypeData = products.reduce((acc, product) => {
    const equipmentType = product.equipmentType || 'Non défini';
    const existing = acc.find(item => item.equipmentType === equipmentType);
    const price = product.purchasePriceHt || 0;
    const quantity = product.currentQuantity || 0;
    const value = price * quantity;
    
    if (existing) {
      existing.count += 1;
      existing.value += value;
    } else {
      acc.push({
        equipmentType: equipmentType,
        count: 1,
        value: value
      });
    }
    return acc;
  }, [] as Array<{ equipmentType: string; count: number; value: number }>);


  // Statistiques générales
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, product) => {
    const price = product.purchasePriceHt || 0;
    const quantity = product.currentQuantity || 0;
    return sum + (price * quantity);
  }, 0);
  const averageValue = totalProducts > 0 ? totalValue / totalProducts : 0;

  // Répartition par type de matériel
  const byEquipmentType = products.reduce((acc, product) => {
    const equipmentType = product.equipmentType || 'Non défini';
    acc[equipmentType] = (acc[equipmentType] || 0) + 1;
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
        (product.purchasePriceHt || 0) * (product.currentQuantity || 0),
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
        {/* Graphique en barres par Type de Matériel */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Type de Matériel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart
                data={equipmentTypeData
                  .sort((a, b) => b.count - a.count)
                  .map((item, index) => ({
                    ...item,
                    displayName: item.equipmentType.charAt(0).toUpperCase() + item.equipmentType.slice(1).replace('_', ' '),
                    color: COLORS[index % COLORS.length]
                  }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="displayName" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  fontSize={12}
                />
                <YAxis 
                  label={{ value: 'Nombre de produits', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} produits (${formatCurrency(props.payload.value)})`, 
                    'Quantité'
                  ]}
                  labelFormatter={(label) => `Type: ${label}`}
                />
                <Bar dataKey="count" fill="#8884d8">
                  {equipmentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColorForEquipmentType(entry.equipmentType)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Graphique en secteurs pour les valeurs monétaires */}
        <Card>
          <CardHeader>
            <CardTitle>Valeur par Type de Matériel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={equipmentTypeData
                    .filter(item => item.value > 0)
                    .sort((a, b) => b.value - a.value)
                    .map(item => ({
                      ...item,
                      displayName: item.equipmentType.charAt(0).toUpperCase() + item.equipmentType.slice(1).replace('_', ' ')
                    }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ displayName, value, percent }) => {
                    // Afficher le label seulement si le secteur fait plus de 3% du total
                    return percent > 3 ? `${displayName}: ${formatCurrency(value)}` : '';
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {equipmentTypeData
                    .filter(item => item.value > 0)
                    .sort((a, b) => b.value - a.value)
                    .map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColorForEquipmentType(entry.equipmentType)} />
                    ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    formatCurrency(value), 
                    'Valeur totale'
                  ]}
                  labelFormatter={(label) => `Type: ${label}`}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Légende personnalisée */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {equipmentTypeData
                .filter(item => item.value > 0)
                .sort((a, b) => b.value - a.value)
                .map((item) => (
                  <div key={item.equipmentType} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-sm" 
                      style={{ backgroundColor: getColorForEquipmentType(item.equipmentType) }}
                    />
                    <span className="text-sm font-medium">
                      {item.equipmentType.charAt(0).toUpperCase() + item.equipmentType.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                ))}
            </div>
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