import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { Product } from '@/types/stock';

interface SearchFilters {
  searchTerm: string;
  category: string;
  stockStatus: string;
  priceRange: string;
  supplier: string;
}

interface AdvancedSearchProps {
  products: Product[];
  onFilteredProducts: (products: Product[]) => void;
}

const categories = [
  'Toutes les catégories',
  'Informatique',
  'Accessoires',
  'Écrans',
  'Périphériques',
  'Logiciels',
  'Mobilier',
  'Autre',
];

const stockStatuses = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'en-stock', label: 'En stock' },
  { value: 'sav', label: 'SAV' },
  { value: 'vente', label: 'Vente' },
  { value: 'en-utilisation', label: 'En utilisation' },
  { value: 'hs', label: 'HS' },
];

const priceRanges = [
  { value: 'all', label: 'Tous les prix' },
  { value: '0-50', label: '0€ - 50€' },
  { value: '50-100', label: '50€ - 100€' },
  { value: '100-500', label: '100€ - 500€' },
  { value: '500+', label: '500€ et plus' },
];

export const AdvancedSearch = ({ products, onFilteredProducts }: AdvancedSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    category: 'Toutes les catégories',
    stockStatus: 'all',
    priceRange: 'all',
    supplier: '',
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const getUniqueSuppliers = () => {
    const suppliers = products
      .map(p => p.supplier)
      .filter((supplier): supplier is string => Boolean(supplier));
    return Array.from(new Set(suppliers));
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Recherche textuelle
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.description?.toLowerCase().includes(term) ||
        product.barcode?.toLowerCase().includes(term) ||
        product.qrCode?.toLowerCase().includes(term)
      );
    }

    // Filtre par catégorie
    if (filters.category !== 'Toutes les catégories') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Filtre par statut de stock
    if (filters.stockStatus !== 'all') {
      filtered = filtered.filter(product => product.status === filters.stockStatus);
    }

    // Filtre par fournisseur
    if (filters.supplier) {
      filtered = filtered.filter(product => product.supplier === filters.supplier);
    }

    // Filtre par gamme de prix
    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(product => {
        const price = product.price;
        switch (filters.priceRange) {
          case '0-50':
            return price >= 0 && price <= 50;
          case '50-100':
            return price > 50 && price <= 100;
          case '100-500':
            return price > 100 && price <= 500;
          case '500+':
            return price > 500;
          default:
            return true;
        }
      });
    }

    onFilteredProducts(filtered);
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      searchTerm: '',
      category: 'Toutes les catégories',
      stockStatus: 'all',
      priceRange: 'all',
      supplier: '',
    };
    setFilters(clearedFilters);
    onFilteredProducts(products);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.category !== 'Toutes les catégories') count++;
    if (filters.stockStatus !== 'all') count++;
    if (filters.priceRange !== 'all') count++;
    if (filters.supplier) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recherche avancée
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {isExpanded ? 'Masquer' : 'Filtres'}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Effacer
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Recherche principale */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher par nom, SKU, description, code-barres..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="pl-10"
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>

          {/* Filtres avancés */}
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Catégorie</label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Statut de stock</label>
                <Select
                  value={filters.stockStatus}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, stockStatus: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stockStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Gamme de prix</label>
                <Select
                  value={filters.priceRange}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Fournisseur</label>
                <Select
                  value={filters.supplier}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, supplier: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les fournisseurs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les fournisseurs</SelectItem>
                    {getUniqueSuppliers().map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Effacer
            </Button>
            <Button onClick={applyFilters} className="bg-gradient-primary">
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
