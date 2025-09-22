import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StockDashboard } from '@/components/StockDashboard';
import { ProductsTable } from '@/components/ProductsTable';
import { StockMovements } from '@/components/StockMovements';
import { useStock } from '@/hooks/useStock';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, BarChart3, Activity } from 'lucide-react';

const Index = () => {
  const { products, movements, stats, addProduct, updateProduct, deleteProduct, addMovement } = useStock();

  const handleAddProduct = () => {
    // Placeholder - would open a modal/form
    console.log('Add product clicked');
  };

  const handleEditProduct = (product: any) => {
    // Placeholder - would open a modal/form
    console.log('Edit product:', product);
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
  };

  const handleAddMovement = () => {
    // Placeholder - would open a modal/form
    console.log('Add movement clicked');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Gestion de Stock
          </h1>
          <p className="text-muted-foreground mt-2">
            Suivez et gérez votre inventaire en temps réel
          </p>
        </header>

        <div className="mb-8">
          <StockDashboard stats={stats} />
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produits
            </TabsTrigger>
            <TabsTrigger value="movements" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Mouvements
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Rapports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsTable
              products={products}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          </TabsContent>

          <TabsContent value="movements">
            <StockMovements
              movements={movements}
              products={products}
              onAddMovement={handleAddMovement}
            />
          </TabsContent>

          <TabsContent value="reports">
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Rapports à venir</h3>
              <p>Les fonctionnalités de rapport seront disponibles prochainement.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
