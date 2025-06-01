import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useRental } from '../../contexts/RentalContext';
import { useEquipment } from '../../contexts/EquipmentContext';
import { useAuth } from '../../contexts/AuthContext';
import { Rental, RentalStatus, Equipment, EquipmentStatus, User, UserRole } from '../../types';
import { getItems } from '../../utils/localStorageUtils';
import toast from 'react-hot-toast';

interface RentalFormProps {
  existingRental?: Rental | null;
  onClose: () => void;
}

const RentalForm = ({ existingRental, onClose }: RentalFormProps) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [equipmentId, setEquipmentId] = useState<string>('');
  const [customerId, setCustomerId] = useState<string>('');
  const [status, setStatus] = useState<RentalStatus>(RentalStatus.RESERVED);
  const [notes, setNotes] = useState<string>('');
  const [availableEquipment, setAvailableEquipment] = useState<Equipment[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addRental, updateRental } = useRental();
  const { equipment } = useEquipment();
  const { currentUser, hasRole } = useAuth();

  const isAdminOrStaff = hasRole([UserRole.ADMIN, UserRole.STAFF]);
  
  useEffect(() => {
    // Get all equipment that's available or the currently selected one
    const filteredEquipment = equipment.filter(item => 
      item.status === EquipmentStatus.AVAILABLE || 
      (existingRental && item.id === existingRental.equipmentId)
    );
    setAvailableEquipment(filteredEquipment);
    
    // Get all users with CUSTOMER role
    const allUsers = getItems<User>('users');
    const customerUsers = allUsers.filter(user => user.role === UserRole.CUSTOMER);
    setCustomers(customerUsers);
  }, [equipment, existingRental]);
  
  useEffect(() => {
    if (existingRental) {
      setStartDate(new Date(existingRental.startDate));
      setEndDate(new Date(existingRental.endDate));
      setEquipmentId(existingRental.equipmentId);
      setCustomerId(existingRental.customerId);
      setStatus(existingRental.status);
      setNotes(existingRental.notes || '');
    } else {
      // For new rentals, default to the current user if it's a customer
      if (currentUser && currentUser.role === UserRole.CUSTOMER) {
        setCustomerId(currentUser.id);
      }
    }
  }, [existingRental, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      setIsSubmitting(false);
      return;
    }
    
    if (!equipmentId) {
      setError('Please select equipment');
      setIsSubmitting(false);
      return;
    }
    
    if (!customerId) {
      setError('Please select a customer');
      setIsSubmitting(false);
      return;
    }
    
    // Calculate a simple rental amount (for demo purposes)
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalAmount = days * 50; // $50 per day flat rate for demo
    
    try {
      if (existingRental) {
        await updateRental({
          ...existingRental,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          equipmentId,
          customerId,
          status,
          notes,
          totalAmount
        });
        toast.success('Rental updated successfully');
      } else {
        await addRental({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          equipmentId,
          customerId,
          status,
          notes,
          totalAmount,
          createdAt: new Date().toISOString()
        });
        toast.success('Rental created successfully');
      }
      onClose();
    } catch (err) {
      setError('Failed to save rental');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="equipmentId" className="block text-sm font-medium text-gray-700 mb-1">
            Equipment*
          </label>
          <select
            id="equipmentId"
            value={equipmentId}
            onChange={(e) => setEquipmentId(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={!isAdminOrStaff && existingRental}
          >
            <option value="">Select Equipment</option>
            {availableEquipment.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-1">
            Customer*
          </label>
          <select
            id="customerId"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={!isAdminOrStaff || (currentUser?.role === UserRole.CUSTOMER)}
          >
            <option value="">Select Customer</option>
            {customers.map(user => (
              <option key={user.id} value={user.id}>{user.email}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date*
          </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            minDate={new Date()}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date*
          </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate || new Date()}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as RentalStatus)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            disabled={!isAdminOrStaff}
          >
            {Object.values(RentalStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Saving...' : existingRental ? 'Update Rental' : 'Create Rental'}
        </button>
      </div>
    </form>
  );
};

export default RentalForm;