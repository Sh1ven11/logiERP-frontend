import React, { useEffect, useState } from 'react';
import { getBrokers, createBroker, updateBroker, deleteBroker } from '../../api/brokerApi';
import MainLayout from '../../layout/Mainlayout.jsx';
import { Trash2, Edit, Plus } from 'lucide-react';

export default function BrokersPage() {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBroker, setEditingBroker] = useState(null);
  const [formData, setFormData] = useState({
    brokerCode: '',
    name: '',
    address: '',
    phoneNo: '',
    panCard: '',
    tdsPercentage: 0,
    notes: '',
    companyId: 1,
  });
  const [formErrors, setFormErrors] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBrokers();
  }, []);

  async function loadBrokers() {
    setLoading(true);
    setError(null);
    try {
      const data = await getBrokers();
      setBrokers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function validateForm() {
    const errors = {};
    if (!formData.brokerCode.trim()) errors.brokerCode = 'Broker Code is required';
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.phoneNo.trim()) errors.phoneNo = 'Phone No is required';
    if (!formData.companyId) errors.companyId = 'Company is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function openCreateModal() {
    setIsEditing(false);
    setEditingBroker(null);
    setFormData({
      brokerCode: '',
      name: '',
      address: '',
      phoneNo: '',
      panCard: '',
      tdsPercentage: 0,
      notes: '',
      companyId: 1,
    });
    setFormErrors({});
    setShowModal(true);
  }

  function openEditModal(broker) {
    setIsEditing(true);
    setEditingBroker(broker);
    setFormData({
      brokerCode: broker.brokerCode,
      name: broker.name,
      address: broker.address,
      phoneNo: broker.phoneNo,
      panCard: broker.panCard || '',
      tdsPercentage: broker.tdsPercentage,
      notes: broker.notes || '',
      companyId: broker.companyId,
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
    const finalValue = name === 'tdsPercentage' || name === 'companyId'
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

    setActionLoading(true);
    try {
      let result;
      if (isEditing && editingBroker) {
        result = await updateBroker(editingBroker.id, formData);
        setBrokers(prev =>
          prev.map(b => (b.id === editingBroker.id ? result : b))
        );
      } else {
        result = await createBroker(formData);
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
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold">Brokers</h1>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            <Plus size={20} /> New Broker
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
            {error}
            <button
              onClick={loadBrokers}
              className="ml-4 bg-red-800 text-white px-2 py-1 rounded hover:bg-red-900"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">Loading brokers...</div>
        ) : brokers.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No brokers found. Create one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="w-full border-collapse">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-3 text-left">Code</th>
                  <th className="border p-3 text-left">Name</th>
                  <th className="border p-3 text-left">Address</th>
                  <th className="border p-3 text-left">Phone</th>
                  <th className="border p-3 text-left">TDS %</th>
                  <th className="border p-3 text-left">Company ID</th>
                  <th className="border p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {brokers.map(broker => (
                  <tr key={broker.id} className="border-b hover:bg-gray-50">
                    <td className="border p-3">{broker.brokerCode}</td>
                    <td className="border p-3">{broker.name}</td>
                    <td className="border p-3">{broker.address}</td>
                    <td className="border p-3">{broker.phoneNo}</td>
                    <td className="border p-3">{broker.tdsPercentage}%</td>
                    <td className="border p-3">{broker.companyId}</td>
                    <td className="border p-3 text-center flex gap-2 justify-center">
                      <button
                        onClick={() => openEditModal(broker)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(broker.id)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
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
          <div className="bg-white rounded shadow-lg w-full max-w-md p-6">
            <h2 className="text-2xl font-semibold mb-4">
              {isEditing ? 'Edit Broker' : 'New Broker'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Broker Code *
                </label>
                <input
                  type="text"
                  name="brokerCode"
                  value={formData.brokerCode}
                  onChange={handleInputChange}
                  className={`w-full border rounded px-3 py-2 ${
                    formErrors.brokerCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., BRK-001"
                />
                {formErrors.brokerCode && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.brokerCode}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full border rounded px-3 py-2 ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Broker Pune"
                />
                {formErrors.name && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full border rounded px-3 py-2 ${
                    formErrors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Pune"
                />
                {formErrors.address && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.address}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Phone No *
                </label>
                <input
                  type="text"
                  name="phoneNo"
                  value={formData.phoneNo}
                  onChange={handleInputChange}
                  className={`w-full border rounded px-3 py-2 ${
                    formErrors.phoneNo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 9999999999"
                />
                {formErrors.phoneNo && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.phoneNo}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  PAN Card (Optional)
                </label>
                <input
                  type="text"
                  name="panCard"
                  value={formData.panCard}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="e.g., ABCDE1234F"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  TDS Percentage
                </label>
                <input
                  type="number"
                  name="tdsPercentage"
                  value={formData.tdsPercentage}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Company ID *
                </label>
                <input
                  type="number"
                  name="companyId"
                  value={formData.companyId}
                  onChange={handleInputChange}
                  className={`w-full border rounded px-3 py-2 ${
                    formErrors.companyId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1"
                />
                {formErrors.companyId && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.companyId}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Any additional notes"
                  rows="3"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-lg w-full max-w-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this broker? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
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