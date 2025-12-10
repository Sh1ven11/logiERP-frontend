import React, { useEffect, useState, useContext, useCallback } from 'react';
import { getLorryOwners, createLorryOwner, updateLorryOwner, deleteLorryOwner } from '../../api/lorryOwnerApi.js';
import MainLayout from '../../layout/Mainlayout.jsx';
import { Trash2, Edit, Plus, X } from 'lucide-react';
import { SettingsContext } from '../../context/SettingsContext.jsx'; // Required for filtering

export default function LorryOwnersPage() {
  const { selectedCompany } = useContext(SettingsContext);
  
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOwner, setEditingOwner] = useState(null);
  
  // *** CHANGE 1: Updated formData structure for three address lines ***
  const [formData, setFormData] = useState({
    name: '',
    address1: '', // New field
    address2: '', // New field
    address3: '', // New field
    panNumber: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Data loading function based on company context
  const loadOwners = useCallback(async () => {
    if (!selectedCompany?.id) {
        setOwners([]);
        setLoading(false);
        setError("Please select a company to view lorry owners.");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getLorryOwners(selectedCompany.id); 
      setOwners(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load lorry owners.");
    } finally {
      setLoading(false);
    }
  }, [selectedCompany?.id]);

  useEffect(() => {
    loadOwners();
  }, [loadOwners]);

  // *** CHANGE 2: Updated validation for address1 ***
  function validateForm() {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.address1.trim()) errors.address1 = 'Address Line 1 is required'; // Must validate at least the first line
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // *** CHANGE 3: Updated openCreateModal reset ***
  function openCreateModal() {
    if (!selectedCompany?.id) {
        alert("Please select a company first.");
        return;
    }
    setIsEditing(false);
    setEditingOwner(null);
    setFormData({
      name: '',
      address1: '',
      address2: '',
      address3: '',
      panNumber: '',
    });
    setFormErrors({});
    setShowModal(true);
  }

  // *** CHANGE 4: Updated openEditModal to map fields from owner object ***
  function openEditModal(owner) {
    setIsEditing(true);
    setEditingOwner(owner);
    setFormData({
      name: owner.name,
      // Assuming your API/database will store/return these fields
      address1: owner.address1 || '', 
      address2: owner.address2 || '',
      address3: owner.address3 || '',
      panNumber: owner.panNumber || '',
    });
    setFormErrors({});
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setIsEditing(false);
    setEditingOwner(null);
  }

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
    if (!selectedCompany?.id) return alert("Company context missing.");

    setActionLoading(true);
    try {
      let result;
      // Inject companyId into the payload
      const dataToSend = { ...formData, companyId: selectedCompany.id }; 

      if (isEditing && editingOwner) {
        // Use the combined address fields for the update
        result = await updateLorryOwner(editingOwner.id, dataToSend);
        setOwners(prev =>
          prev.map(b => (b.id === editingOwner.id ? result : b))
        );
      } else {
        // Use the combined address fields for the creation
        result = await createLorryOwner(dataToSend);
        setOwners(prev => [result, ...prev]);
      }
      closeModal();
      alert(isEditing ? 'Owner updated successfully' : 'Owner created successfully');
    } catch (err) {
      alert('Error: ' + (err.message || 'Failed to save owner'));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(id) {
    setActionLoading(true);
    try {
      await deleteLorryOwner(id);
      setOwners(prev => prev.filter(b => b.id !== id));
      setDeleteConfirm(null);
      alert('Owner deleted successfully');
    } catch (err) {
      alert('Error: ' + (err.message || 'Failed to delete owner'));
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">Lorry Owners ({selectedCompany?.name || 'No Company Selected'})</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto justify-center"
          >
            <Plus size={20} /> New Owner
          </button>
        </div>

        {/* ... (Error/Loading blocks) ... */}

        {loading ? (
          <div className="text-center py-10">Loading lorry owners...</div>
        ) : owners.length === 0 && selectedCompany?.id ? (
          <div className="text-center py-10 text-gray-500">
            No lorry owners found for {selectedCompany.name}. Create one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow border">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-3 text-left text-sm font-semibold">Name</th>
                  {/* CHANGE 5: Displaying the combined address for the table */}
                  <th className="border p-3 text-left text-sm font-semibold">Address</th> 
                  <th className="border p-3 text-left text-sm font-semibold">PAN Number</th>
                  <th className="border p-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {owners.map(owner => (
                  <tr key={owner.id} className="border-b hover:bg-gray-50">
                    <td className="border p-3 text-sm">{owner.name}</td>
                    {/* CHANGE 6: Concatenating the address fields for display */}
                    <td className="border p-3 text-sm">
                      {[owner.address1, owner.address2, owner.address3]
                        .filter(Boolean) // Filter out null/empty strings
                        .join(', ')
                      }
                    </td> 
                    <td className="border p-3 text-sm font-mono">{owner.panNumber || '-'}</td>
                    <td className="border p-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => openEditModal(owner)}
                          className="text-blue-600 hover:text-blue-800 transition p-1 rounded hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(owner.id)}
                          className="text-red-600 hover:text-red-800 transition p-1 rounded hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center border-b p-4 bg-gray-50">
              <h2 className="text-xl font-semibold">
                {isEditing ? 'Edit Lorry Owner' : 'New Lorry Owner'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200">
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={`w-full border rounded-lg px-3 py-2 text-sm ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`} placeholder="Lorry Owner Name"/>
                    {formErrors.name && (<p className="text-red-600 text-xs mt-1">{formErrors.name}</p>)}
                  </div>
                  
                  {/* Placeholder for alignment (retaining structure) */}
                  <div></div>
                  
                  {/* *** CHANGE 7: Address Line 1 *** */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
                    <input 
                        type="text" 
                        name="address1" 
                        value={formData.address1} 
                        onChange={handleInputChange} 
                        className={`w-full border rounded-lg px-3 py-2 text-sm ${formErrors.address1 ? 'border-red-500' : 'border-gray-300'}`} 
                        placeholder="Street, Building Name"
                    />
                    {formErrors.address1 && (<p className="text-red-600 text-xs mt-1">{formErrors.address1}</p>)}
                  </div>
                  
                  {/* *** CHANGE 8: Address Line 2 *** */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Address Line 2</label>
                    <input 
                        type="text" 
                        name="address2" 
                        value={formData.address2} 
                        onChange={handleInputChange} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                        placeholder="Area, Locality"
                    />
                  </div>

                  {/* *** CHANGE 9: Address Line 3 *** */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">City/Pin Code (Address Line 3)</label>
                    <input 
                        type="text" 
                        name="address3" 
                        value={formData.address3} 
                        onChange={handleInputChange} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" 
                        placeholder="City, State, Pin Code"
                    />
                  </div>

                  {/* PAN Card */}
                  <div>
                    <label className="block text-sm font-medium mb-1">PAN Card</label>
                    <input 
                        type="text" 
                        name="panNumber" // Changed from panCard to panNumber to match state and API payload
                        value={formData.panNumber} 
                        onChange={handleInputChange} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase" 
                        placeholder="e.g., ABCDE1234F"
                    />
                  </div>
                  
                  {/* Placeholder for alignment */}
                  <div></div>
                </div>
              </form>
            </div>

            <div className="border-t p-4 bg-gray-50">
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm" disabled={actionLoading}>
                  Cancel
                </button>
                <button type="submit" onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50" disabled={actionLoading}>
                  {actionLoading ? 'Saving...' : isEditing ? 'Update Owner' : 'Create Owner'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Confirm Delete</h2>
              <button onClick={() => setDeleteConfirm(null)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this lorry owner? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm" disabled={actionLoading}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50" disabled={actionLoading}>
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}