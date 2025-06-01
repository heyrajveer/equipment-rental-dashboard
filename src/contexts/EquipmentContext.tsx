import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Equipment } from '../types';
import { getItems, addItem, updateItem, deleteItem, getItemById } from '../utils/localStorageUtils';
import { useNotification } from './NotificationContext';

interface EquipmentContextType {
  equipment: Equipment[];
  loading: boolean;
  error: string | null;
  addEquipment: (equipment: Omit<Equipment, 'id'>) => Promise<Equipment>;
  updateEquipment: (equipment: Equipment) => Promise<Equipment>;
  deleteEquipment: (id: string) => Promise<void>;
  getEquipmentById: (id: string) => Equipment | null;
  refreshEquipment: () => void;
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

export const EquipmentProvider = ({ children }: { children: ReactNode }) => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotification();

  const refreshEquipment = () => {
    try {
      const data = getItems<Equipment>('equipment');
      setEquipment(data);
      setError(null);
    } catch (err) {
      setError('Failed to load equipment data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshEquipment();
  }, []);

  const addEquipment = async (newEquipment: Omit<Equipment, 'id'>): Promise<Equipment> => {
    try {
      const added = addItem<Equipment>('equipment', newEquipment);
      setEquipment(prev => [...prev, added]);
      
      addNotification({
        type: 'equipment',
        message: `New equipment added: ${added.name}`,
        relatedId: added.id
      });
      
      return added;
    } catch (err) {
      setError('Failed to add equipment');
      console.error(err);
      throw new Error('Failed to add equipment');
    }
  };

  const updateEquipment = async (updatedEquipment: Equipment): Promise<Equipment> => {
    try {
      const updated = updateItem<Equipment>('equipment', updatedEquipment);
      setEquipment(prev => 
        prev.map(item => item.id === updated.id ? updated : item)
      );
      return updated;
    } catch (err) {
      setError('Failed to update equipment');
      console.error(err);
      throw new Error('Failed to update equipment');
    }
  };

  const deleteEquipment = async (id: string): Promise<void> => {
    try {
      deleteItem<Equipment>('equipment', id);
      setEquipment(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError('Failed to delete equipment');
      console.error(err);
      throw new Error('Failed to delete equipment');
    }
  };

  const getEquipmentById = (id: string): Equipment | null => {
    return getItemById<Equipment>('equipment', id);
  };

  return (
    <EquipmentContext.Provider value={{ 
      equipment,
      loading,
      error,
      addEquipment,
      updateEquipment,
      deleteEquipment,
      getEquipmentById,
      refreshEquipment
    }}>
      {children}
    </EquipmentContext.Provider>
  );
};

export const useEquipment = (): EquipmentContextType => {
  const context = useContext(EquipmentContext);
  if (context === undefined) {
    throw new Error('useEquipment must be used within an EquipmentProvider');
  }
  return context;
};