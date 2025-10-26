export interface Product {
  id: string;
  serialNumber: string; // N° SERIE
  brand: string; // MARQUE
  model: string; // MODELE ou DESCRIPTION
  equipmentType: 'accessoires' | 'borne_wifi' | 'casque_audio' | 'chargeur_tel' | 'chargeur_universel' | 
                 'ecran_pc' | 'ecran_tv' | 'imprimante' | 'kit_clavier_souris' | 'visioconf' | 
                 'mobilier' | 'uc' | 'pc_portable' | 'routeur' | 'sacoche' | 'station_accueil' | 
                 'station_ecrans' | 'tel_mobile' | 'webcam'; // TYPE MATERIEL
  status: 'EN_STOCK' | 'SAV' | 'EN_UTILISATION' | 'HS';
  assignment?: string; // AFFECTATION - Nom du collaborateur
  entryDate?: string; // DATE ENTREE
  supplier?: string; // FOURNISSEUR
  invoiceNumber?: string; // N° FACTURE
  purchasePriceHt?: number; // PRIX ACHAT HT
  usageDurationMonths?: number; // DUREE PROBABLE D'UTILISATION en mois
  reevaluationDate?: string; // DATE REEVALUATION
  quantity: number;
  currentQuantity: number;
  qrCode?: string; // URL complète vers la page produit
  comments?: string;
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