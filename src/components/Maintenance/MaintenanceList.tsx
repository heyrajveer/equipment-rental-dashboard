import { useState, useEffect } from 'react';
import { useMaintenance } from '../../contexts/MaintenanceContext';
import { useEquipment } from '../../contexts/EquipmentContext';
import { useAuth } from '../../contexts/AuthContext';
import { Maintenance, MaintenanceType, UserRole } from '../../types';
import { Plus, Search, Calendar, Edit, PenTool as Tool } from 'lucide-react';
import MaintenanceForm from './MaintenanceForm';

interface MaintenanceListProps {
  equipmentId?: string; // Optional: used to filter maintenance for a specific equipment
}

const MaintenanceList = ({ equipmentId }: MaintenanceListProps) => {
  const { maintenance, loading, error, updateMaintenance, getMaintenanceByEquipment } = useMaintenance();
  const { equipment } = useEquipment();
  const { hasRole } = useAuth();
  
  const [filteredMaintenance, setFilteredMaintenance] = useState<Maintenance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null);

  const canManageMaintenance = hasRole([UserRole.ADMIN, UserRole.STAFF]);

  useEffect(() => {
    let records = equipmentId
      ? getMaintenanceByEquipment(equipmentId)
      : maintenance;
    
    // Apply status filter if selected
    if (statusFilter) {
      records = records.filter(record => record.status === statusFilter);
    }
    
    // Apply type filter if selected
    if (typeFilter) {
      records = records.filter(record => record.type === typeFilter);
    }
    
    // Apply search term to notes
    if (searchTerm) {
      records = records.filter(record => 
        record.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort by date (newest first)
    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredMaintenance(records);
  }, [maintenance, equipmentId, statusFilter, typeFilter, searchTerm, getMaintenanceByEquipment]);

  const handleStatusChange = async (id: string, newStatus: 'Scheduled' | 'In Progress' | 'Completed') => {
    const record = maintenance.find(m => m.id === id);
    if (!record) return;
    
    try {
      await updateMaintenance({ ...record, status: newStatus });
    } catch (err) {
      console.error('Failed to update maintenance status:', err);
    }
  };

  const handleAddNew = () => {
    setEditingMaintenance(null);
    setShowForm(true);
  };

  const handleEdit = (maintenance: Maintenance) => {
    setEditingMaintenance(maintenance);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMaintenance(null);
  };

  const getEquipmentName = (id: string) => {
    const item = equipment.find(eq => eq.id === id);
    return item ? item.name : 'Unknown Equipment';
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-orange-100 text-orange-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !equipmentId) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !equipmentId) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingMaintenance ? 'Edit Maintenance Record' : 'Add Maintenance Record'}
              </h2>
              <MaintenanceForm 
                existingMaintenance={editingMaintenance}
                preselectedEquipmentId={equipmentId}
                onClose={handleCloseForm}
              />
            </div>
          </div>
        </div>
      )}

      {!equipmentId && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Maintenance Records</h1>
            {canManageMaintenance && (
              <button
                onClick={handleAddNew}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} className="mr-1" />
                Add Maintenance
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search in notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {Object.values(MaintenanceType).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      )}
      
      {equipmentId && canManageMaintenance && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleAddNew}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} className="mr-1" />
            Add Maintenance
          </button>
        </div>
      )}

      {filteredMaintenance.length === 0 ? (
        <div className="bg-white rounded-lg p-6 text-center text-gray-500 border border-gray-200">
          No maintenance records found.
          {canManageMaintenance && ' Click "Add Maintenance" to create a new record.'}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {!equipmentId && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipment
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  {canManageMaintenance && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMaintenance.map(record => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    {!equipmentId && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getEquipmentName(record.equipmentId)}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-gray-400 mr-2" />
                        <span>{new Date(record.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Tool size={16} className="text-gray-400 mr-2" />
                        <span>{record.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {canManageMaintenance ? (
                        <select
                          value={record.status}
                          onChange={(e) => handleStatusChange(
                            record.id, 
                            e.target.value as 'Scheduled' | 'In Progress' | 'Completed'
                          )}
                          className={`text-sm px-3 py-1 rounded-md border ${getStatusClass(record.status)}`}
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      ) : (
                        <span className={`text-sm px-3 py-1 rounded-full ${getStatusClass(record.status)}`}>
                          {record.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {record.notes}
                    </td>
                    {canManageMaintenance && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEdit(record)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceList;