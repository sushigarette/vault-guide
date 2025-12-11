import React, { useState, useEffect } from 'react';
import { useCollaborators } from '@/hooks/useCollaborators';
import { useStockSupabase } from '@/hooks/useStockSupabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Users, Package, X, Pencil, Printer, Link, QrCode } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Product } from '@/types/stock';
import { getAppUrl } from '@/lib/utils';
import QRCode from 'qrcode';

interface CollaboratorsManagerProps {
  onEditProduct?: (product: Product) => void;
  onPrintProduct?: (product: Product) => void;
}

export const CollaboratorsManager: React.FC<CollaboratorsManagerProps> = ({ 
  onEditProduct, 
  onPrintProduct 
}) => {
  const { collaborators, loading, error, addCollaborator, deleteCollaborator, updateCollaborator } = useCollaborators();
  const { products, updateProduct } = useStockSupabase();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<{ id: string; firstName: string; lastName: string } | null>(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '' });
  const [selectedCollaborator, setSelectedCollaborator] = useState<string | null>(null);
  const [showProductsDialog, setShowProductsDialog] = useState(false);
  const [showAssignProductDialog, setShowAssignProductDialog] = useState(false);
  const [assigningToCollaborator, setAssigningToCollaborator] = useState<string | null>(null);
  const [searchProduct, setSearchProduct] = useState('');

  const handleAdd = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    try {
      await addCollaborator(formData.firstName.trim(), formData.lastName.trim());
      setFormData({ firstName: '', lastName: '' });
      setIsAddDialogOpen(false);
      toast({
        title: "Succès",
        description: "Collaborateur ajouté avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout du collaborateur",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!editingCollaborator || !formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateCollaborator(editingCollaborator.id, formData.firstName.trim(), formData.lastName.trim());
      setEditingCollaborator(null);
      setFormData({ firstName: '', lastName: '' });
      setIsEditDialogOpen(false);
      toast({
        title: "Succès",
        description: "Collaborateur modifié avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la modification du collaborateur",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, fullName: string) => {
    try {
      await deleteCollaborator(id);
      toast({
        title: "Succès",
        description: `${fullName} supprimé avec succès`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression du collaborateur",
        variant: "destructive",
      });
    }
  };

  const handleShowProducts = (collaboratorName: string) => {
    setSelectedCollaborator(collaboratorName);
    setShowProductsDialog(true);
  };

  const getCollaboratorProducts = (collaboratorName: string): Product[] => {
    return products.filter(product => product.assignment === collaboratorName);
  };

  const getCollaboratorName = (collaborator: { firstName: string; lastName: string }) => {
    return `${collaborator.firstName} ${collaborator.lastName}`;
  };

  const openEditDialog = (collaborator: { id: string; firstName: string; lastName: string }) => {
    setEditingCollaborator(collaborator);
    setFormData({ firstName: collaborator.firstName, lastName: collaborator.lastName });
    setIsEditDialogOpen(true);
  };

  const openAssignProductDialog = (collaboratorName: string) => {
    setAssigningToCollaborator(collaboratorName);
    setSearchProduct('');
    setShowAssignProductDialog(true);
  };

  const handleAssignProduct = async (product: Product) => {
    if (!assigningToCollaborator) return;

    try {
      await updateProduct(product.id, { assignment: assigningToCollaborator });
      toast({
        title: "Succès",
        description: `Équipement "${product.brand} ${product.model}" assigné à ${assigningToCollaborator}`,
      });
      setShowAssignProductDialog(false);
      setAssigningToCollaborator(null);
      setSearchProduct('');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'assignation de l'équipement",
        variant: "destructive",
      });
    }
  };

  const getAvailableProducts = (): Product[] => {
    return products.filter(product => {
      // Filtrer par recherche
      const matchesSearch = !searchProduct || 
        product.serialNumber?.toLowerCase().includes(searchProduct.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchProduct.toLowerCase()) ||
        product.model?.toLowerCase().includes(searchProduct.toLowerCase());
      
      return matchesSearch;
    });
  };

  // Générer les QR codes pour chaque collaborateur
  useEffect(() => {
    const generateQRCodes = async () => {
      for (const collaborator of collaborators) {
        const canvasId = `qr-collaborator-${collaborator.id}`;
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (canvas) {
          const qrUrl = getAppUrl(`/collaborator/${collaborator.id}`);
          try {
            await QRCode.toCanvas(canvas, qrUrl, {
              width: 120,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#FFFFFF'
              }
            });
          } catch (error) {
            console.error(`Erreur génération QR code pour ${collaborator.fullName}:`, error);
          }
        }
      }
    };

    if (collaborators.length > 0) {
      // Attendre que le DOM soit prêt
      setTimeout(generateQRCodes, 100);
    }
  }, [collaborators]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestion des collaborateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gestion des collaborateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">Erreur: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestion des collaborateurs
            </CardTitle>
            <CardDescription>
              {collaborators.length} collaborateur(s) actif(s)
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (open) {
              // Réinitialiser le formulaire quand on ouvre le modal d'ajout
              setFormData({ firstName: '', lastName: '' });
              setEditingCollaborator(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un collaborateur</DialogTitle>
                <DialogDescription>
                  Ajoutez un nouveau collaborateur à la liste.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firstName" className="text-right">
                    Prénom
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="col-span-3"
                    placeholder="Prénom"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastName" className="text-right">
                    Nom
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="col-span-3"
                    placeholder="Nom de famille"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAdd}>
                  Ajouter
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collaborators.map((collaborator) => (
            <Card key={collaborator.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="text-sm">
                  {collaborator.fullName}
                </Badge>
                <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openAssignProductDialog(collaborator.fullName)}
                  title="Assigner un équipement"
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Link className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShowProducts(collaborator.fullName)}
                  title="Voir les produits affectés"
                >
                  <Package className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog({
                    id: collaborator.id,
                    firstName: collaborator.firstName,
                    lastName: collaborator.lastName
                  })}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer le collaborateur</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer {collaborator.fullName} ? 
                        Cette action ne peut pas être annulée.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(collaborator.id, collaborator.fullName)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              </div>
              
              {/* QR Code du collaborateur */}
              <div className="flex flex-col items-center gap-2 pt-3 border-t">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <QrCode className="h-3 w-3" />
                  <span>Scanner pour voir les équipements</span>
                </div>
                <canvas 
                  id={`qr-collaborator-${collaborator.id}`}
                  className="border rounded p-1 bg-white"
                  style={{ width: '120px', height: '120px' }}
                />
              </div>
            </Card>
          ))}
        </div>

        {/* Dialog de modification */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le collaborateur</DialogTitle>
              <DialogDescription>
                Modifiez les informations du collaborateur.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editFirstName" className="text-right">
                  Prénom
                </Label>
                <Input
                  id="editFirstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="col-span-3"
                  placeholder="Prénom"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editLastName" className="text-right">
                  Nom
                </Label>
                <Input
                  id="editLastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="col-span-3"
                  placeholder="Nom de famille"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleEdit}>
                Modifier
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog pour afficher les produits du collaborateur */}
        <Dialog open={showProductsDialog} onOpenChange={setShowProductsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produits affectés à {selectedCollaborator}
              </DialogTitle>
              <DialogDescription>
                Liste des produits assignés à ce collaborateur
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedCollaborator && getCollaboratorProducts(selectedCollaborator).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getCollaboratorProducts(selectedCollaborator).map((product) => (
                    <Card key={product.id} className="p-4 max-w-full overflow-hidden">
                      <CardHeader className="p-0 pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm font-medium truncate" title={`${product.brand} ${product.model}`}>
                              {product.brand} {product.model}
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground truncate" title={product.serialNumber}>
                              {product.serialNumber}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                            {onEditProduct && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditProduct(product)}
                                title="Modifier le produit"
                                className="h-6 w-6 p-0"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            )}
                            {onPrintProduct && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onPrintProduct(product)}
                                title="Imprimer le code-barres"
                                className="h-6 w-6 p-0"
                              >
                                <Printer className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Type:</span>
                            <span className="capitalize">{product.equipmentType?.replace('_', ' ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Statut:</span>
                            <Badge variant="outline" className="text-xs">
                              {product.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun produit affecté à ce collaborateur</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowProductsDialog(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog pour assigner un équipement */}
        <Dialog open={showAssignProductDialog} onOpenChange={setShowAssignProductDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Assigner un équipement à {assigningToCollaborator}
              </DialogTitle>
              <DialogDescription>
                Sélectionnez un équipement de la base de données à assigner à ce collaborateur
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="Rechercher un équipement (N° série, marque, modèle)..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto">
                {getAvailableProducts().length > 0 ? (
                  getAvailableProducts().map((product) => (
                    <Card 
                      key={product.id} 
                      className="p-4 max-w-full overflow-hidden cursor-pointer hover:bg-accent transition-colors"
                      onClick={() => handleAssignProduct(product)}
                    >
                      <CardHeader className="p-0 pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm font-medium truncate" title={`${product.brand} ${product.model}`}>
                              {product.brand} {product.model}
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground truncate" title={product.serialNumber}>
                              {product.serialNumber}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Type:</span>
                            <span className="capitalize">{product.equipmentType?.replace('_', ' ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Statut:</span>
                            <Badge variant="outline" className="text-xs">
                              {product.status}
                            </Badge>
                          </div>
                          {product.assignment && (
                            <div className="flex justify-between">
                              <span>Actuellement assigné à:</span>
                              <span className="text-orange-600 font-medium">{product.assignment}</span>
                            </div>
                          )}
                          {!product.assignment && (
                            <div className="text-green-600 text-xs font-medium mt-2">
                              ✓ Disponible
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucun équipement trouvé</p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowAssignProductDialog(false);
                setAssigningToCollaborator(null);
                setSearchProduct('');
              }}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};


