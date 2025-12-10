import React, { useEffect, useState, useCallback } from 'react';
// *** IMPORTANT: Make sure you add an updateDestination function to your API file ***
import { getDestinations, createDestination, updateDestination } from '../../api/destinationApi'; 
import MainLayout from '../../layout/Mainlayout.jsx';
import { Plus, X, Pencil } from 'lucide-react'; // Changed Trash2 to Pencil

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for the single form modal (used for both Create and Edit)
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [formData, setFormData] = useState({ id: null, name: '' }); // Added 'id' for editing
  const [formErrors, setFormErrors] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  // Data loading function
  const loadDestinations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDestinations(); 
      setDestinations(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load destinations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDestinations();
  }, [loadDestinations]);

  function validateForm() {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Destination Name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // --- Modal Open/Close Functions ---

  // Opens modal for CREATION
  function openCreateModal() {
    setIsEditMode(false);
    setFormData({ id: null, name: '' });
    setFormErrors({});
    setShowModal(true);
  }

  // Opens modal for EDITING
  function openEditModal(destination) {
    setIsEditMode(true);
    setFormData({ id: destination.id, name: destination.name });
    setFormErrors({});
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    // Reset states
    setIsEditMode(false);
    setFormData({ id: null, name: '' });
  }

  // --- Form Handlers ---

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    setActionLoading(true);
    try {
        if (isEditMode) {
            // EDIT LOGIC
            // Ensure ID is present for update
            if (!formData.id) throw new Error("Destination ID missing for update."); 
            
            // Assuming your update API needs { id, name }
            const { id, name } = formData;
            const updatedResult = await updateDestination(id, { name }); 
            
            // Update state: map through the array and replace the old item with the new one
            setDestinations(prev => 
                prev.map(dest => dest.id === id ? updatedResult : dest)
            );
            
            alert('Destination updated successfully');

        } else {
            // CREATE LOGIC
            const createdResult = await createDestination(formData);
            
            // Update state: Prepend the new item to the list
            setDestinations(prev => [createdResult, ...prev]); 
            
            alert('Destination created successfully');
        }

        closeModal();
    } catch (err) {
      alert(`Error: ${isEditMode ? 'Failed to update' : 'Failed to create'} destination. ${err.message || ''}`);
    } finally {
      setActionLoading(false);
    }
  }

  // --- Render ---

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">Destinations</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto justify-center"
          >
            <Plus size={20} /> Add Destination
          </button>
        </div>

        {/* --- Error/Loading blocks --- */}
        {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg border border-red-200">Error: {error}</div>}

        {loading ? (
          <div className="text-center py-10">Loading destinations...</div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No destinations found. Add one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow border">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-3 text-left text-sm font-semibold">Destination Name</th>
                  <th className="border p-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {destinations.map(dest => (
                  <tr key={dest.id} className="border-b hover:bg-gray-50">
                    <td className="border p-3 text-sm">{dest.name}</td>
                    <td className="border p-3">
                      <div className="flex gap-2 justify-center">
                        {/* 1. Only Edit button remains */}
                        <button
                          onClick={() => openEditModal(dest)}
                          className="text-indigo-600 hover:text-indigo-800 transition p-1 rounded hover:bg-indigo-50"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        {/* 2. Delete button and logic has been REMOVED */}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- Create/Edit Modal (Single Modal for both actions) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center border-b p-4 bg-gray-50">
              <h2 className="text-xl font-semibold">
                {isEditMode ? 'Edit Destination' : 'Add New Destination'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200">
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Destination Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      className={`w-full border rounded-lg px-3 py-2 text-sm ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`} 
                      placeholder="e.g., Mumbai, Pune"
                    />
                    {formErrors.name && (<p className="text-red-600 text-xs mt-1">{formErrors.name}</p>)}
                </div>
              </form>
            </div>

            <div className="border-t p-4 bg-gray-50">
              <div className="flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm" 
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  onClick={handleSubmit} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50" 
                  disabled={actionLoading}
                >
                  {actionLoading 
                    ? (isEditMode ? 'Updating...' : 'Creating...') 
                    : (isEditMode ? 'Save Changes' : 'Create Destination')
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Delete Confirmation Modal has been REMOVED */}
    </MainLayout>
  );
}