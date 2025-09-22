import { useState, useEffect } from 'react';
import { Product, StockMovement, StockStats } from '@/types/stock';

// Mock data for demonstration
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Ordinateur Portable Dell',
    description: 'Dell Inspiron 15 - 8GB RAM, 256GB SSD',
    category: 'Informatique',
    quantity: 25,
    minStock: 5,
    price: 699,
    sku: 'DELL-INS-15',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    name: 'Souris Logitech MX',
    description: 'Souris sans fil ergonomique',
    category: 'Accessoires',
    quantity: 3,
    minStock: 10,
    price: 79,
    sku: 'LOG-MX-001',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '3',
    name: 'Écran Samsung 24"',
    description: 'Moniteur Full HD 24 pouces',
    category: 'Écrans',
    quantity: 12,
    minStock: 3,
    price: 199,
    sku: 'SAM-24-FHD',
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
  },
  {
    id: '2',
    productId: '2',
    type: 'out',
    quantity: 5,
    reason: 'Vente magasin',
    date: new Date('2024-01-19'),
  },
  {
    id: '3',
    productId: '3',
    type: 'adjustment',
    quantity: -2,
    reason: 'Inventaire - produits défectueux',
    date: new Date('2024-01-18'),
  },
];

export const useStock = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [movements, setMovements] = useState<StockMovement[]>(mockMovements);
  const [loading, setLoading] = useState(false);

  const stats: StockStats = {
    totalProducts: products.length,
    lowStockAlerts: products.filter(p => p.quantity <= p.minStock).length,
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

  return {
    products,
    movements,
    stats,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    addMovement,
  };
};