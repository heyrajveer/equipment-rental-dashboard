import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Rental, RentalStatus } from '../types';
import { getItems, addItem, updateItem, deleteItem, getItemById } from '../utils/localStorageUtils';
import { useNotification } from './NotificationContext';

interface RentalContextType {
  rentals: Rental[];
  loading: boolean;
  error: string | null;
  addRental: (rental: Omit<Rental, 'id'>) => Promise<Rental>;
  updateRental: (rental: Rental) => Promise<Rental>;
  deleteRental: (id: string) => Promise<void>;
  getRentalById: (id: string) => Rental | null;
  getRentalsByEquipment: (equipmentId: string) => Rental[];
  getRentalsByCustomer: (customerId: string) => Rental[];
  getRentalsByStatus: (status: RentalStatus) => Rental[];
  refreshRentals: () => void;
}

const RentalContext = createContext<RentalContextType | undefined>(undefined);

export const RentalProvider = ({ children }: { children: ReactNode }) => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotification();

  const refreshRentals = () => {
    try {
      const data = getItems<Rental>('rentals');
      setRentals(data);
      setError(null);
    } catch (err) {
      setError('Failed to load rentals data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshRentals();
  }, []);

  const addRental = async (newRental: Omit<Rental, 'id'>): Promise<Rental> => {
    try {
      const added = addItem<Rental>('rentals', newRental);
      setRentals(prev => [...prev, added]);
      
      addNotification({
        type: 'rental',
        message: `New rental created for equipment ID: ${added.equipmentId}`,
        relatedId: added.id
      });
      
      return added;
    } catch (err) {
      setError('Failed to add rental');
      console.error(err);
      throw new Error('Failed to add rental');
    }
  };

  const updateRental = async (updatedRental: Rental): Promise<Rental> => {
    try {
      const updated = updateItem<Rental>('rentals', updatedRental);
      setRentals(prev => 
        prev.map(item => item.id === updated.id ? updated : item)
      );
      
      if (updated.status === RentalStatus.RETURNED) {
        addNotification({
          type: 'rental',
          message: `Rental for equipment ID: ${updated.equipmentId} has been returned`,
          relatedId: updated.id
        });
      }
      
      return updated;
    } catch (err) {
      setError('Failed to update rental');
      console.error(err);
      throw new Error('Failed to update rental');
    }
  };

  const deleteRental = async (id: string): Promise<void> => {
    try {
      deleteItem<Rental>('rentals', id);
      setRentals(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError('Failed to delete rental');
      console.error(err);
      throw new Error('Failed to delete rental');
    }
  };

  const getRentalById = (id: string): Rental | null => {
    return getItemById<Rental>('rentals', id);
  };

  const getRentalsByEquipment = (equipmentId: string): Rental[] => {
    return rentals.filter(rental => rental.equipmentId === equipmentId);
  };

  const getRentalsByCustomer = (customerId: string): Rental[] => {
    return rentals.filter(rental => rental.customerId === customerId);
  };

  const getRentalsByStatus = (status: RentalStatus): Rental[] => {
    return rentals.filter(rental => rental.status === status);
  };

  return (
    <RentalContext.Provider value={{ 
      rentals,
      loading,
      error,
      addRental,
      updateRental,
      deleteRental,
      getRentalById,
      getRentalsByEquipment,
      getRentalsByCustomer,
      getRentalsByStatus,
      refreshRentals
    }}>
      {children}
    </RentalContext.Provider>
  );
};

export const useRental = (): RentalContextType => {
  const context = useContext(RentalContext);
  if (context === undefined) {
    throw new Error('useRental must be used within a RentalProvider');
  }
  return context;
};