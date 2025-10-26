import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Building2, 
  Package, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Calendar,
  MapPin,
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Printer
} from 'lucide-react';
import { Product } from '@/types/stock';

interface ClientMachineParkProps {
  products: Product[];
  totalProducts?: number;
  currentPage?: number;
  productsPerPage?: number;
  onLoadAllProducts?: () => void;
  onLoadNextPage?: () => void;
  onLoadPreviousPage?: () => void;
  onEditProduct?: (product: Product) => void;
  onPrintProduct?: (product: Product) => void;
}

interface ClientSummary {
  client: string;
  totalMachines: number;
  totalValue: number;
  statusBreakdown: {
    'en-stock': number;
    'sav': number;
    'vente': number;
    'en-utilisation': number;
    'hs': number;
  };
  categories: { [key: string]: number };
  lastUpdate: Date;
}

export const ClientMachinePark = ({ 
  products, 
  totalProducts = 0, 
  currentPage = 0, 
  productsPerPage = 3000,
  onLoadAllProducts,
  onLoadNextPage,
  onLoadPreviousPage,
  onEditProduct,
  onPrintProduct
}: ClientMachineParkProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Filtrer les produits qui ont un client assigné
  const productsWithClient = products.filter(p => p.client && p.client.trim() !== '');

  // Grouper par client
  const clientGroups = productsWithClient.reduce((acc, product) => {
    const client = product.client!;
    if (!acc[client]) {
      acc[client] = [];
    }
    acc[client].push(product);
    return acc;
  }, {} as { [client: string]: Product[] });

  // Calculer les statistiques par client
  const clientSummaries: ClientSummary[] = Object.entries(clientGroups).map(([client, clientProducts]) => {
    const totalValue = clientProducts.reduce((sum, p) => {
      const price = p.purchasePriceHt || 0;
      const quantity = p.currentQuantity || 0;
      return sum + (price * quantity);
    }, 0);
    
    const statusBreakdown = {
      'en-stock': clientProducts.filter(p => p.status === 'en-stock').length,
      'sav': clientProducts.filter(p => p.status === 'sav').length,
      'vente': clientProducts.filter(p => p.status === 'vente').length,
      'en-utilisation': clientProducts.filter(p => p.status === 'en-utilisation').length,
      'hs': clientProducts.filter(p => p.status === 'hs').length,
    };

    const categories = clientProducts.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const lastUpdate = new Date(Math.max(...clientProducts.map(p => p.updatedAt.getTime())));

    return {
      client,
      totalMachines: clientProducts.length,
      totalValue,
      statusBreakdown,
      categories,
      lastUpdate,
    };
  });

  // Filtrer les clients selon les critères
  const filteredClients = clientSummaries.filter(summary => {
    const matchesSearch = summary.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || summary.statusBreakdown[statusFilter as keyof typeof summary.statusBreakdown] > 0;
    return matchesSearch && matchesStatus;
  });

  // Obtenir les produits d'un client spécifique
  const getClientProducts = (client: string) => {
    return clientGroups[client] || [];
  };

  // Exporter les données
  const exportClientData = (client: string) => {
    const clientProducts = getClientProducts(client);
    const csvContent = [
      ['Nom', 'SKU', 'Série', 'Marque', 'Modèle', 'Catégorie', 'Statut', 'Prix', 'Quantité', 'Valeur', 'Date réception', 'Garantie', 'Remarques'],
      ...clientProducts.map(p => [
        p.name,
        p.sku,
        p.serialNumber || '',
        p.brand || '',
        p.model || '',
        p.category,
        p.status,
        p.price.toString(),
        p.quantity.toString(),
        (p.quantity * p.price).toString(),
        p.receptionDate || '',
        p.warrantyStartDate || '',
        p.remarks || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `parc_machine_${client}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'en-stock': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sav': return <Wrench className="h-4 w-4 text-orange-500" />;
      case 'vente': return <Package className="h-4 w-4 text-blue-500" />;
      case 'en-utilisation': return <Eye className="h-4 w-4 text-purple-500" />;
      case 'hs': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'en-stock': 'En stock',
      'sav': 'SAV',
      'vente': 'Vente',
      'en-utilisation': 'En utilisation',
      'hs': 'HS'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Parc Machine par Client</h2>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''}
          </Badge>
          {totalProducts > productsPerPage && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {products.length} / {totalProducts} produits
              </span>
              {onLoadAllProducts && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLoadAllProducts}
                >
                  Charger tout
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="en-stock">En stock</SelectItem>
            <SelectItem value="sav">SAV</SelectItem>
            <SelectItem value="vente">Vente</SelectItem>
            <SelectItem value="en-utilisation">En utilisation</SelectItem>
            <SelectItem value="hs">HS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste des clients */}
      <div className="grid gap-4">
        {filteredClients.map((summary) => (
          <Card key={summary.client} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <CardTitle 
                    className="text-lg cursor-pointer hover:text-blue-600 transition-colors"
                    onClick={() => setSelectedClient(summary.client)}
                  >
                    {summary.client}
                  </CardTitle>
                  <Badge variant="secondary">
                    {summary.totalMachines} machine{summary.totalMachines > 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    Dernière MAJ: {formatDate(summary.lastUpdate)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportClientData(summary.client)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedClient(summary.client)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Parc Machine - {summary.client}</DialogTitle>
                      </DialogHeader>
                      <ClientDetails 
                        client={summary.client}
                        products={getClientProducts(summary.client)}
                        summary={summary}
                        onEditProduct={onEditProduct}
                        onPrintProduct={onPrintProduct}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Valeur totale */}
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(summary.totalValue)}
                  </div>
                  <div className="text-sm text-gray-600">Valeur totale</div>
                </div>

                {/* Répartition par statut */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Répartition par statut</div>
                  <div className="space-y-1">
                    {Object.entries(summary.statusBreakdown).map(([status, count]) => (
                      count > 0 && (
                        <div key={status} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(status)}
                            <span>{getStatusLabel(status)}</span>
                          </div>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {/* Répartition par catégorie */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Répartition par catégorie</div>
                  <div className="space-y-1">
                    {Object.entries(summary.categories).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between text-sm">
                        <span>{category}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun client trouvé</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Aucun client ne correspond aux critères de recherche.'
                : 'Aucun produit n\'est assigné à un client pour le moment.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalProducts > productsPerPage && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage + 1} sur {Math.ceil(totalProducts / productsPerPage)}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadPreviousPage}
              disabled={currentPage === 0}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadNextPage}
              disabled={currentPage >= Math.ceil(totalProducts / productsPerPage) - 1}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour les détails d'un client
const ClientDetails = ({ client, products, summary, onEditProduct, onPrintProduct }: { 
  client: string; 
  products: Product[]; 
  summary: ClientSummary;
  onEditProduct?: (product: Product) => void;
  onPrintProduct?: (product: Product) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredProducts = products.filter(product => {
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    // Recherche dans nom, SKU, marque, modèle
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower) ||
      (product.brand && product.brand.toLowerCase().includes(searchLower)) ||
      (product.model && product.model.toLowerCase().includes(searchLower));
    
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'en-stock': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sav': return <Wrench className="h-4 w-4 text-orange-500" />;
      case 'vente': return <Package className="h-4 w-4 text-blue-500" />;
      case 'en-utilisation': return <Eye className="h-4 w-4 text-purple-500" />;
      case 'hs': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'en-stock': 'En stock',
      'sav': 'SAV',
      'vente': 'Vente',
      'en-utilisation': 'En utilisation',
      'hs': 'HS'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Recherche et Filtres */}
      <div className="space-y-4">
        {/* Champ de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par nom, SKU, marque, modèle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Filtres */}
        <div className="flex gap-2 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 text-xs">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="en-stock">En stock</SelectItem>
            <SelectItem value="sav">SAV</SelectItem>
            <SelectItem value="vente">Vente</SelectItem>
            <SelectItem value="en-utilisation">En utilisation</SelectItem>
            <SelectItem value="hs">HS</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40 text-xs">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {Array.from(new Set(products.map(p => p.category))).map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        </div>
      </div>

      {/* Tableau des produits */}
      <div className="border rounded-lg overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Nom</TableHead>
              <TableHead className="w-24">SKU/Série</TableHead>
              <TableHead className="w-28">Marque/Modèle</TableHead>
              <TableHead className="w-20">Catégorie</TableHead>
              <TableHead className="w-20">Statut</TableHead>
              <TableHead className="w-16">Prix</TableHead>
              <TableHead className="w-16">Qté</TableHead>
              <TableHead className="w-20">Valeur</TableHead>
              <TableHead className="w-20">Réception</TableHead>
              <TableHead className="w-20">Garantie</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium text-xs truncate max-w-32" title={product.name}>
                  {product.name}
                </TableCell>
                <TableCell className="text-xs">
                  <div className="space-y-0.5">
                    <div className="text-gray-600 truncate" title={product.sku}>SKU: {product.sku}</div>
                    {product.serialNumber && (
                      <div className="text-gray-600 truncate" title={product.serialNumber}>Série: {product.serialNumber}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs">
                  <div className="space-y-0.5">
                    {product.brand && <div className="truncate" title={product.brand}>{product.brand}</div>}
                    {product.model && <div className="text-gray-600 truncate" title={product.model}>{product.model}</div>}
                  </div>
                </TableCell>
                <TableCell className="text-xs">{product.category}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(product.status)}
                    <span className="text-xs">{getStatusLabel(product.status)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-xs">{formatCurrency(product.price)}</TableCell>
                <TableCell className="text-xs">{product.quantity}</TableCell>
                <TableCell className="text-xs font-medium">
                  {formatCurrency(product.quantity * product.price)}
                </TableCell>
                <TableCell className="text-xs">
                  {product.receptionDate ? formatDate(new Date(product.receptionDate)) : '-'}
                </TableCell>
                <TableCell className="text-xs">
                  {product.warrantyStartDate ? formatDate(new Date(product.warrantyStartDate)) : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditProduct?.(product)}
                      className="h-6 w-6 p-0"
                      title="Éditer"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPrintProduct?.(product)}
                      className="h-6 w-6 p-0"
                      title="Imprimer"
                    >
                      <Printer className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-500">
            Aucun produit ne correspond aux critères de filtrage.
          </p>
        </div>
      )}
    </div>
  );
};
