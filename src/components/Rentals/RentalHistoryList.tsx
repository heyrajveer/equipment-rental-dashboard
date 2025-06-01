import { useState, useEffect } from 'react';
import { useRental } from '../../contexts/RentalContext';
import { useAuth } from '../../contexts/AuthContext';
import { getItems } from '../../utils/localStorageUtils';
import { RentalStatus, UserRole, User } from '../../types';
import { Calendar, Edit } from 'lucide-react';
import RentalForm from './RentalForm';

interface RentalHistoryListProps {
  equipmentId: string;
}

const RentalHistoryList = ({ equipmentId }: RentalHistoryListProps) => {
  const { getRentalsByEquipment } = useRental();
  const { hasRole } = useAuth();
  const [rentalHistory, setRentalHistory] = useState<any[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRental, setEditingRental] = useState<any | null>(null);

  const canEdit = hasRole([UserRole.ADMIN, UserRole.STAFF]);

  useEffect(() => {
    const rentals = getRentalsByEquipment(equipmentId);
    const users = getItems<User>('users');
    
    // Sort by start date (newest first)
    const sorted = [...rentals].sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
    
    setRentalHistory(sorted);
    setCustomers(users);
  }, [equipmentId, getRentalsByEquipment]);

  const handleEdit = (rental: any) => {
    setEditingRental(rental);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRental(null);
  };

  const getCustomerEmail = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.email : 'Unknown Customer';
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

  if (rentalHistory.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No rental history available for this equipment.
      </div>
    );
  }

  return (
    <div>
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Edit Rental Order</h2>
              <RentalForm 
                existingRental={editingRental}
                onClose={handleCloseForm}
              />
            </div>
          </div>
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rental Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              {canEdit && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rentalHistory.map(rental => (
              <tr key={rental.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {getCustomerEmail(rental.customerId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar size={16} className="text-gray-400 mr-2" />
                    <span>
                      {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(rental.status)}`}>
                    {rental.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${rental.totalAmount || 'N/A'}
                </td>
                {canEdit && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEdit(rental)}
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
  );
};

export default RentalHistoryList;