import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Plus, Edit, Trash2, Printer, ArrowUpDown, ArrowUp, ArrowDown, GripVertical, Filter, X, Settings, QrCode } from 'lucide-react';
import { Product } from '@/types/stock';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useIsMobile } from '@/hooks/use-mobile';

// Composant pour les en-têtes de colonnes draggables
const DraggableTableHead = ({ 
  columnId, 
  children, 
  onSort, 
  sortField, 
  sortDirection 
}: { 
  columnId: string; 
  children: React.ReactNode; 
  onSort: (field: string) => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: columnId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableHead ref={setNodeRef} style={style} {...attributes} className="w-0">
      <div className="flex items-center w-full">
        {/* Zone de drag & drop */}
        <div {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-3 w-3 mr-1 opacity-50" />
        </div>
        
        {/* Zone de tri cliquable */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSort(columnId)}
          className="h-auto p-0 font-medium hover:bg-transparent flex-1 justify-start text-xs"
        >
          {children}
          {sortField === columnId ? (
            sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
          ) : (
            <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
          )}
        </Button>
      </div>
    </TableHead>
  );
};

interface ProductsTableProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onImportProducts: () => void;
  onManageCategories?: () => void;
  onPrintProduct?: (product: Product) => void;
  totalProducts?: number;
  currentPage?: number;
  productsPerPage?: number;
  onLoadAllProducts?: () => void;
  onLoadNextPage?: () => void;
  onLoadPreviousPage?: () => void;
}

export const ProductsTable = ({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onImportProducts,
  onManageCategories,
  onPrintProduct,
  totalProducts = 0,
  currentPage = 0,
  productsPerPage = 3000,
  onLoadAllProducts,
  onLoadNextPage,
  onLoadPreviousPage,
}: ProductsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    equipmentType: '',
    status: '',
    supplier: '',
    assignment: '',
    brand: ''
  });
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const { preferences, reorderTableColumns, resetPreferences } = useUserPreferences();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fonction pour obtenir les valeurs uniques pour les filtres
  const getUniqueValues = (field: keyof Product) => {
    const values = products
      .filter(product => product && product.id) // S'assurer que le produit existe
      .map(product => product[field])
      .filter((value): value is string => {
        return value != null && 
               value !== '' && 
               value.trim() !== '' && 
               typeof value === 'string' &&
               value.length > 0;
      })
      .filter((value, index, array) => array.indexOf(value) === index)
      .sort();
    
    // Debug: afficher les valeurs disponibles pour chaque champ
    console.log(`📋 Valeurs uniques pour ${field}:`, values);
    
    return values;
  };

  // Fonction pour obtenir les collaborateurs uniques (pour l'affectation)
  const getUniqueCollaborators = () => {
    const collaborators = products
      .filter(product => product && product.id) // S'assurer que le produit existe
      .map(product => product.assignment)
      .filter((value): value is string => {
        return value != null && 
               value !== '' && 
               value.trim() !== '' && 
               typeof value === 'string' &&
               value.length > 0;
      })
      .filter((value, index, array) => array.indexOf(value) === index)
      .sort();
    
    return collaborators;
  };

  const filteredProducts = products.filter((product) => {
    // Vérifier que le produit existe et a un ID
    if (!product || !product.id) {
      return false;
    }

    // Filtre de recherche textuelle - recherche dans tous les champs du produit
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || (
      // Champs principaux
      (product.serialNumber && product.serialNumber.toLowerCase().includes(searchTermLower)) ||
      (product.brand && product.brand.toLowerCase().includes(searchTermLower)) ||
      (product.model && product.model.toLowerCase().includes(searchTermLower)) ||
      (product.assignment && product.assignment.toLowerCase().includes(searchTermLower)) ||
      (product.supplier && product.supplier.toLowerCase().includes(searchTermLower)) ||
      
      // Champs additionnels
      (product.parcNumber && product.parcNumber.toLowerCase().includes(searchTermLower)) ||
      (product.equipmentType && product.equipmentType.toLowerCase().includes(searchTermLower)) ||
      (product.status && product.status.toLowerCase().includes(searchTermLower)) ||
      (product.invoiceNumber && product.invoiceNumber.toLowerCase().includes(searchTermLower)) ||
      (product.comments && product.comments.toLowerCase().includes(searchTermLower)) ||
      
      // Champs numériques convertis en texte
      (product.quantity && product.quantity.toString().includes(searchTerm)) ||
      (product.currentQuantity && product.currentQuantity.toString().includes(searchTerm)) ||
      (product.purchasePriceHt && product.purchasePriceHt.toString().includes(searchTerm)) ||
      (product.currentValue && product.currentValue.toString().includes(searchTerm)) ||
      (product.usageDurationYears && product.usageDurationYears.toString().includes(searchTerm)) ||
      
      // Champs de dates
      (product.entryDate && product.entryDate.includes(searchTerm)) ||
      (product.exitDate && product.exitDate.includes(searchTerm))
    );

    // Filtres spécifiques
    const matchesEquipmentType = !filters.equipmentType || product.equipmentType === filters.equipmentType;
    const matchesStatus = !filters.status || product.status === filters.status;
    const matchesSupplier = !filters.supplier || product.supplier === filters.supplier;
    const matchesAssignment = !filters.assignment || product.assignment === filters.assignment;
    const matchesBrand = !filters.brand || product.brand === filters.brand;

    // Debug: afficher les filtres actifs
    if (Object.values(filters).some(value => value !== '')) {
      console.log('🔍 Filtres actifs:', filters);
      console.log('📦 Produit:', product.brand, product.model, {
        equipmentType: product.equipmentType,
        status: product.status,
        supplier: product.supplier,
        assignment: product.assignment,
        brand: product.brand
      });
      console.log('✅ Correspondances:', {
        matchesEquipmentType,
        matchesStatus,
        matchesSupplier,
        matchesAssignment,
        matchesBrand
      });
    }

    return matchesSearch && matchesEquipmentType && matchesStatus && matchesSupplier && matchesAssignment && matchesBrand;
  });

  // Fonction de tri
  const handleSort = (field: string) => {
    console.log('🔄 Tri demandé pour le champ:', field);
    console.log('📊 Champ actuel:', sortField);
    console.log('📈 Direction actuelle:', sortDirection);
    
    if (sortField === field) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      console.log('🔄 Changement de direction vers:', newDirection);
      setSortDirection(newDirection);
    } else {
      console.log('🆕 Nouveau champ de tri:', field);
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Gestion du drag & drop
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    // Vérifier que over existe et que les IDs sont différents
    if (over && active.id !== over.id) {
      const oldIndex = preferences.tableColumns.indexOf(active.id);
      const newIndex = preferences.tableColumns.indexOf(over.id);
      
      // Vérifier que les indices sont valides
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(preferences.tableColumns, oldIndex, newIndex);
        reorderTableColumns(newOrder);
      }
    }
  };

  // Fonctions pour gérer les filtres
  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      equipmentType: '',
      status: '',
      supplier: '',
      assignment: '',
      brand: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  // Déduplication des produits par ID pour éviter les clés React dupliquées
  const uniqueProducts = filteredProducts.reduce((acc, product) => {
    if (!acc.find(p => p.id === product.id)) {
      acc.push(product);
    }
    return acc;
  }, [] as Product[]);

  // Produits triés
  const sortedProducts = [...uniqueProducts].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue: any = a[sortField as keyof Product];
    let bValue: any = b[sortField as keyof Product];
    
    // Gérer les valeurs nulles/undefined
    if (aValue == null) aValue = '';
    if (bValue == null) bValue = '';
    
    // Convertir en string pour la comparaison
    aValue = String(aValue).toLowerCase();
    bValue = String(bValue).toLowerCase();
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'EN_STOCK':
        return <Badge className="bg-green-500 text-white text-xs leading-tight px-2 py-1">
          <div className="text-center">
            <div>EN</div>
            <div>STOCK</div>
          </div>
        </Badge>;
      case 'SAV':
        return <Badge className="bg-orange-500 text-white">SAV</Badge>;
      case 'EN_UTILISATION':
        return <Badge className="bg-yellow-500 text-white">En utilisation</Badge>;
      case 'HS':
        return <Badge className="bg-red-500 text-white">HS</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAssignmentBadge = (assignment?: string) => {
    if (!assignment || assignment === "" || assignment === "none") {
      return <Badge variant="outline" className="text-gray-500">Non assigné</Badge>;
    }
    
    return <Badge className="bg-blue-500 text-white text-xs px-2 py-1" title={assignment}>
      {assignment.length > 20 ? assignment.substring(0, 20) + '...' : assignment}
    </Badge>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Configuration des colonnes
  const columnConfig = {
    serialNumber: { 
      label: 'N° Série', 
      className: 'w-[12%]',
      render: (product: Product) => (
        <div className="min-w-0">
          <div className="font-mono text-xs truncate" title={product.serialNumber}>
            {product.serialNumber}
          </div>
          {product.parcNumber && (
            <div className="text-xs text-muted-foreground truncate" title={`Réf: ${product.parcNumber}`}>
              Réf: {product.parcNumber}
            </div>
          )}
        </div>
      )
    },
    brand: { 
      label: 'Marque', 
      className: 'w-[10%]',
      render: (product: Product) => (
        <div className="text-sm truncate" title={product.brand}>
          {product.brand}
        </div>
      )
    },
    model: { 
      label: 'Modèle', 
      className: 'w-[10%]',
      render: (product: Product) => (
        <div className="text-sm truncate" title={product.model}>
          {product.model}
        </div>
      )
    },
    equipmentType: { 
      label: 'Type', 
      className: 'w-[10%]',
      render: (product: Product) => (
        <Badge variant="outline" className="text-xs">
          {product.equipmentType ? 
            product.equipmentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
            'Non défini'
          }
        </Badge>
      )
    },
    currentQuantity: { 
      label: 'Qté', 
      className: 'w-[6%]',
      render: (product: Product) => (
        <div className="text-center text-sm font-medium">{product.currentQuantity}</div>
      )
    },
    purchasePriceHt: { 
      label: 'Prix HT', 
      className: 'w-[10%]',
      render: (product: Product) => (
        <div className="text-sm">
          {product.purchasePriceHt ? formatCurrency(product.purchasePriceHt) : '-'}
        </div>
      )
    },
    supplier: { 
      label: 'Fournisseur', 
      className: 'w-[10%]',
      render: (product: Product) => (
        <div className="text-sm truncate" title={product.supplier || '-'}>
          {product.supplier || '-'}
        </div>
      )
    },
    status: { 
      label: 'Statut', 
      className: 'w-[8%]',
      render: (product: Product) => getStatusBadge(product.status || 'EN_STOCK')
    },
    assignment: { 
      label: 'Affectation', 
      className: 'w-[9%]',
      render: (product: Product) => getAssignmentBadge(product.assignment)
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Produits ({filteredProducts.length})
          </CardTitle>
          <div className={`flex gap-2 ${isMobile ? 'flex-wrap' : ''}`}>
            {!isMobile && (
              <>
                <Button onClick={onImportProducts} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Importer
                </Button>
                {onManageCategories && (
                  <Button 
                    onClick={onManageCategories} 
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Gérer les catégories
                  </Button>
                )}
                <Button 
                  onClick={() => navigate('/qr-codes')} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  Imprimer QR Codes
                </Button>
                <Button onClick={resetPreferences} variant="outline" size="sm">
                  Réinitialiser l'ordre
                </Button>
              </>
            )}
            <Button onClick={onAddProduct} className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              {isMobile ? 'Ajouter' : 'Ajouter un produit'}
            </Button>
            {isMobile && (
              <>
                <Button onClick={onImportProducts} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button 
                  onClick={() => navigate('/qr-codes')} 
                  variant="outline"
                  size="sm"
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par numéro de série, marque, modèle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtres
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {Object.values(filters).filter(v => v !== '').length}
                </Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type de matériel</label>
                <select
                  value={filters.equipmentType}
                  onChange={(e) => handleFilterChange('equipmentType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tous les types</option>
                  {getUniqueValues('equipmentType').map((type) => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Statut</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tous les statuts</option>
                  {getUniqueValues('status').map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Fournisseur</label>
                <select
                  value={filters.supplier}
                  onChange={(e) => handleFilterChange('supplier', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tous les fournisseurs</option>
                  {getUniqueValues('supplier').map((supplier) => (
                    <option key={supplier} value={supplier}>
                      {supplier}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Collaborateur</label>
                <select
                  value={filters.assignment}
                  onChange={(e) => handleFilterChange('assignment', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tous les collaborateurs</option>
                  {getUniqueCollaborators().map((collaborator) => (
                    <option key={collaborator} value={collaborator}>
                      {collaborator}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Marque</label>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Toutes les marques</option>
                  {getUniqueValues('brand').map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  disabled={!hasActiveFilters}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Effacer les filtres
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Vue mobile : Cartes */}
        {isMobile ? (
          <div className="space-y-3">
            {sortedProducts.map((product) => (
              <Card 
                key={product.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Informations principales */}
                      <div className="mb-2">
                        <h3 className="font-semibold text-base mb-1 truncate">
                          {product.brand} {product.model}
                        </h3>
                        <p className="text-sm text-muted-foreground font-mono truncate">
                          N°: {product.serialNumber || 'N/A'}
                        </p>
                      </div>

                      {/* Badges et informations secondaires */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {product.equipmentType && (
                          <Badge variant="outline" className="text-xs">
                            {product.equipmentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        )}
                        <Badge 
                          variant={
                            product.status === 'EN_STOCK' ? 'default' :
                            product.status === 'EN_UTILISATION' ? 'secondary' :
                            product.status === 'SAV' ? 'destructive' : 'outline'
                          }
                          className="text-xs"
                        >
                          {product.status?.replace('_', ' ') || 'N/A'}
                        </Badge>
                        {product.currentQuantity > 0 && (
                          <Badge variant="outline" className="text-xs">
                            Qté: {product.currentQuantity}
                          </Badge>
                        )}
                      </div>

                      {/* Informations supplémentaires */}
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {product.supplier && (
                          <div className="truncate">
                            <span className="font-medium">Fournisseur:</span> {product.supplier}
                          </div>
                        )}
                        {product.assignment && (
                          <div className="truncate">
                            <span className="font-medium">Assigné à:</span> {product.assignment}
                          </div>
                        )}
                        {product.purchasePriceHt && (
                          <div>
                            <span className="font-medium">Prix HT:</span> {formatCurrency(product.purchasePriceHt)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div 
                      className="flex flex-col gap-2 flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditProduct(product)}
                        className="h-9 w-9 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteProduct(product.id)}
                        className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {onPrintProduct && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onPrintProduct(product)}
                          className="h-9 w-9 p-0"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Vue desktop : Tableau */
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow>
                    <SortableContext items={preferences.tableColumns} strategy={verticalListSortingStrategy}>
                      {preferences.tableColumns.map((columnId) => (
                        <DraggableTableHead
                          key={columnId}
                          columnId={columnId}
                          onSort={handleSort}
                          sortField={sortField}
                          sortDirection={sortDirection}
                        >
                          {columnConfig[columnId as keyof typeof columnConfig]?.label || columnId}
                        </DraggableTableHead>
                      ))}
                    </SortableContext>
                    <TableHead className="w-[5%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {sortedProducts.map((product) => (
                  <TableRow 
                    key={product.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {preferences.tableColumns.map((columnId) => {
                      const config = columnConfig[columnId as keyof typeof columnConfig];
                      return (
                        <TableCell key={columnId} className={config?.className || ''}>
                          {config?.render(product) || '-'}
                        </TableCell>
                      );
                    })}
                    <TableCell className="w-[5%]" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditProduct(product)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDeleteProduct(product.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        {onPrintProduct && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPrintProduct(product)}
                            className="h-8 w-8 p-0"
                          >
                            <Printer className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                </TableBody>
            </Table>
          </DndContext>
        )}

        {sortedProducts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucun produit trouvé</p>
            <p className="text-sm">Essayez de modifier votre recherche</p>
          </div>
        )}

        {/* Pagination */}
        {totalProducts > productsPerPage && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Affichage de {currentPage * productsPerPage + 1} à {Math.min((currentPage + 1) * productsPerPage, totalProducts)} sur {totalProducts} produits
            </div>
            <div className="flex gap-2">
              {onLoadPreviousPage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLoadPreviousPage}
                  disabled={currentPage === 0}
                >
                  Précédent
                </Button>
              )}
              {onLoadNextPage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLoadNextPage}
                  disabled={(currentPage + 1) * productsPerPage >= totalProducts}
                >
                  Suivant
                </Button>
              )}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};