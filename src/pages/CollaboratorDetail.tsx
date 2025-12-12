import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  User, 
  Package,
  QrCode,
  Edit,
  Printer
} from 'lucide-react';
import { Product } from '@/types/stock';
import { useCollaborators } from '@/hooks/useCollaborators';
import { useStockSupabase } from '@/hooks/useStockSupabase';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';
import { getAppUrl } from '@/lib/utils';
import QRCode from 'qrcode';

export const CollaboratorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { collaborators, loading: collaboratorsLoading } = useCollaborators();
  const { products, loading: productsLoading } = useStockSupabase();
  const [collaborator, setCollaborator] = useState<{ id: string; firstName: string; lastName: string; fullName: string } | null>(null);
  const [collaboratorProducts, setCollaboratorProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadCollaborator = () => {
      if (id && collaborators.length > 0) {
        setIsLoading(true);
        setNotFound(false);
        
        const foundCollaborator = collaborators.find(c => c.id === id);
        
        if (foundCollaborator) {
          setCollaborator({
            id: foundCollaborator.id,
            firstName: foundCollaborator.firstName,
            lastName: foundCollaborator.lastName,
            fullName: foundCollaborator.fullName
          });
          
          // Filtrer les produits assignés à ce collaborateur
          const assignedProducts = products.filter(
            product => product.assignment === foundCollaborator.fullName
          );
          setCollaboratorProducts(assignedProducts);
        } else {
          setNotFound(true);
        }
        
        setIsLoading(false);
      }
    };

    if (!collaboratorsLoading && !productsLoading) {
      loadCollaborator();
    }
  }, [id, collaborators, products, collaboratorsLoading, productsLoading]);

  // Générer le QR code
  useEffect(() => {
    const generateQRCode = async () => {
      if (collaborator && collaborator.id) {
        const qrUrl = getAppUrl(`/collaborator/${collaborator.id}`);
        const canvas = document.getElementById(`qr-${collaborator.id}`) as HTMLCanvasElement;
        if (canvas) {
          try {
            await QRCode.toCanvas(canvas, qrUrl, {
              width: 150,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#FFFFFF'
              }
            });
          } catch (error) {
            console.error('Erreur génération QR code:', error);
          }
        }
      }
    };

    if (collaborator) {
      setTimeout(generateQRCode, 100);
    }
  }, [collaborator]);

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

  if (isLoading || collaboratorsLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement des informations du collaborateur...</p>
        </div>
      </div>
    );
  }

  if (notFound || !collaborator) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
          <Card>
            <CardContent className="text-center py-8">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Collaborateur introuvable</h3>
              <p className="text-muted-foreground">
                Le collaborateur demandé n'existe pas ou a été supprimé.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'EN_STOCK':
        return 'default';
      case 'EN_UTILISATION':
        return 'secondary';
      case 'SAV':
        return 'destructive';
      case 'HS':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string | undefined) => {
    switch (status) {
      case 'EN_STOCK':
        return 'En stock';
      case 'EN_UTILISATION':
        return 'En utilisation';
      case 'SAV':
        return 'SAV';
      case 'HS':
        return 'Hors service';
      default:
        return status || 'N/A';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <User className="h-8 w-8" />
                {collaborator.fullName}
              </h1>
              <p className="text-muted-foreground">
                Détails du collaborateur et équipements assignés
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations du collaborateur */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nom complet</label>
                  <p className="text-lg font-semibold">{collaborator.fullName}</p>
                </div>
                
                <Separator />
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Prénom</label>
                  <p className="text-lg">{collaborator.firstName}</p>
                </div>
                
                <Separator />
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nom</label>
                  <p className="text-lg">{collaborator.lastName}</p>
                </div>
                
                <Separator />
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nombre d'équipements</label>
                  <p className="text-lg font-semibold">{collaboratorProducts.length}</p>
                </div>
                
                <Separator />
                
                {/* QR Code */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">QR Code</label>
                  <div className="flex justify-center">
                    <canvas 
                      id={`qr-${collaborator.id}`} 
                      width="150" 
                      height="150"
                      className="border rounded"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des équipements */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Équipements assignés ({collaboratorProducts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {collaboratorProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Aucun équipement assigné</h3>
                    <p className="text-muted-foreground">
                      Ce collaborateur n'a actuellement aucun équipement assigné.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {collaboratorProducts.map((product) => (
                      <Card key={product.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold">
                                  {product.brand} {product.model}
                                </h3>
                                <Badge variant={getStatusColor(product.status) as any}>
                                  {getStatusLabel(product.status)}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mt-3">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Numéro de série</label>
                                  <p className="text-sm font-mono">{product.serialNumber || 'N/A'}</p>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Type d'équipement</label>
                                  <p className="text-sm">
                                    {product.equipmentType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/product/${product.id}`)}
                              >
                                <QrCode className="h-4 w-4 mr-2" />
                                Voir
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
