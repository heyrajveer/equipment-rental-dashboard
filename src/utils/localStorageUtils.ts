import { v4 as uuidv4 } from 'uuid';
import { 
  User, 
  Equipment, 
  Rental, 
  Maintenance, 
  Notification, 
  UserRole,
  EquipmentStatus,
  EquipmentCondition,
  RentalStatus,
  MaintenanceType
} from '../types';

// Initialize localStorage with demo data
export const initializeLocalStorage = (): void => {
  // Only initialize if data doesn't exist
  if (!localStorage.getItem('users')) {
    // Initial users
    const users: User[] = [
      { id: '1', email: 'admin@entnt.in', password: 'admin123', role: UserRole.ADMIN },
      { id: '2', email: 'staff@entnt.in', password: 'staff123', role: UserRole.STAFF },
      { id: '3', email: 'customer@entnt.in', password: 'cust123', role: UserRole.CUSTOMER }
    ];
    localStorage.setItem('users', JSON.stringify(users));

    // Initial equipment
    const equipment: Equipment[] = [
      { 
        id: 'eq1', 
        name: 'Excavator XL2000', 
        category: 'Heavy Machinery', 
        condition: EquipmentCondition.GOOD, 
        status: EquipmentStatus.AVAILABLE,
        description: 'Large excavator ideal for major construction projects',
        acquisitionDate: '2023-01-15',
        image: 'https://images.pexels.com/photos/2602538/pexels-photo-2602538.jpeg'
      },
      { 
        id: 'eq2', 
        name: 'Concrete Mixer CM500', 
        category: 'Construction', 
        condition: EquipmentCondition.EXCELLENT, 
        status: EquipmentStatus.RENTED,
        description: 'Medium-sized concrete mixer with 500L capacity',
        acquisitionDate: '2023-03-22',
        image: 'https://images.pexels.com/photos/2760289/pexels-photo-2760289.jpeg'
      },
      { 
        id: 'eq3', 
        name: 'Electric Generator G3000', 
        category: 'Power Equipment', 
        condition: EquipmentCondition.GOOD, 
        status: EquipmentStatus.AVAILABLE,
        description: '3000W portable generator for construction sites',
        acquisitionDate: '2023-05-10',
        image: 'https://images.pexels.com/photos/3855962/pexels-photo-3855962.jpeg'
      },
      { 
        id: 'eq4', 
        name: 'Jackhammer J45', 
        category: 'Hand Tools', 
        condition: EquipmentCondition.FAIR, 
        status: EquipmentStatus.MAINTENANCE,
        description: 'Pneumatic jackhammer for breaking concrete',
        acquisitionDate: '2022-11-05',
        image: 'https://images.pexels.com/photos/159358/construction-site-build-construction-work-159358.jpeg'
      },
      { 
        id: 'eq5', 
        name: 'Boom Lift 30ft', 
        category: 'Aerial Equipment', 
        condition: EquipmentCondition.EXCELLENT, 
        status: EquipmentStatus.AVAILABLE,
        description: '30ft articulating boom lift for high access',
        acquisitionDate: '2024-01-10',
        image: 'https://images.pexels.com/photos/2068339/pexels-photo-2068339.jpeg'
      }
    ];
    localStorage.setItem('equipment', JSON.stringify(equipment));

    // Initial rentals
    const today = new Date();
    const rentals: Rental[] = [
      { 
        id: 'r1', 
        equipmentId: 'eq2', 
        customerId: '3', 
        startDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        endDate: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        status: RentalStatus.RENTED,
        notes: 'Customer requested delivery',
        totalAmount: 450,
        createdAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      { 
        id: 'r2', 
        equipmentId: 'eq1', 
        customerId: '3', 
        startDate: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        endDate: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        status: RentalStatus.RESERVED,
        totalAmount: 1200,
        createdAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      { 
        id: 'r3', 
        equipmentId: 'eq3', 
        customerId: '3', 
        startDate: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        endDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        status: RentalStatus.RETURNED,
        notes: 'Returned in good condition',
        totalAmount: 250,
        createdAt: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem('rentals', JSON.stringify(rentals));

    // Initial maintenance records
    const maintenance: Maintenance[] = [
      { 
        id: 'm1', 
        equipmentId: 'eq4', 
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        type: MaintenanceType.REPAIR, 
        notes: 'Replacing worn parts and general servicing',
        completedBy: 'Tech Team',
        status: 'In Progress'
      },
      { 
        id: 'm2', 
        equipmentId: 'eq1', 
        date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        type: MaintenanceType.ROUTINE, 
        notes: 'Scheduled inspection and oil change',
        status: 'Scheduled'
      },
      { 
        id: 'm3', 
        equipmentId: 'eq3', 
        date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        type: MaintenanceType.INSPECTION, 
        notes: 'Annual safety inspection completed',
        completedBy: 'Safety Inspector',
        status: 'Completed'
      }
    ];
    localStorage.setItem('maintenance', JSON.stringify(maintenance));

    // Initial notifications
    const notifications: Notification[] = [
      {
        id: 'n1',
        type: 'rental',
        message: 'New rental order created for Concrete Mixer',
        timestamp: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        relatedId: 'r1'
      },
      {
        id: 'n2',
        type: 'maintenance',
        message: 'Maintenance scheduled for Jackhammer J45',
        timestamp: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        read: true,
        relatedId: 'm1'
      },
      {
        id: 'n3',
        type: 'equipment',
        message: 'Electric Generator G3000 has been returned',
        timestamp: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        read: false,
        relatedId: 'eq3'
      }
    ];
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }
};

// Generic CRUD operations for all entity types
export const getItems = <T>(key: string): T[] => {
  const items = localStorage.getItem(key);
  return items ? JSON.parse(items) : [];
};

export const addItem = <T>(key: string, item: Omit<T, 'id'>): T => {
  const items = getItems<T>(key);
  const newItem = { ...item, id: uuidv4() } as T;
  localStorage.setItem(key, JSON.stringify([...items, newItem]));
  return newItem;
};

export const updateItem = <T extends { id: string }>(key: string, updatedItem: T): T => {
  const items = getItems<T>(key);
  const updatedItems = items.map(item => 
    (item as T).id === updatedItem.id ? updatedItem : item
  );
  localStorage.setItem(key, JSON.stringify(updatedItems));
  return updatedItem;
};

export const deleteItem = <T extends { id: string }>(key: string, id: string): void => {
  const items = getItems<T>(key);
  const filteredItems = items.filter(item => (item as T).id !== id);
  localStorage.setItem(key, JSON.stringify(filteredItems));
};

export const getItemById = <T extends { id: string }>(key: string, id: string): T | null => {
  const items = getItems<T>(key);
  return items.find(item => (item as T).id === id) || null;
};

// User specific functions
export const authenticateUser = (email: string, password: string): User | null => {
  const users = getItems<User>('users');
  return users.find(user => user.email === email && user.password === password) || null;
};

// Session management
export const setCurrentUser = (user: Omit<User, 'password'>): void => {
  const { password, ...userWithoutPassword } = user as User;
  localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
};

export const getCurrentUser = (): Omit<User, 'password'> | null => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

export const logout = (): void => {
  localStorage.removeItem('currentUser');
};