import { useState, useEffect } from 'react';
import { Product, StockMovement, StockStats, User, ImportResult, ProductModification, EquipmentType, Supplier } from '@/types/stock';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { getAppUrl } from '@/lib/utils';
import * as XLSX from 'xlsx';

export const useStockSupabase = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [modifications, setModifications] = useState<ProductModification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [productsPerPage] = useState(3000);

  const loadProducts = async (page = 0, limit = 3000) => {
    try {
      setLoading(true);
      
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      setTotalProducts(count || 0);
      setCurrentPage(page);
      
      const allProducts: any[] = [];
      const batchSize = 1000;
      const totalBatches = Math.ceil((count || 0) / batchSize);
      
      for (let batch = 0; batch < totalBatches; batch++) {
        const from = batch * batchSize;
        const to = Math.min(from + batchSize - 1, (count || 0) - 1);
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .range(from, to);
        
        if (error) throw error;
        
        if (data) {
          allProducts.push(...data);
        }
      }

      const formattedProducts: Product[] = allProducts.map(product => ({
        id: product.id,
        serialNumber: product.serial_number,
        brand: product.brand,
        model: product.model,
        equipmentType: product.equipment_type as Product['equipmentType'],
        status: product.status as Product['status'],
        assignment: product.assignment || undefined,
        entryDate: product.entry_date,
        supplier: product.supplier,
        invoiceNumber: product.invoice_number,
        purchasePriceHt: product.purchase_price_ht,
        usageDurationMonths: product.usage_duration_months,
        reevaluationDate: product.reevaluation_date,
        quantity: product.quantity,
        currentQuantity: product.current_quantity,
        comments: product.comments,
        qrCode: getAppUrl(`/product/${product.id}`),
        createdAt: new Date(product.created_at),
        updatedAt: new Date(product.updated_at),
      }));

      // Déduplication par ID pour éviter les doublons
      const uniqueProducts = formattedProducts.reduce((acc, product) => {
        if (!acc.find(p => p.id === product.id)) {
          acc.push(product);
        }
        return acc;
      }, [] as Product[]);

      setProducts(uniqueProducts);
      setError(null);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les mouvements
  const loadMovements = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      const formattedMovements: StockMovement[] = (data || []).map(movement => ({
        id: movement.id,
        productId: movement.product_id,
        movementType: movement.movement_type,
        quantity: movement.quantity,
        unitPrice: movement.unit_price,
        totalAmount: movement.total_amount,
        reason: movement.reason,
        reference: movement.reference,
        userId: movement.user_id,
        createdAt: new Date(movement.created_at),
      }));

      setMovements(formattedMovements);
    } catch (err) {
      console.error('Error loading movements:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  // Charger les utilisateurs
  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUsers: User[] = (data || []).map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: new Date(user.created_at),
      }));

      setUsers(formattedUsers);
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  // Charger les types de matériel
  const loadEquipmentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment_types')
        .select('*')
        .order('display_name', { ascending: true });

      if (error) throw error;

      const formattedEquipmentTypes: EquipmentType[] = (data || []).map(type => ({
        id: type.id,
        name: type.name,
        displayName: type.display_name,
        description: type.description,
        isActive: type.is_active,
        createdAt: new Date(type.created_at),
        updatedAt: new Date(type.updated_at),
      }));

      setEquipmentTypes(formattedEquipmentTypes);
    } catch (err) {
      console.error('Error loading equipment types:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  // Charger les fournisseurs
  const loadSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      const formattedSuppliers: Supplier[] = (data || []).map(supplier => ({
        id: supplier.id,
        name: supplier.name,
        contactEmail: supplier.contact_email,
        contactPhone: supplier.contact_phone,
        address: supplier.address,
        isActive: supplier.is_active,
        createdAt: new Date(supplier.created_at),
        updatedAt: new Date(supplier.updated_at),
      }));

      setSuppliers(formattedSuppliers);
    } catch (err) {
      console.error('Error loading suppliers:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  // Charger les modifications de produits
  const loadModifications = async (productId?: string) => {
    try {
      let query = supabase
        .from('product_modifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query.limit(1000);

      if (error) {
        // Si la table n'existe pas encore, ne pas afficher d'erreur
        if (error.message.includes('relation "product_modifications" does not exist')) {
          setModifications([]);
          return;
        }
        throw error;
      }

      const formattedModifications: ProductModification[] = (data || []).map(mod => ({
        id: mod.id,
        productId: mod.product_id,
        fieldName: mod.field_name,
        oldValue: mod.old_value,
        newValue: mod.new_value,
        modifiedBy: mod.modified_by,
        modifiedByEmail: mod.modified_by_email,
        modificationType: mod.modification_type,
        createdAt: new Date(mod.created_at),
      }));

      setModifications(formattedModifications);
    } catch (err) {
      console.error('Error loading modifications:', err);
      // Ne pas définir d'erreur pour les modifications car c'est optionnel
      setModifications([]);
    }
  };

  // Enregistrer une modification de produit
  const logModification = async (
    productId: string,
    fieldName: string,
    oldValue: string | null,
    newValue: string | null,
    modificationType: 'CREATE' | 'UPDATE' | 'DELETE'
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('product_modifications')
        .insert({
          product_id: productId,
          field_name: fieldName,
          old_value: oldValue,
          new_value: newValue,
          modified_by: user.user_metadata?.full_name || user.email || 'Utilisateur inconnu',
          modified_by_email: user.email,
          modification_type: modificationType,
        });

      if (error) {
        // Si la table n'existe pas encore, ne pas afficher d'erreur
        if (error.message.includes('relation "product_modifications" does not exist')) {
          return;
        }
        throw error;
      }
    } catch (err) {
      console.error('Error logging modification:', err);
    }
  };

  // Ajouter un produit
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Calculer automatiquement la valeur actuelle
      const purchasePrice = productData.purchasePriceHt || 0;
      const quantity = productData.quantity || 1;
      const currentQuantity = productData.currentQuantity || 1;

      // Générer un numéro de série unique
      let serialNumber;
      if (productData.serialNumber && productData.serialNumber.trim() !== '') {
        // Le produit a déjà un numéro de série, vérifier s'il existe déjà
        const { data: existingProducts, error } = await supabase
          .from('products')
          .select('id')
          .eq('serial_number', productData.serialNumber);
        
        if (error) {
          console.error('Erreur lors de la vérification du numéro de série:', error);
          // En cas d'erreur, générer un nouveau numéro pour éviter les conflits
          serialNumber = `${productData.serialNumber}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        } else if (existingProducts && existingProducts.length > 0) {
          // Le numéro existe déjà, générer un nouveau
          serialNumber = `${productData.serialNumber}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        } else {
          // Le numéro n'existe pas, l'utiliser tel quel
          serialNumber = productData.serialNumber;
        }
      } else {
        // Le produit n'a pas de numéro de série, en générer un
        serialNumber = `FAUX_${productData.brand}_${productData.model}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Insérer le produit avec le numéro de série unique
      const { data, error } = await supabase
        .from('products')
        .insert({
          serial_number: serialNumber,
          brand: productData.brand,
          model: productData.model,
          equipment_type: productData.equipmentType,
          status: productData.status,
          assignment: productData.assignment || null,
          entry_date: productData.entryDate || null,
          supplier: productData.supplier,
          invoice_number: productData.invoiceNumber,
          purchase_price_ht: productData.purchasePriceHt,
          usage_duration_months: productData.usageDurationMonths,
          reevaluation_date: productData.reevaluationDate || null,
          quantity: productData.quantity,
          current_quantity: productData.currentQuantity,
          comments: productData.comments,
        })
        .select()
        .single();

      if (error) throw error;

      const newProduct: Product = {
        id: data.id,
        serialNumber: data.serial_number,
        brand: data.brand,
        model: data.model,
        equipmentType: data.equipment_type as Product['equipmentType'],
        status: data.status as Product['status'],
        assignment: data.assignment,
        entryDate: data.entry_date,
        supplier: data.supplier,
        invoiceNumber: data.invoice_number,
        purchasePriceHt: data.purchase_price_ht,
        usageDurationMonths: data.usage_duration_months,
        reevaluationDate: data.reevaluation_date,
        quantity: data.quantity,
        currentQuantity: data.current_quantity,
        comments: data.comments,
        qrCode: getAppUrl(`/product/${data.id}`),
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      // Ajouter le nouveau produit à la liste (pas de vérification de doublons)
      setProducts(prev => [newProduct, ...prev]);
      setTotalProducts(prev => prev + 1);

      // Enregistrer la création du produit
      await logModification(data.id, 'PRODUCT_CREATED', null, 'Produit créé', 'CREATE');

      return newProduct;
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  };

  // Mettre à jour un produit
  const updateProduct = async (id: string, productData: Partial<Product>) => {
    try {
      // Récupérer l'ancien produit pour comparer les changements
      const oldProduct = products.find(p => p.id === id);
      
      const updateData: any = {};
      
      if (productData.serialNumber !== undefined) updateData.serial_number = productData.serialNumber;
      if (productData.brand !== undefined) updateData.brand = productData.brand;
      if (productData.model !== undefined) updateData.model = productData.model;
      if (productData.equipmentType !== undefined) updateData.equipment_type = productData.equipmentType;
      if (productData.status !== undefined) updateData.status = productData.status;
      if (productData.assignment !== undefined) updateData.assignment = productData.assignment || null;
      if (productData.entryDate !== undefined) updateData.entry_date = productData.entryDate || null;
      if (productData.supplier !== undefined) updateData.supplier = productData.supplier;
      if (productData.invoiceNumber !== undefined) updateData.invoice_number = productData.invoiceNumber;
      if (productData.purchasePriceHt !== undefined) updateData.purchase_price_ht = productData.purchasePriceHt;
      if (productData.usageDurationMonths !== undefined) updateData.usage_duration_months = productData.usageDurationMonths;
      if (productData.reevaluationDate !== undefined) updateData.reevaluation_date = productData.reevaluationDate || null;
      if (productData.quantity !== undefined) updateData.quantity = productData.quantity;
      if (productData.currentQuantity !== undefined) updateData.current_quantity = productData.currentQuantity;
      if (productData.comments !== undefined) updateData.comments = productData.comments;


      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedProduct: Product = {
        id: data.id,
        serialNumber: data.serial_number,
        brand: data.brand,
        model: data.model,
        equipmentType: data.equipment_type as Product['equipmentType'],
        status: data.status as Product['status'],
        assignment: data.assignment,
        entryDate: data.entry_date,
        supplier: data.supplier,
        invoiceNumber: data.invoice_number,
        purchasePriceHt: data.purchase_price_ht,
        usageDurationMonths: data.usage_duration_months,
        reevaluationDate: data.reevaluation_date,
        quantity: data.quantity,
        currentQuantity: data.current_quantity,
        comments: data.comments,
        qrCode: getAppUrl(`/product/${data.id}`),
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setProducts(prev => {
        // Déduplication pour éviter les doublons lors de la mise à jour
        const uniqueProducts = prev.filter(p => p.id !== id);
        return [...uniqueProducts, updatedProduct];
      });

      // Enregistrer les modifications
      if (oldProduct) {
        const fieldMappings = {
          serialNumber: 'N° de série',
          brand: 'Marque',
          model: 'Modèle',
          equipmentType: 'Type de matériel',
          status: 'Statut',
          assignment: 'Affectation',
          entryDate: 'Date d\'entrée',
          supplier: 'Fournisseur',
          invoiceNumber: 'N° de facture',
          purchasePriceHt: 'Prix d\'achat HT',
          usageDurationMonths: 'Durée d\'utilisation en mois',
          reevaluationDate: 'Date de réévaluation',
          quantity: 'Quantité',
          currentQuantity: 'Quantité actuelle',
          comments: 'Commentaires'
        };

        for (const [field, displayName] of Object.entries(fieldMappings)) {
          const oldValue = oldProduct[field as keyof Product];
          const newValue = productData[field as keyof Product];
          
          // Ne pas traiter les champs qui n'ont pas été modifiés
          if (newValue === undefined) {
            continue;
          }
          
          // Normaliser les valeurs pour la comparaison
          const normalizedOldValue = oldValue === null || oldValue === undefined || oldValue === '' ? null : String(oldValue);
          const normalizedNewValue = newValue === null || newValue === undefined || newValue === '' ? null : String(newValue);
          
          // Ne pas enregistrer de modification si les valeurs sont identiques
          if (normalizedOldValue === normalizedNewValue) {
            continue;
          }
          
          // Ne pas enregistrer de modification si les deux valeurs sont null/vides
          if (normalizedOldValue === null && normalizedNewValue === null) {
            continue;
          }
          
          // Ne pas enregistrer de modification si on passe d'une valeur vide à une autre valeur vide
          if ((normalizedOldValue === null || normalizedOldValue === '') && 
              (normalizedNewValue === null || normalizedNewValue === '')) {
            continue;
          }
          
          // Ne pas enregistrer de modification si les deux valeurs sont des chaînes vides
          if (normalizedOldValue === '' && normalizedNewValue === '') {
            continue;
          }
          
          await logModification(
            id,
            displayName,
            normalizedOldValue,
            normalizedNewValue,
            'UPDATE'
          );
        }
      }

      return updatedProduct;
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  };

  // Supprimer un produit
  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
      setTotalProducts(prev => prev - 1);
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  };

  // Ajouter un mouvement
  const addMovement = async (movementData: Omit<StockMovement, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .insert({
          product_id: movementData.productId,
          movement_type: movementData.movementType,
          quantity: movementData.quantity,
          unit_price: movementData.unitPrice,
          total_amount: movementData.totalAmount,
          reason: movementData.reason,
          reference: movementData.reference,
          user_id: movementData.userId,
        })
        .select()
        .single();

      if (error) throw error;

      const newMovement: StockMovement = {
        id: data.id,
        productId: data.product_id,
        movementType: data.movement_type,
        quantity: data.quantity,
        unitPrice: data.unit_price,
        totalAmount: data.total_amount,
        reason: data.reason,
        reference: data.reference,
        userId: data.user_id,
        createdAt: new Date(data.created_at),
      };

      setMovements(prev => [newMovement, ...prev]);

      return newMovement;
    } catch (err) {
      console.error('Error adding movement:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  };

  // Importer des produits
  const importProducts = async (file: File): Promise<ImportResult> => {
    try {
      let data: any[] = [];

      if (file.name.endsWith('.json')) {
        const text = await file.text();
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        const text = await file.text();
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          return obj;
        });
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Import Excel avec la bibliothèque xlsx
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0]; // Prendre la première feuille
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Convertir en format objet avec en-têtes
        if (data.length > 0) {
          const headers = data[0] as string[];
          data = data.slice(1).map((row: any[]) => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });
        }
      }

      const results: ImportResult = {
        success: 0,
        imported: 0,
        errors: [],
        total: data.length
      };

      for (const item of data) {
        try {
          // Fonction pour convertir les dates du format DD/MM/YYYY vers YYYY-MM-DD
          const convertDate = (dateValue: any): string | null => {
            // Si la valeur est null, undefined ou vide
            if (!dateValue) return null;
            
            // Si c'est déjà un objet Date
            if (dateValue instanceof Date) {
              return dateValue.toISOString().split('T')[0];
            }
            
            // Convertir en chaîne de caractères
            const dateStr = String(dateValue);
            
            // Si c'est une chaîne vide après conversion
            if (!dateStr || dateStr.trim() === '') return null;
            
            // Si c'est déjà au format YYYY-MM-DD, le retourner tel quel
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
              return dateStr;
            }
            
            // Si c'est au format DD/MM/YYYY, le convertir
            if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
              const [day, month, year] = dateStr.split('/');
              return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            
            // Si c'est au format DD/MM/YY (année sur 2 chiffres), le convertir
            if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(dateStr)) {
              const [day, month, year] = dateStr.split('/');
              // Convertir l'année sur 2 chiffres en 4 chiffres
              const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
              return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            
            // Si c'est juste une année (ex: "1385"), retourner null
            if (/^\d{4}$/.test(dateStr) && parseInt(dateStr) < 1900) {
              return null;
            }
            
            // Si c'est un nombre (timestamp Excel), essayer de le convertir
            if (!isNaN(Number(dateStr)) && Number(dateStr) > 25569) { // 25569 = 1er janvier 1970 en jours Excel
              const excelDate = new Date((Number(dateStr) - 25569) * 86400 * 1000);
              if (!isNaN(excelDate.getTime())) {
                return excelDate.toISOString().split('T')[0];
              }
            }
            
            return null;
          };

          // Fonction pour normaliser le type de matériel selon les nouvelles catégories
          const normalizeEquipmentType = (type: string): string => {
            if (!type) return 'pc_portable';
            
            const normalizedType = type.toLowerCase().trim();
            
            // Mapping des types vers les nouvelles catégories
            const typeMapping: { [key: string]: string } = {
              'accessoires': 'accessoires',
              'borne wifi': 'borne_wifi',
              'borne_wifi': 'borne_wifi',
              'casque audio': 'casque_audio',
              'casque_audio': 'casque_audio',
              'chargeur tel': 'chargeur_tel',
              'chargeur_tel': 'chargeur_tel',
              'chargeur universel': 'chargeur_universel',
              'chargeur_universel': 'chargeur_universel',
              'ecran pc': 'ecran_pc',
              'ecran_pc': 'ecran_pc',
              'écran pc': 'ecran_pc',
              'moniteur': 'ecran_pc',
              'ecran tv': 'ecran_tv',
              'écran tv': 'ecran_tv',
              'tv': 'ecran_tv',
              'imprimante': 'imprimante',
              'printer': 'imprimante',
              'kit clavier/souris': 'kit_clavier_souris',
              'kit_clavier_souris': 'kit_clavier_souris',
              'clavier': 'kit_clavier_souris',
              'souris': 'kit_clavier_souris',
              'visioconf': 'visioconf',
              'visioconférence': 'visioconf',
              'mobilier': 'mobilier',
              'bureau': 'mobilier',
              'chaise': 'mobilier',
              'uc': 'uc',
              'unité centrale': 'uc',
              'pc portable': 'pc_portable',
              'pc_portable': 'pc_portable',
              'laptop': 'pc_portable',
              'ordinateur portable': 'pc_portable',
              'routeur': 'routeur',
              'router': 'routeur',
              'sacoche': 'sacoche',
              'station d\'accueil': 'station_accueil',
              'station_accueil': 'station_accueil',
              'station d\'écrans': 'station_ecrans',
              'station_ecrans': 'station_ecrans',
              'tel mobile': 'tel_mobile',
              'tel_mobile': 'tel_mobile',
              'mobile': 'tel_mobile',
              'smartphone': 'tel_mobile',
              'webcam': 'webcam',
              'caméra': 'webcam'
            };
            
            return typeMapping[normalizedType] || 'pc_portable';
          };

          // Fonction pour générer des données FAKE si manquantes
          const generateFakeData = (field: string, value: any, type: 'string' | 'number' | 'date' = 'string'): any => {
            // Vérifier si la valeur existe et n'est pas vide
            if (value !== null && value !== undefined && value !== '') {
              // Pour les chaînes, vérifier qu'elles ne sont pas vides après trim
              if (type === 'string' && String(value).trim() !== '') {
                return String(value);
              }
              // Pour les nombres, vérifier qu'ils sont valides
              if (type === 'number' && !isNaN(Number(value))) {
                return Number(value);
              }
              // Pour les dates, vérifier qu'elles sont valides
              if (type === 'date' && value) {
                return value;
              }
            }
            
            const timestamp = Date.now();
            const randomId = Math.random().toString(36).substring(2, 8);
            
            switch (type) {
              case 'number':
                return null; // Ne pas générer de valeurs FAKE pour les nombres
              case 'date':
                return new Date().toISOString().split('T')[0]; // Date du jour
              default:
                return `FAKE_${field.toUpperCase()}_${randomId}`;
            }
          };

          // Mapper les champs selon le nouveau modèle (11 colonnes) - TOUS OBLIGATOIRES
          const productData = {
            serialNumber: generateFakeData('serial', item['N° SERIE'] || item['N° DE SERIE'] || item.serialNumber),
            brand: generateFakeData('brand', item['MARQUE'] || item.brand),
            model: generateFakeData('model', item['MODELE ou DESCRIPTION'] || item['MODELE'] || item.model),
            equipmentType: normalizeEquipmentType(item['TYPE MATERIEL'] || item['TYPE DE MATERIEL'] || item.equipmentType || 'pc_portable'),
            assignment: generateFakeData('assignment', item['AFFECTATION'] || item.assignment),
            entryDate: convertDate(item['DATE ENTREE'] || item['DATE RECEPTION'] || item.entryDate) || generateFakeData('entry_date', '', 'date'),
            supplier: generateFakeData('supplier', item['FOURNISSEUR'] || item.supplier),
            invoiceNumber: generateFakeData('invoice', item['N° FACTURE'] || item.invoiceNumber),
            purchasePriceHt: (() => {
              const price = item['PRIX ACHAT HT'];
              if (!price || price === '') return null;
              const parsed = parseFloat(price);
              return isNaN(parsed) ? null : parsed;
            })(),
            usageDurationMonths: (() => {
              const duration = item['DUREE PROBABLE D\'UTILISATION en mois'];
              if (!duration || duration === '' || duration === '0') return null;
              const parsed = parseInt(duration);
              return isNaN(parsed) ? null : parsed;
            })(),
            reevaluationDate: convertDate(item['DATE REEVALUATION'] || item.reevaluationDate) || generateFakeData('reeval_date', '', 'date'),
            quantity: 1, // Par défaut 1 pour chaque produit
            currentQuantity: 1, // Par défaut 1 pour chaque produit
            status: 'EN_STOCK', // Par défaut en stock
            comments: item['COMMENTAIRES'] || item.comments || '',
          };

          const existingProduct = products.find(p => p.serialNumber === productData.serialNumber);
          await addProduct(productData);
          results.success++;
          results.imported++;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
          results.errors.push(`Erreur import ${item['N° DE SERIE'] || 'inconnu'}: ${errorMessage}`);
        }
      }

      // Le success est déjà compté correctement
      
      // Recharger les produits pour afficher les nouveaux
      await loadProducts();
      
      // Synchroniser les fournisseurs depuis les produits importés
      await syncSuppliersFromProducts();

      return results;
    } catch (err) {
      console.error('Error importing products:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return {
        success: 0,
        imported: 0,
        errors: [err instanceof Error ? err.message : 'An unknown error occurred'],
        total: 0
      };
    }
  };

  // Pagination
  const loadNextPage = () => {
    if (currentPage * productsPerPage < totalProducts) {
      loadProducts(currentPage + 1, productsPerPage);
    }
  };

  const loadPreviousPage = () => {
    if (currentPage > 0) {
      loadProducts(currentPage - 1, productsPerPage);
    }
  };

  const loadAllProducts = () => {
    loadProducts(0, 3000);
  };

  // Charger un produit spécifique par ID
  const loadProductById = async (productId: string): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error) throw error;

      if (data) {
        const formattedProduct: Product = {
          id: data.id,
          serialNumber: data.serial_number,
          brand: data.brand,
          model: data.model,
          equipmentType: data.equipment_type as Product['equipmentType'],
          status: data.status as Product['status'],
          assignment: data.assignment || undefined,
          entryDate: data.entry_date,
          supplier: data.supplier,
          invoiceNumber: data.invoice_number,
          purchasePriceHt: data.purchase_price_ht,
          usageDurationMonths: data.usage_duration_months,
          reevaluationDate: data.reevaluation_date,
          quantity: data.quantity,
          currentQuantity: data.current_quantity,
          comments: data.comments,
          qrCode: getAppUrl(`/product/${data.id}`),
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };
        return formattedProduct;
      }
      return null;
    } catch (err: any) {
      console.error('Erreur lors du chargement du produit:', err);
      return null;
    }
  };

  // Fonction pour mettre à jour la contrainte de la table products
  const updateProductsConstraint = async () => {
    try {
      // Récupérer tous les types d'équipement actifs
      const { data: equipmentTypes } = await supabase
        .from('equipment_types')
        .select('name')
        .eq('is_active', true);

      if (equipmentTypes && equipmentTypes.length > 0) {
        const typeNames = equipmentTypes.map(et => `'${et.name}'`).join(', ');
        
        // Essayer d'exécuter la mise à jour de la contrainte via une fonction SQL
        const { error } = await supabase.rpc('update_equipment_type_constraint', {
          type_names: typeNames
        });

        if (error) {
          console.warn('Impossible de mettre à jour la contrainte automatiquement:', error);
        }
      }
    } catch (error) {
      console.warn('Erreur lors de la mise à jour de la contrainte:', error);
    }
  };

  // Gestion des types de matériel
  const addEquipmentType = async (equipmentTypeData: Omit<EquipmentType, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('equipment_types')
        .insert({
          name: equipmentTypeData.name,
          display_name: equipmentTypeData.displayName,
          description: equipmentTypeData.description,
          is_active: equipmentTypeData.isActive,
        })
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour la contrainte de la table products pour inclure le nouveau type
      await updateProductsConstraint();

      const newEquipmentType: EquipmentType = {
        id: data.id,
        name: data.name,
        displayName: data.display_name,
        description: data.description,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setEquipmentTypes(prev => [...prev, newEquipmentType]);
      return newEquipmentType;
    } catch (err) {
      console.error('Error adding equipment type:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  };

  const updateEquipmentType = async (id: string, equipmentTypeData: Partial<EquipmentType>) => {
    try {
      const updateData: any = {};
      
      if (equipmentTypeData.name !== undefined) updateData.name = equipmentTypeData.name;
      if (equipmentTypeData.displayName !== undefined) updateData.display_name = equipmentTypeData.displayName;
      if (equipmentTypeData.description !== undefined) updateData.description = equipmentTypeData.description;
      if (equipmentTypeData.isActive !== undefined) updateData.is_active = equipmentTypeData.isActive;

      const { data, error } = await supabase
        .from('equipment_types')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedEquipmentType: EquipmentType = {
        id: data.id,
        name: data.name,
        displayName: data.display_name,
        description: data.description,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setEquipmentTypes(prev => prev.map(type => type.id === id ? updatedEquipmentType : type));
      return updatedEquipmentType;
    } catch (err) {
      console.error('Error updating equipment type:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  };

  const deleteEquipmentType = async (id: string) => {
    try {
      const { error } = await supabase
        .from('equipment_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEquipmentTypes(prev => prev.filter(type => type.id !== id));
    } catch (err) {
      console.error('Error deleting equipment type:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  };

  // Synchroniser les fournisseurs des produits avec la table suppliers
  const syncSuppliersFromProducts = async () => {
    try {
      const uniqueSuppliers = Array.from(
        new Set(
          products
            .map(product => product.supplier)
            .filter((supplier): supplier is string => 
              supplier != null && 
              supplier.trim() !== '' && 
              typeof supplier === 'string'
            )
        )
      );

      const { data: existingSuppliers, error: fetchError } = await supabase
        .from('suppliers')
        .select('name');

      if (fetchError) throw fetchError;

      const existingNames = existingSuppliers?.map(s => s.name) || [];
      const newSuppliers = uniqueSuppliers.filter(name => !existingNames.includes(name));

      if (newSuppliers.length > 0) {
        const suppliersToInsert = newSuppliers.map(name => ({
          name: name,
          contact_email: null,
          contact_phone: null,
          address: null,
          is_active: true,
        }));

        const { error: insertError } = await supabase
          .from('suppliers')
          .insert(suppliersToInsert);

        if (insertError) throw insertError;
        
        await loadSuppliers();
      }

    } catch (error) {
      console.error('Erreur lors de la synchronisation des fournisseurs:', error);
    }
  };

  // Gestion des fournisseurs
  const addSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert({
          name: supplierData.name,
          contact_email: supplierData.contactEmail,
          contact_phone: supplierData.contactPhone,
          address: supplierData.address,
          is_active: supplierData.isActive,
        })
        .select()
        .single();

      if (error) throw error;

      const newSupplier: Supplier = {
        id: data.id,
        name: data.name,
        contactEmail: data.contact_email,
        contactPhone: data.contact_phone,
        address: data.address,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setSuppliers(prev => [...prev, newSupplier]);
      return newSupplier;
    } catch (err) {
      console.error('Error adding supplier:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  };

  const updateSupplier = async (id: string, supplierData: Partial<Supplier>) => {
    try {
      const updateData: any = {};
      
      if (supplierData.name !== undefined) updateData.name = supplierData.name;
      if (supplierData.contactEmail !== undefined) updateData.contact_email = supplierData.contactEmail;
      if (supplierData.contactPhone !== undefined) updateData.contact_phone = supplierData.contactPhone;
      if (supplierData.address !== undefined) updateData.address = supplierData.address;
      if (supplierData.isActive !== undefined) updateData.is_active = supplierData.isActive;

      const { data, error } = await supabase
        .from('suppliers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedSupplier: Supplier = {
        id: data.id,
        name: data.name,
        contactEmail: data.contact_email,
        contactPhone: data.contact_phone,
        address: data.address,
        isActive: data.is_active,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setSuppliers(prev => prev.map(supplier => supplier.id === id ? updatedSupplier : supplier));
      return updatedSupplier;
    } catch (err) {
      console.error('Error updating supplier:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  };

  const deleteSupplier = async (id: string) => {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
    } catch (err) {
      console.error('Error deleting supplier:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      throw err;
    }
  };

  // Initialisation
  useEffect(() => {
    loadProducts();
    loadMovements();
    loadUsers();
    loadEquipmentTypes();
    loadSuppliers();
  }, []);

  return {
    products,
    movements,
    modifications,
    users,
    equipmentTypes,
    suppliers,
    loading,
    error,
    totalProducts,
    currentPage,
    productsPerPage,
    loadProducts,
    loadMovements,
    loadModifications,
    loadUsers,
    loadEquipmentTypes,
    loadSuppliers,
    addProduct,
    updateProduct,
    deleteProduct,
    addMovement,
    importProducts,
    addEquipmentType,
    updateEquipmentType,
    deleteEquipmentType,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    syncSuppliersFromProducts,
    loadNextPage,
    loadPreviousPage,
    loadAllProducts,
    loadProductById,
  };
};