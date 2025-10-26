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
  serialNumber: z.string().optional(), // N° SERIE - optionnel
  brand: z.string().optional(), // MARQUE - optionnel
  model: z.string().optional(), // MODELE ou DESCRIPTION - optionnel
  equipmentType: z.enum([
    'accessoires', 'borne_wifi', 'casque_audio', 'chargeur_tel', 'chargeur_universel',
    'ecran_pc', 'ecran_tv', 'imprimante', 'kit_clavier_souris', 'visioconf',
    'mobilier', 'uc', 'pc_portable', 'routeur', 'sacoche', 'station_accueil',
    'station_ecrans', 'tel_mobile', 'webcam'
  ]).optional(), // TYPE MATERIEL - optionnel
  assignment: z.string().optional(), // AFFECTATION - optionnel
  entryDate: z.string().optional(), // DATE ENTREE - optionnel
  supplier: z.string().optional(), // FOURNISSEUR - optionnel
  invoiceNumber: z.string().optional(), // N° FACTURE - optionnel
  purchasePriceHt: z.number().optional(), // PRIX ACHAT HT - optionnel
  usageDurationMonths: z.number().optional(), // DUREE PROBABLE D'UTILISATION en mois - optionnel
  reevaluationDate: z.string().optional(), // DATE REEVALUATION - optionnel
  quantity: z.number().min(1, 'La quantité doit être au moins 1').default(1),
  currentQuantity: z.number().min(0, 'La quantité actuelle ne peut pas être négative').default(1),
  status: z.enum(['EN_STOCK', 'SAV', 'EN_UTILISATION', 'HS']).default('EN_STOCK'),
  comments: z.string().optional(),
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
      equipmentType: undefined,
      assignment: undefined,
      entryDate: undefined,
      supplier: undefined,
      invoiceNumber: undefined,
      purchasePriceHt: undefined,
      usageDurationMonths: undefined,
      reevaluationDate: undefined,
      quantity: 1,
      currentQuantity: 1,
      status: 'EN_STOCK',
      comments: undefined,
    },
  });

  // Réinitialiser le formulaire quand le produit change
  useEffect(() => {
    if (product) {
      const formData = {
        serialNumber: product.serialNumber || '',
        brand: product.brand || '',
        model: product.model || '',
        equipmentType: product.equipmentType || undefined,
        assignment: product.assignment || undefined,
        entryDate: product.entryDate || undefined,
        supplier: product.supplier || undefined,
        invoiceNumber: product.invoiceNumber || undefined,
        purchasePriceHt: product.purchasePriceHt || undefined,
        usageDurationMonths: product.usageDurationMonths || undefined,
        reevaluationDate: product.reevaluationDate || undefined,
        quantity: product.quantity || 1,
        currentQuantity: product.currentQuantity || 1,
        status: product.status || 'EN_STOCK',
        comments: product.comments || undefined,
      };
      form.reset(formData);
    } else {
      // Réinitialiser avec les valeurs par défaut pour la création
      form.reset();
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations de base */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations de base</h3>
                
                <FormField
                  control={form.control}
                  name="equipmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>TYPE MATERIEL</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === "none" ? undefined : value)} 
                        value={field.value || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Aucun type</SelectItem>
                          <SelectItem value="accessoires">Accessoires</SelectItem>
                          <SelectItem value="borne_wifi">Borne Wifi</SelectItem>
                          <SelectItem value="casque_audio">Casque audio</SelectItem>
                          <SelectItem value="chargeur_tel">Chargeur tel</SelectItem>
                          <SelectItem value="chargeur_universel">Chargeur universel</SelectItem>
                          <SelectItem value="ecran_pc">Ecran PC</SelectItem>
                          <SelectItem value="ecran_tv">Ecran TV</SelectItem>
                          <SelectItem value="imprimante">Imprimante</SelectItem>
                          <SelectItem value="kit_clavier_souris">Kit clavier/souris</SelectItem>
                          <SelectItem value="visioconf">Visioconf</SelectItem>
                          <SelectItem value="mobilier">Mobilier</SelectItem>
                          <SelectItem value="uc">UC</SelectItem>
                          <SelectItem value="pc_portable">PC Portable</SelectItem>
                          <SelectItem value="routeur">Routeur</SelectItem>
                          <SelectItem value="sacoche">Sacoche</SelectItem>
                          <SelectItem value="station_accueil">Station d'accueil</SelectItem>
                          <SelectItem value="station_ecrans">Station d'écrans</SelectItem>
                          <SelectItem value="tel_mobile">Tel Mobile</SelectItem>
                          <SelectItem value="webcam">Webcam</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MARQUE</FormLabel>
                      <FormControl>
                        <Input placeholder="CANON" {...field} value={field.value || ""} />
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
                      <FormLabel>MODELE ou DESCRIPTION</FormLabel>
                      <FormControl>
                        <Input placeholder="Imprimante ISENSYS MF443dw" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>N° SERIE</FormLabel>
                      <FormControl>
                        <Input placeholder="3514C008" {...field} value={field.value || ""} />
                      </FormControl>
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

              {/* Informations complémentaires */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations complémentaires</h3>
                
                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>FOURNISSEUR</FormLabel>
                      <FormControl>
                        <Input placeholder="INMACWSTORE" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="entryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DATE ENTREE</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>N° FACTURE</FormLabel>
                      <FormControl>
                        <Input placeholder="FAC-2022-001" {...field} value={field.value || ""} />
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
                      <FormLabel>PRIX ACHAT HT (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="329.00"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? undefined : parseFloat(value) || undefined);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="usageDurationMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DUREE PROBABLE D'UTILISATION (mois)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="60"
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
                  name="reevaluationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DATE REEVALUATION</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commentaires</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Commentaires sur le produit..." 
                          {...field} 
                          value={field.value || ""} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement...' : (product ? 'Modifier' : 'Ajouter')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
