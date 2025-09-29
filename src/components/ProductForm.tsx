import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Product } from '@/types/stock';
import { useCollaborators } from '@/hooks/useCollaborators';
import { useStockSupabase } from '@/hooks/useStockSupabase';

const productSchema = z.object({
  serialNumber: z.string().min(1, 'Le numéro de série est requis'),
  parcNumber: z.string().nullable().optional(),
  brand: z.string().min(1, 'La marque est requise'),
  model: z.string().min(1, 'Le modèle est requis'),
  equipmentType: z.string().nullable().optional(),
  status: z.enum(['EN_STOCK', 'SAV', 'EN_UTILISATION', 'HS']).nullable().optional(),
  assignment: z.string().nullable().optional(),
  usageDurationYears: z.number().nullable().optional(),
  entryDate: z.string().nullable().optional(),
  supplier: z.string().nullable().optional(),
  invoiceNumber: z.string().nullable().optional(),
  quantity: z.number().min(1, 'La quantité doit être au moins 1'),
  purchasePriceHt: z.number().nullable().optional(),
  amount: z.number().nullable().optional(),
  exitDate: z.string().nullable().optional(),
  exitQuantity: z.number().nullable().optional(),
  exitUnitPriceHt: z.number().nullable().optional(),
  exitAmount: z.number().nullable().optional(),
  currentQuantity: z.number().min(0, 'La quantité actuelle ne peut pas être négative'),
  currentValue: z.number().nullable().optional(),
  comments: z.string().nullable().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
}


export const ProductForm = ({ product, isOpen, onClose, onSubmit }: ProductFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { collaborators } = useCollaborators();
  const { suppliers, equipmentTypes } = useStockSupabase();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      serialNumber: '',
      brand: '',
      model: '',
      quantity: 1,
      currentQuantity: 1,
      // Champs optionnels - pas de valeurs par défaut
      equipmentType: undefined,
      status: undefined,
      parcNumber: undefined,
      assignment: undefined,
      usageDurationYears: undefined,
      entryDate: undefined,
      supplier: undefined,
      invoiceNumber: undefined,
      purchasePriceHt: undefined,
      amount: undefined,
      exitDate: undefined,
      exitQuantity: undefined,
      exitUnitPriceHt: undefined,
      exitAmount: undefined,
      currentValue: undefined,
      comments: undefined,
    },
  });

  // Réinitialiser le formulaire quand le produit change
  useEffect(() => {
    if (product) {
      const formData = {
        // Champs obligatoires - utiliser les valeurs du produit ou des valeurs par défaut
        serialNumber: product.serialNumber || '',
        brand: product.brand || '',
        model: product.model || '',
        quantity: product.quantity || 1,
        currentQuantity: product.currentQuantity || 1,
        
        // Champs optionnels - s'assurer qu'ils ont toujours une valeur par défaut
        equipmentType: product.equipmentType || '',
        status: product.status || '',
        parcNumber: product.parcNumber || '',
        assignment: product.assignment || '',
        usageDurationYears: product.usageDurationYears || null,
        entryDate: product.entryDate || '',
        supplier: product.supplier || '',
        invoiceNumber: product.invoiceNumber || '',
        purchasePriceHt: product.purchasePriceHt || null,
        amount: product.amount || null,
        exitDate: product.exitDate || '',
        exitQuantity: product.exitQuantity || null,
        exitUnitPriceHt: product.exitUnitPriceHt || null,
        exitAmount: product.exitAmount || null,
        currentValue: product.currentValue || null,
        comments: product.comments || '',
      };
      form.reset(formData);
      // Calculer les montants après le reset
      setTimeout(() => calculateAmounts(), 100);
    } else {
      // Réinitialiser avec les valeurs par défaut pour la création
      const defaultData = {
        serialNumber: '',
        brand: '',
        model: '',
        quantity: 1,
        currentQuantity: 1,
        // Champs optionnels - pas de valeurs par défaut
        equipmentType: undefined,
        status: undefined,
        parcNumber: undefined,
        assignment: undefined,
        usageDurationYears: undefined,
        entryDate: undefined,
        supplier: undefined,
        invoiceNumber: undefined,
        purchasePriceHt: undefined,
        amount: undefined,
        exitDate: undefined,
        exitQuantity: undefined,
        exitUnitPriceHt: undefined,
        exitAmount: undefined,
        currentValue: undefined,
        comments: undefined,
      };
      form.reset(defaultData);
      // Calculer les montants après le reset
      setTimeout(() => calculateAmounts(), 100);
    }
  }, [product, form]);

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      // Si c'est une modification, ne comparer que les champs qui ont vraiment changé
      if (product) {
        const changedData: Partial<ProductFormData> = {};
        
        // Comparer chaque champ avec la valeur originale du produit
        Object.entries(data).forEach(([key, value]) => {
          const originalValue = product[key as keyof Product];
          
          // Fonction pour normaliser les valeurs de comparaison
          const normalizeValue = (val: any) => {
            if (val === null || val === undefined || val === '' || val === 'null' || val === 'undefined') return '';
            return String(val);
          };
          
          const normalizedOriginal = normalizeValue(originalValue);
          const normalizedNew = normalizeValue(value);
          
          // Inclure seulement si la valeur a vraiment changé
          // Ne pas inclure les champs qui sont identiques
          if (normalizedOriginal !== normalizedNew) {
            // Vérification spéciale pour les champs problématiques
            if (key === 'equipmentType' || key === 'status') {
              console.log(`Champ ${key} détecté comme modifié:`, {
                original: originalValue,
                new: value,
                normalizedOriginal,
                normalizedNew
              });
            }
            (changedData as any)[key] = value;
          }
        });
        
        // Debug: afficher les changements détectés
        console.log('Champs modifiés:', Object.keys(changedData));
        console.log('Données de changement:', changedData);
        
        // Si aucun champ n'a été modifié, ne pas envoyer de données
        if (Object.keys(changedData).length === 0) {
          console.log('Aucun changement détecté, fermeture du modal');
          onClose();
          return;
        }
        
        await onSubmit(changedData);
      } else {
        // Pour la création, filtrer les valeurs vides mais garder les valeurs par défaut nécessaires
        const filteredData = Object.fromEntries(
          Object.entries(data).filter(([key, value]) => {
            // Toujours inclure les champs obligatoires
            if (['serialNumber', 'brand', 'model', 'quantity', 'currentQuantity'].includes(key)) {
              return true;
            }
            
            // Pour les autres champs, filtrer les valeurs vides
            if (value === undefined || value === null) return false;
            if (typeof value === 'string' && value.trim() === '') return false;
            if (typeof value === 'number' && value === 0) return false;
            return true;
          })
        ) as ProductFormData;
        
        await onSubmit(filteredData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  // Calculer automatiquement le montant total et la valeur actuelle
  const calculateAmounts = () => {
    const purchasePrice = form.getValues('purchasePriceHt') || 0;
    const quantity = form.getValues('quantity') || 1;
    const currentQuantity = form.getValues('currentQuantity') || 1;
    
    // Montant total = prix d'achat × quantité
    const amount = purchasePrice * quantity;
    form.setValue('amount', Math.round(amount * 100) / 100);
    
    // Valeur actuelle = montant total × (quantité actuelle / quantité totale)
    const currentValue = amount * (currentQuantity / quantity);
    form.setValue('currentValue', Math.round(currentValue * 100) / 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {product ? `Modifier le produit - ${product.serialNumber}` : 'Ajouter un produit'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" key={product?.id || 'new'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Informations de base */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations de base</h3>
                
                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de série *</FormLabel>
                      <FormControl>
                        <Input placeholder="CND4494QN0" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parcNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Référence interne</FormLabel>
                      <FormControl>
                        <Input placeholder="REF001" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marque *</FormLabel>
                      <FormControl>
                        <Input placeholder="HP" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modèle *</FormLabel>
                      <FormControl>
                        <Input placeholder="ELITEPAD" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="equipmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de matériel</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === "none" ? undefined : value)} 
                        value={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type (optionnel)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Aucun type</SelectItem>
                          {equipmentTypes
                            .filter(type => type.isActive)
                            .map((type) => (
                            <SelectItem key={type.id} value={type.name}>
                              {type.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Optionnel : sélectionner un type de matériel de la liste
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir un statut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EN_STOCK">En Stock</SelectItem>
                          <SelectItem value="SAV">SAV</SelectItem>
                          <SelectItem value="EN_UTILISATION">En Utilisation</SelectItem>
                          <SelectItem value="HS">HS</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Affectation (Collaborateur)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === "none" ? undefined : value)} 
                        value={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir un collaborateur (optionnel)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Aucun collaborateur</SelectItem>
                          {collaborators.map((collaborator) => (
                            <SelectItem key={collaborator.id} value={collaborator.fullName}>
                              {collaborator.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Optionnel : assigner le matériel à un collaborateur spécifique
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Informations d'achat */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations d'achat</h3>
                
                <FormField
                  control={form.control}
                  name="entryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date d'entrée</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fournisseur</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === "none" ? undefined : value)} 
                        value={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choisir un fournisseur (optionnel)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Aucun fournisseur</SelectItem>
                          {suppliers
                            .filter(supplier => supplier.isActive)
                            .map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.name}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Optionnel : sélectionner un fournisseur de la liste
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro de facture</FormLabel>
                      <FormControl>
                        <Input placeholder="FAC2024001" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantité *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseInt(e.target.value) || 1);
                            calculateAmounts();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchasePriceHt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix d'achat HT (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="620.00"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? null : parseFloat(value) || null);
                            calculateAmounts();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant total (€) - Calculé automatiquement</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="620.00"
                          {...field}
                          readOnly
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Informations d'utilisation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations d'utilisation</h3>
                
                <FormField
                  control={form.control}
                  name="usageDurationYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durée d'utilisation (années)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="5"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantité actuelle *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseInt(e.target.value) || 0);
                            calculateAmounts();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currentValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valeur actuelle (€) - Calculée automatiquement</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="620.00"
                          {...field}
                          readOnly
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Informations de sortie - seulement pour la modification */}
              {product && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Informations de sortie</h3>
                  
                  <FormField
                    control={form.control}
                    name="exitDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de sortie</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="exitQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantité sortie</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? null : parseInt(value) || null);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="exitUnitPriceHt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prix unitaire sortie HT (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? null : parseFloat(value) || null);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="exitAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant sortie (€)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? null : parseFloat(value) || null);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Commentaires */}
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commentaires</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Commentaires sur le produit..."
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Boutons */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : product ? 'Modifier' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};