import { useState, useEffect } from 'react';

export interface UserPreferences {
  tableColumns: string[];
  dashboardCards: string[];
}

const defaultPreferences: UserPreferences = {
  tableColumns: [
    'serialNumber',
    'brand', 
    'model',
    'equipmentType',
    'currentQuantity',
    'purchasePriceHt',
    'supplier',
    'status',
    'assignment'
  ],
  dashboardCards: [
    'totalProducts',
    'totalValue',
    'enStock',
    'sav',
    'enUtilisation',
    'hs'
  ]
};

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger les préférences depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('userPreferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        const tableColumns = parsed.tableColumns || defaultPreferences.tableColumns;
        
        // Nettoyer les colonnes obsolètes
        const cleanedColumns = tableColumns.filter(col => 
          col !== 'amount' && 
          col !== 'currentValue' && 
          col !== 'parcNumber' &&
          col !== 'usageDurationYears' &&
          col !== 'exitDate' &&
          col !== 'exitQuantity' &&
          col !== 'exitUnitPriceHt' &&
          col !== 'exitAmount'
        );
        
        setPreferences({
          tableColumns: cleanedColumns,
          dashboardCards: parsed.dashboardCards || defaultPreferences.dashboardCards
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sauvegarder les préférences dans localStorage
  const savePreferences = (newPreferences: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    try {
      localStorage.setItem('userPreferences', JSON.stringify(updated));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences:', error);
    }
  };

  // Réorganiser les colonnes du tableau
  const reorderTableColumns = (newOrder: string[]) => {
    savePreferences({ tableColumns: newOrder });
  };

  // Réorganiser les cartes du dashboard
  const reorderDashboardCards = (newOrder: string[]) => {
    savePreferences({ dashboardCards: newOrder });
  };

  // Réinitialiser les préférences
  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    localStorage.removeItem('userPreferences');
  };

  return {
    preferences,
    isLoaded,
    reorderTableColumns,
    reorderDashboardCards,
    resetPreferences
  };
};
