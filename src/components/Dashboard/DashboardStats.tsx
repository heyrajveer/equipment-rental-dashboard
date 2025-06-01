import { useEffect, useState } from 'react';
import { 
  Package2, 
  PackageCheck, 
  PackageOpen, 
  Clock, 
  Wrench, 
  DollarSign 
} from 'lucide-react';
import { useEquipment } from '../../contexts/EquipmentContext';
import { useRental } from '../../contexts/RentalContext';
import { useMaintenance } from '../../contexts/MaintenanceContext';
import { EquipmentStatus, RentalStatus } from '../../types';
import KPICard from './KPICard';

const DashboardStats = () => {
  const { equipment } = useEquipment();
  const { rentals } = useRental();
  const { maintenance } = useMaintenance();
  
  const [stats, setStats] = useState({
    totalEquipment: 0,
    availableEquipment: 0,
    rentedEquipment: 0,
    overdueRentals: 0,
    upcomingMaintenance: 0,
    rentalRevenue: 0
  });

  useEffect(() => {
    // Calculate KPIs
    const totalEquipment = equipment.length;
    
    const availableEquipment = equipment.filter(
      item => item.status === EquipmentStatus.AVAILABLE
    ).length;
    
    const rentedEquipment = equipment.filter(
      item => item.status === EquipmentStatus.RENTED
    ).length;
    
    // Check for overdue rentals
    const today = new Date();
    const overdueRentals = rentals.filter(rental => {
      const endDate = new Date(rental.endDate);
      return (
        endDate < today && 
        (rental.status === RentalStatus.RENTED || rental.status === RentalStatus.OVERDUE)
      );
    }).length;
    
    // Calculate upcoming maintenance
    const upcomingMaintenance = maintenance.filter(record => {
      const maintenanceDate = new Date(record.date);
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(today.getDate() + 7);
      
      return (
        maintenanceDate >= today && 
        maintenanceDate <= oneWeekFromNow &&
        record.status !== 'Completed'
      );
    }).length;
    
    // Calculate total rental revenue
    const rentalRevenue = rentals.reduce((total, rental) => {
      if (rental.totalAmount) {
        return total + rental.totalAmount;
      }
      return total;
    }, 0);

    setStats({
      totalEquipment,
      availableEquipment,
      rentedEquipment,
      overdueRentals,
      upcomingMaintenance,
      rentalRevenue
    });
  }, [equipment, rentals, maintenance]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <KPICard
        title="Total Equipment"
        value={stats.totalEquipment}
        icon={<Package2 size={24} />}
        color="blue"
      />
      
      <KPICard
        title="Available Equipment"
        value={stats.availableEquipment}
        description={`${Math.round((stats.availableEquipment / stats.totalEquipment) * 100)}% of total`}
        icon={<PackageCheck size={24} />}
        color="green"
      />
      
      <KPICard
        title="Rented Equipment"
        value={stats.rentedEquipment}
        description={`${Math.round((stats.rentedEquipment / stats.totalEquipment) * 100)}% of total`}
        icon={<PackageOpen size={24} />}
        color="blue"
      />
      
      <KPICard
        title="Overdue Rentals"
        value={stats.overdueRentals}
        icon={<Clock size={24} />}
        color={stats.overdueRentals > 0 ? "red" : "green"}
      />
      
      <KPICard
        title="Upcoming Maintenance"
        value={stats.upcomingMaintenance}
        description="In the next 7 days"
        icon={<Wrench size={24} />}
        color="orange"
      />
      
      <KPICard
        title="Rental Revenue"
        value={`$${stats.rentalRevenue}`}
        icon={<DollarSign size={24} />}
        color="purple"
      />
    </div>
  );
};

export default DashboardStats;