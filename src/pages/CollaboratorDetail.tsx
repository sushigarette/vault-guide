import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, User, QrCode } from 'lucide-react';
import { Product } from '@/types/stock';
import { useStockSupabase } from '@/hooks/useStockSupabase';
import { useCollaborators } from '@/hooks/useCollaborators';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';

export const CollaboratorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { products, loading: productsLoading } = useStockSupabase();
  const { collaborators, loading: collaboratorsLoading } = useCollaborators();
  const [collaboratorProducts, setCollaboratorProducts] = useState<Product[]>([]);
  const [collaborator, setCollaborator] = useState<{ id: string; fullName: string } | null>(null);

  useEffect(() => {
    if (id && collaborators.length > 0) {
      const foundCollaborator = collaborators.find(c => c.id === id);
      if (foundCollaborator) {
        setCollaborator({ id: foundCollaborator.id, fullName: foundCollaborator.fullName });
      }
    }
  }, [id, collaborators]);

  useEffect(() => {
    if (collaborator && products.length > 0) {
      const assignedProducts = products.filter(
        product => product.assignment === collaborator.fullName
      );
      setCollaboratorProducts(assignedProducts);
    }
  }, [collaborator, products]);

  if (authLoading || productsLoading || collaboratorsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <AuthForm />
      </div>
    );
  }

  if (!collaborator) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Collaborateur non trouvé</p>
              <Button onClick={() => navigate('/')} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à l'accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{collaborator.fullName}</CardTitle>
                <CardDescription>
                  {collaboratorProducts.length} équipement(s) assigné(s)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {collaboratorProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collaboratorProducts.map((product) => (
            <Card 
              key={product.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold truncate">
                      {product.brand} {product.model}
                    </CardTitle>
                    <CardDescription className="text-sm truncate">
                      {product.serialNumber}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="outline" className="capitalize">
                      {product.equipmentType?.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Statut:</span>
                    <Badge 
                      variant={
                        product.status === 'EN_STOCK' ? 'default' :
                        product.status === 'EN_UTILISATION' ? 'secondary' :
                        product.status === 'SAV' ? 'destructive' : 'outline'
                      }
                    >
                      {product.status === 'EN_STOCK' ? 'En Stock' :
                       product.status === 'EN_UTILISATION' ? 'En Utilisation' :
                       product.status === 'SAV' ? 'SAV' : 'HS'}
                    </Badge>
                  </div>
                  {product.purchasePriceHt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Prix d'achat:</span>
                      <span className="font-medium">
                        {product.purchasePriceHt.toFixed(2)} €
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Quantité:</span>
                    <span className="font-medium">{product.currentQuantity}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Aucun équipement assigné à {collaborator.fullName}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

