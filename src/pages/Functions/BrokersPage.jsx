import React, { useEffect, useState, useContext, useCallback } from 'react'; // ADDED useContext and useCallback
import { SettingsContext } from '../../context/SettingsContext.jsx'; // IMPORTED SettingsContext
import { getBrokers, createBroker, updateBroker, deleteBroker } from '../../api/brokerApi';
import MainLayout from '../../layout/Mainlayout.jsx';
import { Trash2, Edit, Plus, X } from 'lucide-react';

export default function BrokersPage() {
  // 1. CONTEXT INTEGRATION: Retrieve selectedCompany
  const { selectedCompany } = useContext(SettingsContext); 
  
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBroker, setEditingBroker] = useState(null);
  
  // FIX 2: Removed companyId from formData state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNo: '',
    panCard: '',
    tdsPercentage: 0,
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 3. UPDATED: Data fetching uses useCallback and selectedCompany context
  const loadBrokers = useCallback(async () => {
    if (!selectedCompany?.id) {
        setBrokers([]);
        setLoading(false);
        setError("Please select a company to view brokers.");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      // NOTE: getBrokers API function must be updated to accept companyId
      const data = await getBrokers(selectedCompany.id); 
      setBrokers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load brokers.");
    } finally {
      setLoading(false);
    }
  }, [selectedCompany?.id]); // DEPENDENCY: Rerun when selectedCompany changes

  // 4. UPDATED: useEffect now depends on loadBrokers (which depends on selectedCompany)
  useEffect(() => {
    loadBrokers();
  }, [loadBrokers]); 

  function validateForm() {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.phoneNo.trim()) errors.phoneNo = 'Phone No is required';
    // FIX 5: Removed companyId validation
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function openCreateModal() {
    // SECURITY CHECK: Do not open if company is not selected
    if (!selectedCompany?.id) {
        alert("Please select a company first.");
        return;
    }
    
    setIsEditing(false);
    setEditingBroker(null);
    // FIX 6: Removed companyId from reset state
    setFormData({
      name: '',
      address: '',
      phoneNo: '',
      panCard: '',
      tdsPercentage: 0,
      notes: '',
    });
    setFormErrors({});
    setShowModal(true);
  }

  function openEditModal(broker) {
    setIsEditing(true);
    setEditingBroker(broker);
    // FIX 7: Removed companyId from edit state payload
    setFormData({
      name: broker.name,
      address: broker.address,
      phoneNo: broker.phoneNo,
      panCard: broker.panCard || '',
      tdsPercentage: broker.tdsPercentage,
      notes: broker.notes || '',
    });
    setFormErrors({});
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setIsEditing(false);
    setEditingBroker(null);
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    // Note: The logic handles both number and string inputs
    const finalValue = name === 'tdsPercentage' 
      ? parseFloat(value) || 0
      : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
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
      // FIX 8: Inject companyId directly into the payload before submission
      const dataToSend = {
          ...formData,
          companyId: selectedCompany.id // Inject companyId from context
      };

      if (isEditing && editingBroker) {
        result = await updateBroker(editingBroker.id, dataToSend);
        setBrokers(prev =>
          prev.map(b => (b.id === editingBroker.id ? result : b))
        );
      } else {
        result = await createBroker(dataToSend);
        setBrokers(prev => [result, ...prev]);
      }
      closeModal();
      alert(isEditing ? 'Broker updated successfully' : 'Broker created successfully');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete(id) {
    setActionLoading(true);
    try {
      await deleteBroker(id);
      setBrokers(prev => prev.filter(b => b.id !== id));
      setDeleteConfirm(null);
      alert('Broker deleted successfully');
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <MainLayout>
      <div className="p-4 md:p-6">
        {/* ... (Header and New Broker Button remains the same) ... */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">Brokers ({selectedCompany?.name || 'No Company Selected'})</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto justify-center"
          >
            <Plus size={20} /> New Broker
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <span>{error}</span>
            <button
              onClick={loadBrokers}
              className="bg-red-800 text-white px-3 py-1 rounded hover:bg-red-900 text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">Loading brokers...</div>
        ) : brokers.length === 0 && selectedCompany?.id ? (
          <div className="text-center py-10 text-gray-500">
            No brokers found for {selectedCompany.name}. Create one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow border">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-3 text-left text-sm font-semibold">Name</th>
                  <th className="border p-3 text-left text-sm font-semibold">Address</th>
                  <th className="border p-3 text-left text-sm font-semibold">Phone</th>
                  <th className="border p-3 text-left text-sm font-semibold">TDS %</th>
                  <th className="border p-3 text-left text-sm font-semibold">PAN Card</th>
                  {/* FIX 9: Removed Company ID header as it's implicit */}
                  <th className="border p-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brokers.map(broker => (
                  <tr key={broker.id} className="border-b hover:bg-gray-50">
                    <td className="border p-3 text-sm">{broker.name}</td>
                    <td className="border p-3 text-sm">{broker.address}</td>
                    <td className="border p-3 text-sm">{broker.phoneNo}</td>
                    <td className="border p-3 text-sm">{broker.tdsPercentage}%</td>
                    <td className="border p-3 text-sm font-mono">{broker.panCard || '-'}</td>
                    {/* FIX 10: Removed Company ID data cell */}
                    <td className="border p-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => openEditModal(broker)}
                          className="text-blue-600 hover:text-blue-800 transition p-1 rounded hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(broker.id)}
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

      {/* Create/Edit Modal - FIXED SIZE */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b p-4 bg-gray-50">
              <h2 className="text-xl font-semibold">
                {isEditing ? `Edit Broker (ID: ${editingBroker?.brokerCode || editingBroker?.id})` : 'New Broker'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="overflow-y-auto flex-1 p-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* ... (Name field remains the same) ... */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 text-sm ${
                        formErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Broker Pune"
                    />
                    {formErrors.name && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 text-sm ${
                        formErrors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Pune"
                    />
                    {formErrors.address && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone No *
                    </label>
                    <input
                      type="text"
                      name="phoneNo"
                      value={formData.phoneNo}
                      onChange={handleInputChange}
                      className={`w-full border rounded-lg px-3 py-2 text-sm ${
                        formErrors.phoneNo ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., 9999999999"
                    />
                    {formErrors.phoneNo && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.phoneNo}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      PAN Card (Optional)
                    </label>
                    <input
                      type="text"
                      name="panCard"
                      value={formData.panCard}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase"
                      placeholder="e.g., ABCDE1234F"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      TDS Percentage
                    </label>
                    <input
                      type="number"
                      name="tdsPercentage"
                      value={formData.tdsPercentage}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>

                  {/* FIX 11: Removed Company ID Input Field */}
                  {/* ... (End of form fields) ... */}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      placeholder="Any additional notes"
                      rows="3"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
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
                  {actionLoading ? 'Saving...' : isEditing ? 'Update Broker' : 'Create Broker'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Unchanged) */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Confirm Delete</h2>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this broker? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}