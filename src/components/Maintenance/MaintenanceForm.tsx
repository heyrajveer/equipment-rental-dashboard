import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useMaintenance } from '../../contexts/MaintenanceContext';
import { useEquipment } from '../../contexts/EquipmentContext';
import { MaintenanceType, Maintenance } from '../../types';
import toast from 'react-hot-toast';

interface MaintenanceFormProps {
  existingMaintenance?: Maintenance | null;
  preselectedEquipmentId?: string;
  onClose: () => void;
}

const MaintenanceForm = ({ 
  existingMaintenance, 
  preselectedEquipmentId,
  onClose 
}: MaintenanceFormProps) => {
  const [date, setDate] = useState<Date | null>(null);
  const [equipmentId, setEquipmentId] = useState<string>('');
  const [type, setType] = useState<MaintenanceType>(MaintenanceType.ROUTINE);
  const [notes, setNotes] = useState<string>('');
  const [completedBy, setCompletedBy] = useState<string>('');
  const [status, setStatus] = useState<'Scheduled' | 'In Progress' | 'Completed'>('Scheduled');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addMaintenance, updateMaintenance } = useMaintenance();
  const { equipment } = useEquipment();

  useEffect(() => {
    if (existingMaintenance) {
      setDate(new Date(existingMaintenance.date));
      setEquipmentId(existingMaintenance.equipmentId);
      setType(existingMaintenance.type);
      setNotes(existingMaintenance.notes);
      setCompletedBy(existingMaintenance.completedBy || '');
      setStatus(existingMaintenance.status);
    } else {
      // For new maintenance records
      setDate(new Date());
      setType(MaintenanceType.ROUTINE);
      setNotes('');
      setCompletedBy('');
      setStatus('Scheduled');
      
      // If we have a preselected equipment ID
      if (preselectedEquipmentId) {
        setEquipmentId(preselectedEquipmentId);
      } else {
        setEquipmentId('');
      }
    }
  }, [existingMaintenance, preselectedEquipmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    if (!date) {
      setError('Please select a date');
      setIsSubmitting(false);
      return;
    }
    
    if (!equipmentId) {
      setError('Please select equipment');
      setIsSubmitting(false);
      return;
    }
    
    if (!notes) {
      setError('Please provide maintenance notes');
      setIsSubmitting(false);
      return;
    }
    
    try {
      if (existingMaintenance) {
        await updateMaintenance({
          ...existingMaintenance,
          date: date.toISOString().split('T')[0],
          equipmentId,
          type,
          notes,
          completedBy,
          status
        });
        toast.success('Maintenance record updated successfully');
      } else {
        await addMaintenance({
          date: date.toISOString().split('T')[0],
          equipmentId,
          type,
          notes,
          completedBy,
          status
        });
        toast.success('Maintenance record created successfully');
      }
      onClose();
    } catch (err) {
      setError('Failed to save maintenance record');
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
            disabled={!!preselectedEquipmentId}
          >
            <option value="">Select Equipment</option>
            {equipment.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date*
          </label>
          <DatePicker
            selected={date}
            onChange={(date) => setDate(date)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value as MaintenanceType)}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.values(MaintenanceType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'Scheduled' | 'In Progress' | 'Completed')}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="completedBy" className="block text-sm font-medium text-gray-700 mb-1">
            Completed By
          </label>
          <input
            type="text"
            id="completedBy"
            value={completedBy}
            onChange={(e) => setCompletedBy(e.target.value)}
            placeholder="Name of technician/team who completed the work"
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes*
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          required
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
          {isSubmitting ? 'Saving...' : existingMaintenance ? 'Update Maintenance' : 'Add Maintenance'}
        </button>
      </div>
    </form>
  );
};

export default MaintenanceForm;