import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { StockMovement, Product } from '@/types/stock';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const movementSchema = z.object({
  productId: z.string().min(1, 'Le produit est requis'),
  type: z.enum(['in', 'out', 'adjustment', 'sale', 'return'], {
    required_error: 'Le type de mouvement est requis',
  }),
  quantity: z.number().min(1, 'La quantité doit être positive'),
  reason: z.string().min(1, 'La raison est requise'),
  date: z.date(),
  reference: z.string().optional(),
  supplier: z.string().optional(),
  cost: z.number().optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

interface StockMovementFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MovementFormData) => void;
  products: Product[];
  title?: string;
}

const movementTypes = [
  { value: 'in', label: 'Entrée de stock', description: 'Réception de marchandises' },
  { value: 'out', label: 'Sortie de stock', description: 'Vente ou utilisation' },
  { value: 'sale', label: 'Vente', description: 'Vente directe au client' },
  { value: 'return', label: 'Retour', description: 'Retour de marchandise' },
  { value: 'adjustment', label: 'Ajustement', description: 'Inventaire ou correction' },
];

export const StockMovementForm = ({
  isOpen,
  onClose,
  onSubmit,
  products,
  title = 'Nouveau mouvement de stock',
}: StockMovementFormProps) => {
  const [selectedType, setSelectedType] = useState<string>('');

  const form = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      productId: '',
      type: 'in',
      quantity: 1,
      reason: '',
      date: new Date(),
      reference: '',
      supplier: '',
      cost: 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        productId: '',
        type: 'in',
        quantity: 1,
        reason: '',
        date: new Date(),
        reference: '',
        supplier: '',
        cost: 0,
      });
      setSelectedType('in');
    }
  }, [isOpen, form]);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    form.setValue('type', type as MovementFormData['type']);
  };

  const handleSubmit = (data: MovementFormData) => {
    onSubmit(data);
    form.reset();
    onClose();
  };

  const selectedProduct = products.find(p => p.id === form.watch('productId'));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produit *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un produit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            <div className="flex flex-col">
                              <span>{product.serialNumber || product.brand || product.model || 'Produit sans nom'}</span>
                              <span className="text-sm text-muted-foreground">
                                {product.brand && product.model ? `${product.brand} ${product.model}` : ''} | Stock: {product.currentQuantity}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de mouvement *</FormLabel>
                    <Select onValueChange={handleTypeChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {movementTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex flex-col">
                              <span>{type.label}</span>
                              <span className="text-sm text-muted-foreground">
                                {type.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedProduct && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Informations du produit</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Stock actuel:</span>
                    <span className="ml-2 font-medium">{selectedProduct.currentQuantity}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quantité totale:</span>
                    <span className="ml-2 font-medium">{selectedProduct.quantity}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Prix d'achat:</span>
                    <span className="ml-2 font-medium">
                      {selectedProduct.purchasePriceHt ? new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                      }).format(selectedProduct.purchasePriceHt) : 'Non défini'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2 font-medium">{selectedProduct.equipmentType || 'Non défini'}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy', { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raison / Motif *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Décrivez la raison de ce mouvement..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(selectedType === 'in' || selectedType === 'return') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fournisseur</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom du fournisseur" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coût unitaire (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Référence / N° de commande</FormLabel>
                  <FormControl>
                    <Input placeholder="Référence du mouvement" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" className="bg-gradient-primary">
                Enregistrer le mouvement
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};








