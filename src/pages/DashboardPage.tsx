import { useEffect } from 'react';
import DashboardStats from '../components/Dashboard/DashboardStats';
import RentalChart from '../components/Dashboard/RentalChart';
import EquipmentStatusChart from '../components/Dashboard/EquipmentStatusChart';
import { useRental } from '../contexts/RentalContext';
import { useEquipment } from '../contexts/EquipmentContext';
import { useMaintenance } from '../contexts/MaintenanceContext';
import { EquipmentStatus, RentalStatus } from '../types';
import { Calendar, PackageOpen, Wrench, AlertTriangle } from 'lucide-react';

const DashboardPage = () => {
  const { rentals, refreshRentals } = useRental();
  const { equipment, refreshEquipment } = useEquipment();
  const { maintenance, refreshMaintenance } = useMaintenance();

  useEffect(() => {
    // Refresh all data when dashboard is loaded
    refreshRentals();
    refreshEquipment();
    refreshMaintenance();
  }, [refreshRentals, refreshEquipment, refreshMaintenance]);

  // Get today's date
  const today = new Date();
  
  // Get recent rentals
  const recentRentals = [...rentals]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  // Get upcoming maintenance
  const upcomingMaintenance = maintenance
    .filter(record => {
      const maintenanceDate = new Date(record.date);
      return maintenanceDate >= today && record.status !== 'Completed';
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);
  
  // Get overdue rentals
  const overdueRentals = rentals.filter(rental => {
    const endDate = new Date(rental.endDate);
    return (
      endDate < today && 
      (rental.status === RentalStatus.RENTED || rental.status === RentalStatus.OVERDUE)
    );
  });

  // Get equipment due for maintenance (no maintenance in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const maintenanceByEquipment: Record<string, Date> = {};
  maintenance.forEach(record => {
    const date = new Date(record.date);
    if (!maintenanceByEquipment[record.equipmentId] || date > maintenanceByEquipment[record.equipmentId]) {
      maintenanceByEquipment[record.equipmentId] = date;
    }
  });
  
  const dueMaintenance = equipment
    .filter(item => {
      const lastMaintenance = maintenanceByEquipment[item.id];
      return (
        item.status !== EquipmentStatus.RETIRED && 
        (!lastMaintenance || lastMaintenance < thirtyDaysAgo)
      );
    })
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
        <DashboardStats />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RentalChart />
        <EquipmentStatusChart />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Rentals */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center">
            <Calendar className="mr-2 text-blue-500" size={20} />
            <h2 className="text-lg font-semibold">Recent Rentals</h2>
          </div>
          
          <div className="p-4">
            {recentRentals.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No recent rentals found.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentRentals.map(rental => {
                  const equipmentItem = equipment.find(eq => eq.id === rental.equipmentId);
                  return (
                    <li key={rental.id} className="py-3">
                      <div className="flex justify-between">
                        <span className="font-medium">{equipmentItem?.name || 'Unknown Equipment'}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          rental.status === RentalStatus.RESERVED ? 'bg-blue-100 text-blue-800' :
                          rental.status === RentalStatus.RENTED ? 'bg-green-100 text-green-800' :
                          rental.status === RentalStatus.RETURNED ? 'bg-gray-100 text-gray-800' :
                          rental.status === RentalStatus.OVERDUE ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {rental.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        
        {/* Upcoming Maintenance */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center">
            <Wrench className="mr-2 text-orange-500" size={20} />
            <h2 className="text-lg font-semibold">Upcoming Maintenance</h2>
          </div>
          
          <div className="p-4">
            {upcomingMaintenance.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No upcoming maintenance scheduled.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {upcomingMaintenance.map(record => {
                  const equipmentItem = equipment.find(eq => eq.id === record.equipmentId);
                  return (
                    <li key={record.id} className="py-3">
                      <div className="font-medium">{equipmentItem?.name || 'Unknown Equipment'}</div>
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-sm text-gray-600">
                          {new Date(record.date).toLocaleDateString()} - {record.type}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          record.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                          record.status === 'In Progress' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Rentals */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center">
            <AlertTriangle className="mr-2 text-red-500" size={20} />
            <h2 className="text-lg font-semibold">Overdue Rentals</h2>
          </div>
          
          <div className="p-4">
            {overdueRentals.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No overdue rentals.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {overdueRentals.map(rental => {
                  const equipmentItem = equipment.find(eq => eq.id === rental.equipmentId);
                  const daysPastDue = Math.ceil(
                    (today.getTime() - new Date(rental.endDate).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <li key={rental.id} className="py-3">
                      <div className="font-medium">{equipmentItem?.name || 'Unknown Equipment'}</div>
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-sm text-gray-600">
                          Due: {new Date(rental.endDate).toLocaleDateString()}
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                          {daysPastDue} day{daysPastDue !== 1 ? 's' : ''} overdue
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
        
        {/* Equipment Due for Maintenance */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center">
            <PackageOpen className="mr-2 text-purple-500" size={20} />
            <h2 className="text-lg font-semibold">Equipment Due for Maintenance</h2>
          </div>
          
          <div className="p-4">
            {dueMaintenance.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No equipment due for maintenance.
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {dueMaintenance.map(item => {
                  const lastMaintenance = maintenanceByEquipment[item.id];
                  
                  return (
                    <li key={item.id} className="py-3">
                      <div className="font-medium">{item.name}</div>
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-sm text-gray-600">
                          {item.category} - {item.condition}
                        </div>
                        {lastMaintenance ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                            Last: {lastMaintenance.toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                            Never maintained
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;