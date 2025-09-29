export interface Product {
  id: string;
  serialNumber: string;
  parcNumber?: string;
  brand: string;
  model: string;
  equipmentType: 'ordinateur' | 'imprimante' | 'claviers_souris' | 'switch' | 'router' | 'borne_wifi' | 'ecran' | 'station_ecrans' | 'chargeur_universelle';
  status: 'EN_STOCK' | 'SAV' | 'EN_UTILISATION' | 'HS';
  assignment?: string; // Nom du collaborateur (ex: "AÏSSA ABDI Djanet", "CARDENAS Lionel", etc.)
  usageDurationYears?: number;
  entryDate?: string;
  supplier?: string;
  invoiceNumber?: string;
  quantity: number;
  purchasePriceHt?: number;
  amount?: number;
  exitDate?: string;
  exitQuantity?: number;
  exitUnitPriceHt?: number;
  exitAmount?: number;
  currentQuantity: number;
  currentValue?: number;
  comments?: string;
  qrCode?: string; // URL complète vers la page produit
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  movementType: 'ENTRY' | 'EXIT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  unitPrice?: number;
  totalAmount?: number;
  reason?: string;
  reference?: string;
  userId?: string;
  createdAt: Date;
}

export interface ProductModification {
  id: string;
  productId: string;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  modifiedBy: string; // Nom de l'utilisateur
  modifiedByEmail?: string;
  modificationType: 'CREATE' | 'UPDATE' | 'DELETE';
  createdAt: Date;
}

export interface EquipmentType {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  createdAt: Date;
}

export interface Collaborator {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
}

export interface StockStats {
  totalProducts: number;
  totalValue: number;
  recentMovements: number;
  byAssignment: {
    SAV: number;
    EN_STOCK: number;
    VENTE: number;
    EN_UTILISATION: number;
    HS: number;
  };
}