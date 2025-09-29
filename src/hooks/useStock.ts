import { useState, useEffect } from 'react';
import { Product, StockMovement, StockStats, User, ImportResult } from '@/types/stock';

// Mock data for demonstration
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Ordinateur Portable Dell',
    description: 'Dell Inspiron 15 - 8GB RAM, 256GB SSD',
    category: 'Informatique',
    quantity: 25,
    price: 699,
    sku: 'DELL-INS-15',
    serialNumber: 'SN-DELL-2024-001',
    barcode: 'BC12345678',
    qrCode: 'http://localhost:8083/product/1',
    supplier: 'Dell France',
    location: 'A1-B2-C3',
    status: 'en-stock',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    name: 'Souris Logitech MX',
    description: 'Souris sans fil ergonomique',
    category: 'Accessoires',
    quantity: 3,
    price: 79,
    sku: 'LOG-MX-001',
    serialNumber: 'SN-LOG-2024-002',
    barcode: 'BC87654321',
    qrCode: 'http://localhost:8083/product/2',
    supplier: 'Logitech',
    location: 'B1-C2-D3',
    status: 'sav',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '3',
    name: 'Écran Samsung 24"',
    description: 'Moniteur Full HD 24 pouces',
    category: 'Écrans',
    quantity: 12,
    price: 199,
    sku: 'SAM-24-FHD',
    serialNumber: 'SN-SAM-2024-003',
    barcode: 'BC11223344',
    qrCode: 'http://localhost:8083/product/3',
    supplier: 'Samsung',
    location: 'C1-D2-E3',
    status: 'vente',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-15'),
  },
];

const mockMovements: StockMovement[] = [
  {
    id: '1',
    productId: '1',
    type: 'in',
    quantity: 10,
    reason: 'Réapprovisionnement fournisseur',
    date: new Date('2024-01-20'),
    reference: 'CMD-2024-001',
    supplier: 'Dell France',
    cost: 550,
  },
  {
    id: '2',
    productId: '2',
    type: 'sale',
    quantity: 5,
    reason: 'Vente magasin',
    date: new Date('2024-01-19'),
    reference: 'VTE-2024-001',
  },
  {
    id: '3',
    productId: '3',
    type: 'adjustment',
    quantity: -2,
    reason: 'Inventaire - produits défectueux',
    date: new Date('2024-01-18'),
    reference: 'INV-2024-001',
  },
];

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Manager User',
    email: 'manager@example.com',
    role: 'manager',
    createdAt: new Date('2024-01-01'),
  },
];

export const useStock = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [movements, setMovements] = useState<StockMovement[]>(mockMovements);
  const [users] = useState<User[]>(mockUsers);
  const [loading, setLoading] = useState(false);

  const stats: StockStats = {
    totalProducts: products.length,
    lowStockAlerts: products.filter(p => p.status === 'sav' || p.status === 'hs').length,
    totalValue: products.reduce((sum, p) => sum + (p.quantity * p.price), 0),
    recentMovements: movements.filter(m => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return m.date >= weekAgo;
    }).length,
  };

  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      status: product.status || 'en-stock',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => 
      prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p)
    );
  };

  const addMovement = (movement: Omit<StockMovement, 'id'>) => {
    const newMovement: StockMovement = {
      ...movement,
      id: Date.now().toString(),
    };
    
    setMovements(prev => [newMovement, ...prev]);
    
    // Update product quantity
    setProducts(prev => 
      prev.map(p => {
        if (p.id === movement.productId) {
          const newQuantity = movement.type === 'out' 
            ? Math.max(0, p.quantity - movement.quantity)
            : p.quantity + movement.quantity;
          return { ...p, quantity: newQuantity, updatedAt: new Date() };
        }
        return p;
      })
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setMovements(prev => prev.filter(m => m.productId !== id));
  };

  const searchProducts = (query: string) => {
    const term = query.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term) ||
      product.barcode?.toLowerCase().includes(term) ||
      product.qrCode?.toLowerCase().includes(term) ||
      product.category.toLowerCase().includes(term) ||
      product.supplier?.toLowerCase().includes(term)
    );
  };

  const importProducts = async (file: File): Promise<ImportResult> => {
    setLoading(true);
    
    try {
      // Simulation d'import - dans une vraie app, on utiliserait une librairie comme xlsx
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulation de données importées
      const mockImportedProducts: Product[] = [
        {
          id: Date.now().toString(),
          name: 'Produit Importé 1',
          description: 'Produit importé depuis Excel',
          category: 'Informatique',
          quantity: 5,
          price: 99.99,
          sku: 'IMP-001',
          serialNumber: 'SN-IMP-2024-001',
          supplier: 'Fournisseur Import',
          status: 'en-stock',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          name: 'Produit Importé 2',
          description: 'Autre produit importé',
          category: 'Accessoires',
          quantity: 10,
          price: 49.99,
          sku: 'IMP-002',
          serialNumber: 'SN-IMP-2024-002',
          supplier: 'Fournisseur Import',
          status: 'en-stock',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      setProducts(prev => [...prev, ...mockImportedProducts]);

      return {
        success: 2,
        errors: [],
        total: 2,
      };
    } catch (error) {
      return {
        success: 0,
        errors: ['Erreur lors de l\'import du fichier'],
        total: 0,
      };
    } finally {
      setLoading(false);
    }
  };

  const generateBarcode = (): string => {
    return 'BC' + Date.now().toString().slice(-8);
  };

  const generateQRCode = (productId?: string): string => {
    if (productId) {
      // Générer une URL vers la fiche produit
      const baseUrl = window.location.origin;
      return `${baseUrl}/product/${productId}`;
    }
    return 'QR' + Date.now().toString().slice(-8);
  };

  return {
    products,
    movements,
    users,
    stats,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    addMovement,
    searchProducts,
    importProducts,
    generateBarcode,
    generateQRCode,
  };
};