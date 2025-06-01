import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Maintenance } from '../types';
import { getItems, addItem, updateItem, deleteItem, getItemById } from '../utils/localStorageUtils';
import { useNotification } from './NotificationContext';

interface MaintenanceContextType {
  maintenance: Maintenance[];
  loading: boolean;
  error: string | null;
  addMaintenance: (maintenance: Omit<Maintenance, 'id'>) => Promise<Maintenance>;
  updateMaintenance: (maintenance: Maintenance) => Promise<Maintenance>;
  deleteMaintenance: (id: string) => Promise<void>;
  getMaintenanceById: (id: string) => Maintenance | null;
  getMaintenanceByEquipment: (equipmentId: string) => Maintenance[];
  getUpcomingMaintenance: () => Maintenance[];
  refreshMaintenance: () => void;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

export const MaintenanceProvider = ({ children }: { children: ReactNode }) => {
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotification();

  const refreshMaintenance = () => {
    try {
      const data = getItems<Maintenance>('maintenance');
      setMaintenance(data);
      setError(null);
    } catch (err) {
      setError('Failed to load maintenance data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMaintenance();
  }, []);

  const addMaintenance = async (newMaintenance: Omit<Maintenance, 'id'>): Promise<Maintenance> => {
    try {
      const added = addItem<Maintenance>('maintenance', newMaintenance);
      setMaintenance(prev => [...prev, added]);
      
      addNotification({
        type: 'maintenance',
        message: `Maintenance scheduled for equipment ID: ${added.equipmentId}`,
        relatedId: added.id
      });
      
      return added;
    } catch (err) {
      setError('Failed to add maintenance');
      console.error(err);
      throw new Error('Failed to add maintenance');
    }
  };

  const updateMaintenance = async (updatedMaintenance: Maintenance): Promise<Maintenance> => {
    try {
      const updated = updateItem<Maintenance>('maintenance', updatedMaintenance);
      setMaintenance(prev => 
        prev.map(item => item.id === updated.id ? updated : item)
      );
      
      if (updated.status === 'Completed') {
        addNotification({
          type: 'maintenance',
          message: `Maintenance completed for equipment ID: ${updated.equipmentId}`,
          relatedId: updated.id
        });
      }
      
      return updated;
    } catch (err) {
      setError('Failed to update maintenance');
      console.error(err);
      throw new Error('Failed to update maintenance');
    }
  };

  const deleteMaintenance = async (id: string): Promise<void> => {
    try {
      deleteItem<Maintenance>('maintenance', id);
      setMaintenance(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError('Failed to delete maintenance');
      console.error(err);
      throw new Error('Failed to delete maintenance');
    }
  };

  const getMaintenanceById = (id: string): Maintenance | null => {
    return getItemById<Maintenance>('maintenance', id);
  };

  const getMaintenanceByEquipment = (equipmentId: string): Maintenance[] => {
    return maintenance.filter(record => record.equipmentId === equipmentId);
  };

  const getUpcomingMaintenance = (): Maintenance[] => {
    const today = new Date();
    return maintenance.filter(record => {
      const maintenanceDate = new Date(record.date);
      return maintenanceDate >= today && record.status !== 'Completed';
    });
  };

  return (
    <MaintenanceContext.Provider value={{ 
      maintenance,
      loading,
      error,
      addMaintenance,
      updateMaintenance,
      deleteMaintenance,
      getMaintenanceById,
      getMaintenanceByEquipment,
      getUpcomingMaintenance,
      refreshMaintenance
    }}>
      {children}
    </MaintenanceContext.Provider>
  );
};

export const useMaintenance = (): MaintenanceContextType => {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
};