import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Package, 
  Building,
  Save,
  X
} from 'lucide-react';
import { EquipmentType, Supplier } from '@/types/stock';
import { useStockSupabase } from '@/hooks/useStockSupabase';

interface CategoriesManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoriesManager = ({ isOpen, onClose }: CategoriesManagerProps) => {
  const { 
    equipmentTypes, 
    suppliers, 
    addEquipmentType, 
    updateEquipmentType, 
    deleteEquipmentType,
    addSupplier, 
    updateSupplier, 
    deleteSupplier,
    loadSuppliers,
    loadEquipmentTypes
  } = useStockSupabase();

  const [editingEquipmentType, setEditingEquipmentType] = useState<EquipmentType | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [equipmentTypeForm, setEquipmentTypeForm] = useState({
    name: '',
    displayName: '',
    description: '',
    isActive: true
  });
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    isActive: true
  });

  // Recharger les données quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      loadSuppliers();
      loadEquipmentTypes();
    }
  }, [isOpen, loadSuppliers, loadEquipmentTypes]);

  const resetEquipmentTypeForm = () => {
    setEquipmentTypeForm({
      name: '',
      displayName: '',
      description: '',
      isActive: true
    });
    setEditingEquipmentType(null);
  };

  const resetSupplierForm = () => {
    setSupplierForm({
      name: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      isActive: true
    });
    setEditingSupplier(null);
  };

  const handleEditEquipmentType = (equipmentType: EquipmentType) => {
    setEditingEquipmentType(equipmentType);
    setEquipmentTypeForm({
      name: equipmentType.name,
      displayName: equipmentType.displayName,
      description: equipmentType.description || '',
      isActive: equipmentType.isActive
    });
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierForm({
      name: supplier.name,
      contactEmail: supplier.contactEmail || '',
      contactPhone: supplier.contactPhone || '',
      address: supplier.address || '',
      isActive: supplier.isActive
    });
  };

  const handleSaveEquipmentType = async () => {
    try {
      if (editingEquipmentType) {
        await updateEquipmentType(editingEquipmentType.id, equipmentTypeForm);
      } else {
        await addEquipmentType(equipmentTypeForm);
      }
      resetEquipmentTypeForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du type de matériel:', error);
    }
  };

  const handleSaveSupplier = async () => {
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, supplierForm);
      } else {
        await addSupplier(supplierForm);
      }
      resetSupplierForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du fournisseur:', error);
    }
  };

  const handleDeleteEquipmentType = async (id: string) => {
    try {
      await deleteEquipmentType(id);
    } catch (error) {
      console.error('Erreur lors de la suppression du type de matériel:', error);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    try {
      await deleteSupplier(id);
    } catch (error) {
      console.error('Erreur lors de la suppression du fournisseur:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gestion des catégories
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="equipment-types" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="equipment-types" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Types de matériel
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Fournisseurs
            </TabsTrigger>
          </TabsList>

          {/* Types de matériel */}
          <TabsContent value="equipment-types" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Types de matériel</h3>
              <Button onClick={resetEquipmentTypeForm} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un type
              </Button>
            </div>

            {/* Formulaire d'ajout/modification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {editingEquipmentType ? 'Modifier le type de matériel' : 'Nouveau type de matériel'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="equipment-name">Nom technique</Label>
                    <Input
                      id="equipment-name"
                      value={equipmentTypeForm.name}
                      onChange={(e) => setEquipmentTypeForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="ordinateur"
                    />
                  </div>
                  <div>
                    <Label htmlFor="equipment-display">Nom d'affichage</Label>
                    <Input
                      id="equipment-display"
                      value={equipmentTypeForm.displayName}
                      onChange={(e) => setEquipmentTypeForm(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="Ordinateur"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="equipment-description">Description</Label>
                  <Textarea
                    id="equipment-description"
                    value={equipmentTypeForm.description}
                    onChange={(e) => setEquipmentTypeForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description du type de matériel"
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="equipment-active"
                    checked={equipmentTypeForm.isActive}
                    onChange={(e) => setEquipmentTypeForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <Label htmlFor="equipment-active">Actif</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveEquipmentType} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {editingEquipmentType ? 'Modifier' : 'Ajouter'}
                  </Button>
                  {editingEquipmentType && (
                    <Button variant="outline" onClick={resetEquipmentTypeForm} className="flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Annuler
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Liste des types de matériel */}
            <div className="grid gap-2">
              {equipmentTypes.map((equipmentType) => (
                <Card key={equipmentType.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{equipmentType.displayName}</h4>
                        <Badge variant={equipmentType.isActive ? 'default' : 'secondary'}>
                          {equipmentType.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Nom technique:</strong> {equipmentType.name}
                      </p>
                      {equipmentType.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {equipmentType.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditEquipmentType(equipmentType)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer le type de matériel</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer "{equipmentType.displayName}" ? 
                              Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteEquipmentType(equipmentType.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Fournisseurs */}
          <TabsContent value="suppliers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Fournisseurs</h3>
              <Button onClick={resetSupplierForm} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un fournisseur
              </Button>
            </div>

            {/* Formulaire d'ajout/modification */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {editingSupplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier-name">Nom du fournisseur</Label>
                    <Input
                      id="supplier-name"
                      value={supplierForm.name}
                      onChange={(e) => setSupplierForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nom du fournisseur"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier-email">Email de contact</Label>
                    <Input
                      id="supplier-email"
                      type="email"
                      value={supplierForm.contactEmail}
                      onChange={(e) => setSupplierForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="contact@fournisseur.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier-phone">Téléphone</Label>
                    <Input
                      id="supplier-phone"
                      value={supplierForm.contactPhone}
                      onChange={(e) => setSupplierForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                      placeholder="01 23 45 67 89"
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier-address">Adresse</Label>
                    <Input
                      id="supplier-address"
                      value={supplierForm.address}
                      onChange={(e) => setSupplierForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Adresse du fournisseur"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="supplier-active"
                    checked={supplierForm.isActive}
                    onChange={(e) => setSupplierForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <Label htmlFor="supplier-active">Actif</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveSupplier} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {editingSupplier ? 'Modifier' : 'Ajouter'}
                  </Button>
                  {editingSupplier && (
                    <Button variant="outline" onClick={resetSupplierForm} className="flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Annuler
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Liste des fournisseurs */}
            <div className="grid gap-2">
              {suppliers.map((supplier) => (
                <Card key={supplier.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{supplier.name}</h4>
                        <Badge variant={supplier.isActive ? 'default' : 'secondary'}>
                          {supplier.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {supplier.contactEmail && (
                          <p><strong>Email:</strong> {supplier.contactEmail}</p>
                        )}
                        {supplier.contactPhone && (
                          <p><strong>Téléphone:</strong> {supplier.contactPhone}</p>
                        )}
                        {supplier.address && (
                          <p><strong>Adresse:</strong> {supplier.address}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditSupplier(supplier)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer le fournisseur</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer "{supplier.name}" ? 
                              Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteSupplier(supplier.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

