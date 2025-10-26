import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, TrendingUp, Activity, Download, GripVertical } from 'lucide-react';
import { Product } from '@/types/stock';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useUserPreferences } from '@/hooks/useUserPreferences';

// Composant pour les cartes draggables
const DraggableCard = ({ 
  cardId, 
  children 
}: { 
  cardId: string; 
  children: React.ReactNode; 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cardId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 mb-2 opacity-50" />
      </div>
      {children}
    </div>
  );
};

interface StockDashboardProps {
  products: Product[];
  totalProducts?: number;
  currentPage?: number;
  productsPerPage?: number;
  onLoadAllProducts?: () => void;
  onLoadNextPage?: () => void;
  onLoadPreviousPage?: () => void;
}

export const StockDashboard = ({ 
  products = [],
  totalProducts = 0, 
  currentPage = 0, 
  productsPerPage = 3000,
  onLoadAllProducts,
  onLoadNextPage,
  onLoadPreviousPage
}: StockDashboardProps) => {
  const { preferences, reorderDashboardCards, resetPreferences } = useUserPreferences();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  // Calculer les statistiques
  const totalValue = products.reduce((sum, product) => {
    // Utiliser purchasePriceHt * currentQuantity pour calculer la valeur totale
    const price = product.purchasePriceHt || 0;
    const quantity = product.currentQuantity || 0;
    return sum + (price * quantity);
  }, 0);
  
  const byStatus = products.reduce((acc, product) => {
    acc[product.status] = (acc[product.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byAssignment = products.reduce((acc, product) => {
    if (product.assignment) {
      acc[product.assignment] = (acc[product.assignment] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const enStockCount = byStatus['EN_STOCK'] || 0;
  const savCount = byStatus['SAV'] || 0;
  const enUtilisationCount = byStatus['EN_UTILISATION'] || 0;
  const hsCount = byStatus['HS'] || 0;
  
  // Compter les collaborateurs assignés
  const employeeCount = Object.values(byAssignment).reduce((sum, count) => sum + count, 0);

  // Obtenir les affectations uniques pour l'affichage
  const uniqueAssignments = Object.keys(byAssignment).sort();

  // Gestion du drag & drop
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = preferences.dashboardCards.indexOf(active.id);
      const newIndex = preferences.dashboardCards.indexOf(over.id);
      
      const newOrder = arrayMove(preferences.dashboardCards, oldIndex, newIndex);
      reorderDashboardCards(newOrder);
    }
  };

  // Configuration des cartes
  const cardConfig = {
    totalProducts: {
      title: 'Total Produits',
      icon: Package,
      value: totalProducts,
      subtitle: `${products.length} chargés`,
      color: 'font-bold'
    },
    totalValue: {
      title: 'Valeur Totale',
      icon: TrendingUp,
      value: formatCurrency(totalValue),
      subtitle: 'Montant total',
      color: 'font-bold'
    },
    enStock: {
      title: 'En Stock',
      icon: Activity,
      value: enStockCount,
      subtitle: 'Disponibles',
      color: 'font-bold text-green-600'
    },
    sav: {
      title: 'SAV',
      icon: Activity,
      value: savCount,
      subtitle: 'En réparation',
      color: 'font-bold text-orange-600'
    },
    enUtilisation: {
      title: 'En Utilisation',
      icon: Activity,
      value: enUtilisationCount,
      subtitle: 'En cours',
      color: 'font-bold text-yellow-600'
    },
    hs: {
      title: 'HS',
      icon: Activity,
      value: hsCount,
      subtitle: 'Hors service',
      color: 'font-bold text-red-600'
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiques générales */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Tableau de bord</h2>
        <Button onClick={resetPreferences} variant="outline" size="sm">
          Réinitialiser l'ordre
        </Button>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          <SortableContext items={preferences.dashboardCards} strategy={rectSortingStrategy}>
            {preferences.dashboardCards.map((cardId) => {
              const config = cardConfig[cardId as keyof typeof cardConfig];
              if (!config) return null;
              
              const IconComponent = config.icon;
              
              return (
                <DraggableCard key={cardId} cardId={cardId}>
                  <Card className="min-h-[100px]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-xs font-medium truncate">{config.title}</CardTitle>
                      <IconComponent className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className={`${config.color} text-lg`}>{config.value}</div>
                      <p className="text-xs text-muted-foreground truncate">
                        {config.subtitle}
                      </p>
                    </CardContent>
                  </Card>
                </DraggableCard>
              );
            })}
          </SortableContext>
        </div>
      </DndContext>



      {/* Contrôles de pagination */}
      {totalProducts > productsPerPage && (
        <Card>
          <CardHeader>
            <CardTitle>Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {currentPage + 1} - Affichage de {Math.min((currentPage + 1) * productsPerPage, totalProducts)} sur {totalProducts} produits
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};