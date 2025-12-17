import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StockDashboard } from '@/components/StockDashboard';
import { ProductsTable } from '@/components/ProductsTable';
import { ProductForm } from '@/components/ProductForm';
import { ImportDialog } from '@/components/ImportDialog';
import { Reports } from '@/components/Reports';
import { PrintDialog } from '@/components/PrintDialog';
import { CollaboratorsManager } from '@/components/CollaboratorsManager';
import { useStockSupabase as useStock } from '@/hooks/useStockSupabase';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Package, BarChart3, Activity, Bug, Settings, RefreshCw } from 'lucide-react';
import { Product, StockMovement } from '@/types/stock';
import { ErrorAlert } from '@/components/ErrorAlert';
import { AuthForm } from '@/components/AuthForm';
import { UserHeader } from '@/components/UserHeader';
import { CategoriesManager } from '@/components/CategoriesManager';

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading: authLoading, signOut } = useAuth();
  const stockData = useStock();
  
  // Destructuration avec valeurs par défaut pour éviter les erreurs
  const { 
    products = [], 
    movements = [], 
    users = [],
    loading = false,
    error = null,
    totalProducts = 0,
    currentPage = 0,
    productsPerPage = 3000,
    addProduct = () => Promise.resolve(),
    updateProduct = () => Promise.resolve(),
    deleteProduct = () => Promise.resolve(),
    importProducts = () => Promise.resolve({ success: false, imported: 0, errors: [] }),
    loadAllProducts = () => Promise.resolve(),
    loadNextPage = () => Promise.resolve(),
    loadPreviousPage = () => Promise.resolve(),
    syncSuppliersFromProducts = () => Promise.resolve()
  } = stockData || {};

  const [showProductForm, setShowProductForm] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showCategoriesManager, setShowCategoriesManager] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [printingProduct, setPrintingProduct] = useState<Product | null>(null);
  // Utiliser tous les produits directement
  const filteredProducts = products;

  // Gérer les paramètres URL pour l'édition et l'impression
  useEffect(() => {
    const editId = searchParams.get('edit');
    const printId = searchParams.get('print');
    
    if (editId && products.length > 0) {
      const product = products.find(p => p.id === editId);
      if (product) {
        setEditingProduct(product);
        setShowProductForm(true);
        // Nettoyer l'URL
        setSearchParams({});
      }
    }
    
    if (printId && products.length > 0) {
      const product = products.find(p => p.id === printId);
      if (product) {
        setPrintingProduct(product);
        // Nettoyer l'URL
        setSearchParams({});
      }
    }
  }, [searchParams, products, setSearchParams]);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
  };

  const handleImportProducts = () => {
    setShowImportDialog(true);
  };

  const handleProductSubmit = async (data: any) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, data);
      // Les produits sont automatiquement mis à jour dans le hook useStockSupabase
      // Le dialogue des collaborateurs se rafraîchira automatiquement grâce à l'effet
    } else {
      await addProduct(data);
    }
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleImport = async (file: File) => {
    return await importProducts(file);
  };

  const handleReload = () => {
    loadAllProducts();
  };

  const handleEditProductFromCollaborator = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
    setShowCategoriesManager(false);
  };

  const handlePrintProductFromCollaborator = (product: Product) => {
    setPrintingProduct(product);
    setShowBarcodeModal(true);
    setShowCategoriesManager(false);
  };

  const handlePrintBarcode = (product: Product) => {
    setPrintingProduct(product);
  };

  // Gérer les paramètres d'URL
  useEffect(() => {
    const editId = searchParams.get('edit');
    const printId = searchParams.get('print');
    
    if (editId) {
      const product = products.find(p => p.id === editId);
      if (product) {
        setEditingProduct(product);
        setShowProductForm(true);
        // Nettoyer l'URL
        setSearchParams({});
      }
    }
    
    if (printId) {
      const product = products.find(p => p.id === printId);
      if (product) {
        setPrintingProduct(product);
        // Nettoyer l'URL
        setSearchParams({});
      }
    }
  }, [searchParams, products, setSearchParams]);

  // Afficher un loader pendant l'authentification
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Afficher le formulaire d'authentification si l'utilisateur n'est pas connecté
  if (!user) {
    return <AuthForm onAuthSuccess={() => window.location.reload()} />;
  }

  // Afficher un loader si les données ne sont pas encore chargées
  if (!stockData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <UserHeader user={user} onSignOut={signOut} />

        <ErrorAlert 
          error={error} 
          onDismiss={() => {}} 
        />

        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="debug-info">
                <AccordionTrigger className="bg-muted rounded-lg px-4 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4" />
                    <span className="font-semibold">Debug Info</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 bg-muted/50 rounded-b-lg">
                  <div className="space-y-2">
                    <p>Produits chargés: {products.length}</p>
                    <p>Produits filtrés: {filteredProducts.length}</p>
                    <p>Mouvements chargés: {movements.length}</p>
                    <p>Utilisateurs chargés: {users.length}</p>
                    <p>Loading: {loading ? 'Oui' : 'Non'}</p>
                    <p>Erreur: {error || 'Aucune'}</p>
                    <p>Page actuelle: {currentPage + 1}</p>
                    <p>Produits par page: {productsPerPage}</p>
                    <p>Total produits: {totalProducts}</p>
                    <div className="mt-4 space-y-2">
                      <Button 
                        onClick={handleReload}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Recharger les données
                      </Button>
                      <Button 
                        onClick={syncSuppliersFromProducts}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Synchroniser les fournisseurs
                      </Button>
                    </div>
                    {products.length > 0 && (
                      <div className="mt-4">
                        <p className="font-semibold mb-2">Premier produit:</p>
                        <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-40">
                          {JSON.stringify(products[0], null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Gestion du Stock</h1>
          </div>
          <StockDashboard 
            products={products}
            totalProducts={totalProducts}
            currentPage={currentPage}
            productsPerPage={productsPerPage}
            onLoadAllProducts={loadAllProducts}
            onLoadNextPage={loadNextPage}
            onLoadPreviousPage={loadPreviousPage}
          />
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produits
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Rapports
            </TabsTrigger>
            <TabsTrigger value="collaborators" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Collaborateurs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsTable
                products={filteredProducts}
                onAddProduct={handleAddProduct}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onImportProducts={handleImportProducts}
                onManageCategories={() => setShowCategoriesManager(true)}
                onPrintBarcode={handlePrintBarcode}
                totalProducts={totalProducts}
                currentPage={currentPage}
                productsPerPage={productsPerPage}
                onLoadAllProducts={loadAllProducts}
                onLoadNextPage={loadNextPage}
                onLoadPreviousPage={loadPreviousPage}
              />
          </TabsContent>




          <TabsContent value="reports">
            <Reports
              products={products}
              movements={movements}
            />
          </TabsContent>
          <TabsContent value="collaborators">
            <CollaboratorsManager 
              onEditProduct={handleEditProductFromCollaborator}
              onPrintProduct={handlePrintProductFromCollaborator}
            />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <ProductForm
          isOpen={showProductForm}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
            setSearchParams({});
          }}
          onSubmit={handleProductSubmit}
          product={editingProduct}
        />


        <ImportDialog
          isOpen={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          onImport={handleImport}
        />

        <PrintDialog
          isOpen={!!printingProduct}
          onClose={() => setPrintingProduct(null)}
          product={printingProduct}
        />

        <CategoriesManager
          isOpen={showCategoriesManager}
          onClose={() => setShowCategoriesManager(false)}
        />
      </div>
    </div>
  );
};

export default Index;
