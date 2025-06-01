import { useState, useEffect } from 'react';
import { useRental } from '../../contexts/RentalContext';
import { useEquipment } from '../../contexts/EquipmentContext';
import { useAuth } from '../../contexts/AuthContext';
import { Rental, RentalStatus, Equipment, UserRole } from '../../types';
import { Calendar, Edit, Plus, Search, Filter } from 'lucide-react';
import RentalForm from './RentalForm';

const RentalList = () => {
  const { rentals, loading, error, updateRental } = useRental();
  const { equipment } = useEquipment();
  const { currentUser, hasRole } = useAuth();
  const [filteredRentals, setFilteredRentals] = useState<Rental[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RentalStatus | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [editingRental, setEditingRental] = useState<Rental | null>(null);

  const isAdmin = hasRole([UserRole.ADMIN]);
  const isStaff = hasRole([UserRole.STAFF]);

  useEffect(() => {
    if (rentals.length > 0) {
      let filtered = [...rentals];
      
      // Filter by customer if the current user is a customer
      if (currentUser && currentUser.role === UserRole.CUSTOMER) {
        filtered = filtered.filter(rental => rental.customerId === currentUser.id);
      }
      
      // Apply status filter if selected
      if (statusFilter) {
        filtered = filtered.filter(rental => rental.status === statusFilter);
      }
      
      // Apply search term to equipment name
      if (searchTerm) {
        filtered = filtered.filter(rental => {
          const relatedEquipment = equipment.find(eq => eq.id === rental.equipmentId);
          if (!relatedEquipment) return false;
          
          return relatedEquipment.name.toLowerCase().includes(searchTerm.toLowerCase());
        });
      }
      
      // Sort by creation date (newest first)
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setFilteredRentals(filtered);
    } else {
      setFilteredRentals([]);
    }
  }, [rentals, statusFilter, searchTerm, currentUser, equipment]);

  const handleStatusChange = async (rentalId: string, newStatus: RentalStatus) => {
    const rental = rentals.find(r => r.id === rentalId);
    if (!rental) return;
    
    try {
      await updateRental({ ...rental, status: newStatus });
    } catch (err) {
      console.error('Failed to update rental status:', err);
    }
  };

  const handleAddNew = () => {
    setEditingRental(null);
    setShowForm(true);
  };

  const handleEdit = (rental: Rental) => {
    setEditingRental(rental);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRental(null);
  };

  const getStatusClass = (status: RentalStatus): string => {
    switch (status) {
      case RentalStatus.RESERVED:
        return 'bg-blue-100 text-blue-800';
      case RentalStatus.RENTED:
        return 'bg-green-100 text-green-800';
      case RentalStatus.RETURNED:
        return 'bg-gray-100 text-gray-800';
      case RentalStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case RentalStatus.OVERDUE:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEquipmentName = (equipmentId: string): string => {
    const item = equipment.find(eq => eq.id === equipmentId);
    return item ? item.name : 'Unknown Equipment';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
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
                {editingRental ? 'Edit Rental Order' : 'Create New Rental Order'}
              </h2>
              <RentalForm 
                existingRental={editingRental}
                onClose={handleCloseForm}
              />
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Rental Orders</h1>
          {(isAdmin || isStaff || currentUser?.role === UserRole.CUSTOMER) && (
            <button
              onClick={handleAddNew}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} className="mr-1" />
              Create Rental
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by equipment name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RentalStatus | '')}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            {Object.values(RentalStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredRentals.length === 0 ? (
        <div className="bg-white rounded-lg p-6 text-center text-gray-500 border border-gray-200">
          No rental orders found. {(isAdmin || isStaff || currentUser?.role === UserRole.CUSTOMER) && 'Click "Create Rental" to create a new rental order.'}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rental Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {(isAdmin || isStaff) && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRentals.map(rental => (
                  <tr key={rental.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {getEquipmentName(rental.equipmentId)}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {rental.equipmentId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-gray-400 mr-2" />
                        <span>
                          {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      {rental.notes && (
                        <div className="text-sm text-gray-500 mt-1">{rental.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(isAdmin || isStaff) ? (
                        <select
                          value={rental.status}
                          onChange={(e) => handleStatusChange(rental.id, e.target.value as RentalStatus)}
                          className={`text-sm px-3 py-1 rounded-md border ${getStatusClass(rental.status)}`}
                        >
                          {Object.values(RentalStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`text-sm px-3 py-1 rounded-full ${getStatusClass(rental.status)}`}>
                          {rental.status}
                        </span>
                      )}
                    </td>
                    {(isAdmin || isStaff) && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEdit(rental)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
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

export default RentalList;