import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, CalendarClock, PenTool as Tool, Clock, PackageOpen } from 'lucide-react';
import { useEquipment } from '../../contexts/EquipmentContext';
import { useRental } from '../../contexts/RentalContext';
import { useMaintenance } from '../../contexts/MaintenanceContext';
import { useAuth } from '../../contexts/AuthContext';
import { Equipment, UserRole, EquipmentStatus } from '../../types';
import EquipmentForm from './EquipmentForm';
import RentalHistoryList from '../Rentals/RentalHistoryList';
import MaintenanceList from '../Maintenance/MaintenanceList';

const EquipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEquipmentById, deleteEquipment } = useEquipment();
  const { getRentalsByEquipment } = useRental();
  const { getMaintenanceByEquipment } = useMaintenance();
  const { hasRole } = useAuth();
  
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'rentals' | 'maintenance'>('info');
  
  const canManageEquipment = hasRole([UserRole.ADMIN, UserRole.STAFF]);
  
  useEffect(() => {
    if (id) {
      const equipmentData = getEquipmentById(id);
      setEquipment(equipmentData);
    }
  }, [id, getEquipmentById]);
  
  const handleDelete = async () => {
    if (!equipment) return;
    
    if (window.confirm(`Are you sure you want to delete ${equipment.name}?`)) {
      try {
        await deleteEquipment(equipment.id);
        navigate('/equipment');
      } catch (error) {
        console.error('Failed to delete equipment:', error);
      }
    }
  };
  
  const getStatusClass = (status: EquipmentStatus): string => {
    switch (status) {
      case EquipmentStatus.AVAILABLE:
        return 'bg-green-100 text-green-800';
      case EquipmentStatus.RENTED:
        return 'bg-blue-100 text-blue-800';
      case EquipmentStatus.MAINTENANCE:
        return 'bg-orange-100 text-orange-800';
      case EquipmentStatus.RETIRED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (!equipment) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const rentalHistory = getRentalsByEquipment(equipment.id);
  const maintenanceHistory = getMaintenanceByEquipment(equipment.id);
  
  return (
    <div>
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Edit Equipment</h2>
              <EquipmentForm 
                existingEquipment={equipment}
                onClose={() => setShowEditForm(false)}
              />
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Link to="/equipment" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{equipment.name}</h1>
        </div>
        
        {canManageEquipment && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowEditForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit size={18} className="mr-1" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Trash2 size={18} className="mr-1" />
              Delete
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b">
          <button
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'info' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('info')}
          >
            Equipment Info
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'rentals' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('rentals')}
          >
            Rental History
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm ${
              activeTab === 'maintenance' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('maintenance')}
          >
            Maintenance
          </button>
        </div>
        
        {activeTab === 'info' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                  {equipment.image ? (
                    <img 
                      src={equipment.image} 
                      alt={equipment.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <PackageOpen className="h-20 w-20 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-4">
                <div>
                  <span className={`text-sm px-3 py-1 rounded-full ${getStatusClass(equipment.status)}`}>
                    {equipment.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Category</h3>
                    <p>{equipment.category}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Condition</h3>
                    <p>{equipment.condition}</p>
                  </div>
                  {equipment.acquisitionDate && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Acquisition Date</h3>
                      <p>{new Date(equipment.acquisitionDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
                
                {equipment.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                    <p className="text-gray-700">{equipment.description}</p>
                  </div>
                )}
                
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg flex items-center">
                    <div className="p-2 bg-blue-100 rounded-full mr-3">
                      <CalendarClock size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-700">Rental History</h3>
                      <p className="text-blue-600 text-sm">{rentalHistory.length} rentals</p>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg flex items-center">
                    <div className="p-2 bg-orange-100 rounded-full mr-3">
                      <Tool size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-orange-700">Maintenance</h3>
                      <p className="text-orange-600 text-sm">{maintenanceHistory.length} records</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'rentals' && (
          <div className="p-6">
            <RentalHistoryList equipmentId={equipment.id} />
          </div>
        )}
        
        {activeTab === 'maintenance' && (
          <div className="p-6">
            <MaintenanceList equipmentId={equipment.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EquipmentDetail;