export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  minStock: number;
  price: number;
  sku: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  date: Date;
  userId?: string;
}

export interface StockStats {
  totalProducts: number;
  lowStockAlerts: number;
  totalValue: number;
  recentMovements: number;
}