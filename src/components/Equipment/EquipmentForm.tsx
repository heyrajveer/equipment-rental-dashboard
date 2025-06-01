import { useState, useEffect } from 'react';
import { useEquipment } from '../../contexts/EquipmentContext';
import { Equipment, EquipmentStatus, EquipmentCondition } from '../../types';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface EquipmentFormProps {
  existingEquipment?: Equipment | null;
  onClose: () => void;
}

const EquipmentForm = ({ existingEquipment, onClose }: EquipmentFormProps) => {
  const [formData, setFormData] = useState<Omit<Equipment, 'id'>>({
    name: '',
    category: '',
    condition: EquipmentCondition.GOOD,
    status: EquipmentStatus.AVAILABLE,
    description: '',
    acquisitionDate: new Date().toISOString().split('T')[0]
  });
  
  const { addEquipment, updateEquipment } = useEquipment();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingEquipment) {
      setFormData({
        name: existingEquipment.name,
        category: existingEquipment.category,
        condition: existingEquipment.condition,
        status: existingEquipment.status,
        description: existingEquipment.description || '',
        acquisitionDate: existingEquipment.acquisitionDate || new Date().toISOString().split('T')[0],
        image: existingEquipment.image
      });
    }
  }, [existingEquipment]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      if (!formData.name || !formData.category) {
        setError('Name and category are required');
        return;
      }
      
      if (existingEquipment) {
        await updateEquipment({
          ...formData,
          id: existingEquipment.id
        });
        toast.success('Equipment updated successfully');
      } else {
        await addEquipment(formData);
        toast.success('Equipment added successfully');
      }
      onClose();
    } catch (err) {
      setError('Failed to save equipment');
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
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category*
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
            Condition
          </label>
          <select
            id="condition"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.values(EquipmentCondition).map(condition => (
              <option key={condition} value={condition}>{condition}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.values(EquipmentStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="acquisitionDate" className="block text-sm font-medium text-gray-700 mb-1">
            Acquisition Date
          </label>
          <input
            type="date"
            id="acquisitionDate"
            name="acquisitionDate"
            value={formData.acquisitionDate}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image || ''}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
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
          {isSubmitting ? 'Saving...' : existingEquipment ? 'Update Equipment' : 'Add Equipment'}
        </button>
      </div>
    </form>
  );
};

export default EquipmentForm;