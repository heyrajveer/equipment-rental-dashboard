import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, PackageOpen } from 'lucide-react';
import { useEquipment } from '../../contexts/EquipmentContext';
import { useAuth } from '../../contexts/AuthContext';
import { Equipment, EquipmentStatus, UserRole } from '../../types';
import EquipmentForm from './EquipmentForm';

const EquipmentList = () => {
  const { equipment, loading, error, deleteEquipment } = useEquipment();
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const canManageEquipment = hasRole([UserRole.ADMIN, UserRole.STAFF]);

  // Extract unique categories
  useEffect(() => {
    if (equipment.length > 0) {
      const uniqueCategories = Array.from(new Set(equipment.map(item => item.category)));
      setCategories(uniqueCategories);
    }
  }, [equipment]);

  // Filter equipment based on search and filters
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await deleteEquipment(id);
      } catch (err) {
        console.error('Failed to delete equipment:', err);
      }
    }
  };

  const handleEdit = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingEquipment(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEquipment(null);
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
                {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
              </h2>
              <EquipmentForm 
                existingEquipment={editingEquipment}
                onClose={handleCloseForm}
              />
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Equipment Inventory</h1>
          {canManageEquipment && (
            <button
              onClick={handleAddNew}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} className="mr-1" />
              Add Equipment
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            {Object.values(EquipmentStatus).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredEquipment.length === 0 ? (
        <div className="bg-white rounded-lg p-6 text-center text-gray-500 border border-gray-200">
          No equipment found. {canManageEquipment && 'Click "Add Equipment" to create new equipment.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map(item => (
            <div 
              key={item.id} 
              className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="h-48 bg-gray-200 overflow-hidden">
                {item.image ? (
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <PackageOpen className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mt-1">{item.category}</p>
                <p className="text-sm text-gray-500 mt-1">Condition: {item.condition}</p>
                
                {item.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.description}</p>
                )}
                
                <div className="flex mt-4 pt-3 border-t border-gray-100 justify-between">
                  <Link 
                    to={`/equipment/${item.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                  >
                    <Eye size={16} className="mr-1" />
                    View Details
                  </Link>
                  
                  {canManageEquipment && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-gray-600 hover:text-blue-600 p-1"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-600 hover:text-red-600 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentList;