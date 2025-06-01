export enum UserRole {
  ADMIN = 'Admin',
  STAFF = 'Staff',
  CUSTOMER = 'Customer'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  password: string;
}

export enum EquipmentStatus {
  AVAILABLE = 'Available',
  RENTED = 'Rented',
  MAINTENANCE = 'Maintenance',
  RETIRED = 'Retired'
}

export enum EquipmentCondition {
  EXCELLENT = 'Excellent',
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor'
}

export interface Equipment {
  id: string;
  name: string;
  category: string;
  condition: EquipmentCondition;
  status: EquipmentStatus;
  description?: string;
  acquisitionDate?: string;
  image?: string;
}

export enum RentalStatus {
  RESERVED = 'Reserved',
  RENTED = 'Rented',
  RETURNED = 'Returned',
  CANCELLED = 'Cancelled',
  OVERDUE = 'Overdue'
}

export interface Rental {
  id: string;
  equipmentId: string;
  customerId: string;
  startDate: string;
  endDate: string;
  status: RentalStatus;
  notes?: string;
  totalAmount?: number;
  createdAt: string;
}

export enum MaintenanceType {
  ROUTINE = 'Routine Check',
  REPAIR = 'Repair',
  INSPECTION = 'Inspection',
  CALIBRATION = 'Calibration'
}

export interface Maintenance {
  id: string;
  equipmentId: string;
  date: string;
  type: MaintenanceType;
  notes: string;
  completedBy?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
}

export interface Notification {
  id: string;
  type: 'rental' | 'maintenance' | 'equipment';
  message: string;
  timestamp: string;
  read: boolean;
  relatedId?: string;
}

export interface KPI {
  totalEquipment: number;
  availableEquipment: number;
  rentedEquipment: number;
  overdueRentals: number;
  upcomingMaintenance: number;
  rentalRevenue: number;
}