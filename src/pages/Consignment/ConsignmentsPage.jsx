import React, { useEffect, useState, useContext, useCallback } from "react";
import { SettingsContext } from "../../context/SettingsContext.jsx";

import {
  getConsignments,
  createConsignment,
  updateConsignment,
  deleteConsignment
} from "../../api/consignApi.js";

import { getCustomers } from "../../api/custApi.js";
import { getDestinations } from "../../api/destinationApi.js";

import MainLayout from "../../layout/Mainlayout.jsx";
import { Trash2, Edit, Plus, X, Search } from "lucide-react";

// Helper function to get YYYY-MM-DD from a date string
const getFormattedDate = (dateString) => {
    if (!dateString) return '';
    try {
        // Use substring to handle ISO format directly (e.g., "2024-12-10T...")
        return dateString.substring(0, 10);
    } catch {
        return '';
    }
};

// Define the initial state structure for clarity and reuse
const INITIAL_FORM_STATE = {
  cnNumber: "",
  date: new Date().toISOString().substring(0, 10), // FIX 1: Initialize date to today's YYYY-MM-DD
  consignorId: "",
  consigneeId: "",
  fromDestinationId: "",
  toDestinationId: "",
  packages: "",
  packageUom: "",
  contents: "",
  gstPayableAt: "",
  netWeight: "",
  grossWeight: "",
  chargeWeight: "",
  weightUom: "",
  rate: "",
  rateOn: "",
  freightCharges: "",
  vehicleNo: "",
  driverName: "",
  remarks: ""
};

export default function ConsignmentsPage() {
  const { selectedCompany, selectedFinancialYear } = useContext(SettingsContext);

  // Data
  const [consignments, setConsignments] = useState([]); // List of items displayed in the table

  const [customers, setCustomers] = useState([]); // Master data for dropdowns
  const [destinations, setDestinations] = useState([]); // Master data for dropdowns

  // UI
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});

  /* ---------------------------
     Load customers & destinations
     NOTE: This loads all necessary data structures for dropdowns
  ---------------------------- */
  useEffect(() => {
    if (!selectedCompany?.id) return;

    async function loadDropdowns() {
      try {
        // Assumes getCustomers returns an array of {id, name}
        const custData = await getCustomers(selectedCompany.id); 
        // Assumes getDestinations returns an array of {id, name}
        const destData = await getDestinations();

        setCustomers(custData || []);
        setDestinations(destData || []);
      } catch (err) {
        console.error("Dropdown load error:", err);
      }
    }

    loadDropdowns();
  }, [selectedCompany?.id]);

  /* ---------------------------
     Load consignments (search)
  ---------------------------- */
  const loadConsignments = useCallback(async () => {
    if (!selectedCompany?.id) {
      setConsignments([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // NOTE: Query filtering is handled by the API call now.
      const result = await getConsignments({
        query: searchQuery, 
        companyId: selectedCompany.id,
        financialYearId: selectedFinancialYear?.id,
      });

      // FIX: Store the fetched and filtered data directly. 
      // Removed redundant setFilteredConsignments.
      setConsignments(result || []); 
    } catch (err) {
      console.error(err);
      setError(err.message ?? "Failed to load consignments.");
    } finally {
      setLoading(false);
    }
  }, [selectedCompany?.id, selectedFinancialYear?.id, searchQuery]);

  useEffect(() => {
    loadConsignments();
  }, [loadConsignments]);

  /* ---------------------------
     Modal handling
  ---------------------------- */
  function openCreateModal() {
    if (!selectedCompany?.id) return alert("Select company first.");

    setIsEditing(false);
    setFormData(INITIAL_FORM_STATE);
    setFormErrors({});
    setShowModal(true);
  }

  function openEditModal(item) {
    setIsEditing(true);
    setEditingItem(item);
    
    // FIX 2: Sanitize incoming data, especially the date, for the form
    setFormData({ 
        ...INITIAL_FORM_STATE, // Use base state for safe defaults
        ...item, 
        date: getFormattedDate(item.date), // Ensure date is YYYY-MM-DD string
    });
    setFormErrors({});
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setIsEditing(false);
    setEditingItem(null);
  }

  /* ---------------------------
     Form Input Handler
  ---------------------------- */
  function handleInput(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  }

  function validate() {
    const err = {};

    if (!formData.cnNumber) err.cnNumber = "Required";
    if (!formData.date) err.date = "Required";
    if (!formData.consignorId) err.consignorId = "Required";
    if (!formData.consigneeId) err.consigneeId = "Required";

    // Add checks for other critical fields if needed (e.g., weightUom)

    setFormErrors(err);
    return Object.keys(err).length === 0;
  }

  // Helper for numeric/ID cleanup
  const sanitizePayload = (data) => {
    const numericFields = [
        "consignorId", "consigneeId", "fromDestinationId", "toDestinationId", 
        "packages", "netWeight", "grossWeight", "chargeWeight", 
        "rate", "freightCharges"
    ];

    const cleaned = { ...data };

    numericFields.forEach(field => {
        // FIX 3: Ensure IDs and numeric fields are converted to Number. If empty, send null.
        if (field.endsWith('Id')) {
            cleaned[field] = data[field] ? Number(data[field]) : null;
        } else {
            cleaned[field] = data[field] ? parseFloat(data[field]) : null;
        }
    });

    // Ensure branchId is sent as a number
    cleaned.branchId = 1; // Assuming '1' is the default branchId (must be a number)
    
    // Ensure date is a Date object or string as required by the backend DTO
    // Assuming backend DTO uses @Type(() => Date), we send the string as is.
    // If backend requires Date object: cleaned.date = new Date(data.date);
    
    return cleaned;
  };

  /* ---------------------------
     Submit Form
  ---------------------------- */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const payload = sanitizePayload({
      ...formData,
      companyId: selectedCompany.id,
    });
    
    // Check for critical missing IDs after sanitization
    if (!payload.consignorId || !payload.consigneeId) {
        return alert("Consignor and Consignee must be selected.");
    }


    setActionLoading(true);

    try {
      let result;

      if (isEditing) {
        result = await updateConsignment(editingItem.id, payload);
        // Update local list with the new result
        setConsignments(prev =>
          prev.map(c => (c.id === editingItem.id ? result : c))
        );
      } else {
        result = await createConsignment(payload);
        // Add new item to the start of the local list
        setConsignments(prev => [result, ...prev]);
      }

      closeModal();
      // Optional: Refetch entire list if filtering/sorting is complex
      // loadConsignments();
      
    } catch (err) {
      alert(err.message || "Failed to save consignment.");
    } finally {
      setActionLoading(false);
    }
  }

  /* ---------------------------
     Delete
  ---------------------------- */
  async function handleDelete(id) {
    setActionLoading(true);
    try {
      await deleteConsignment(id);
      // Filter list directly
      setConsignments(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete consignment.");
    } finally {
      setDeleteConfirm(null);
      setActionLoading(false);
    }
  }
  
  // Helper to find name from ID for table display
  const getCustomerName = (id) => customers.find(c => c.id == id)?.name || 'N/A';
  
  /* ---------------------------
     RENDER UI
  ---------------------------- */
  return (
    <MainLayout>
      <div className="p-6">

        {/* HEADER */}
        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-semibold">
            Consignments ({selectedCompany?.name ?? "No company"})
          </h1>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            <Plus size={20} /> New Consignment
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="mb-4 max-w-sm">
          <div className="flex items-center border rounded-lg px-3 py-2 bg-white">
            <Search size={18} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search CN Number..."
              value={searchQuery}
              // This relies on the useEffect/loadConsignments to debounce/filter
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full outline-none"
            />
          </div>
        </div>
        
        {loading && <div className="text-center py-8">Loading consignments...</div>}
        {error && <div className="text-red-600 text-center py-4">{error}</div>}


        {/* TABLE */}
        {!loading && consignments.length > 0 && (
          <div className="overflow-x-auto bg-white border rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-100 text-sm">
                <tr>
                  <th className="p-3 border">CN No</th>
                  <th className="p-3 border">Date</th>
                  <th className="p-3 border">Consignor</th>
                  <th className="p-3 border">Consignee</th>
                  <th className="p-3 border">Packages</th>
                  <th className="p-3 border text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {consignments.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="border p-3">{c.cnNumber}</td>
                    {/* FIX 4: Display date cleanly, ensuring it's not a full timestamp */}
                    <td className="border p-3">{getFormattedDate(c.date)}</td> 
                    {/* FIX 5: Display names instead of IDs */}
                    <td className="border p-3">{getCustomerName(c.consignorId)}</td> 
                    <td className="border p-3">{getCustomerName(c.consigneeId)}</td>
                    <td className="border p-3">{c.packages}</td>

                    <td className="border p-3 text-center">
                      <button
                        className="text-blue-600 mr-3"
                        onClick={() => openEditModal(c)}
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        className="text-red-600"
                        onClick={() => setDeleteConfirm(c.id)}
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

        {!loading && consignments.length === 0 && !error && (
          <div className="text-gray-500 text-center py-8">
            No consignments found.
          </div>
        )}
      </div>

      {/* ---------------- MODAL (CREATE / EDIT) ---------------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl rounded-lg shadow p-6 max-h-[85vh] overflow-y-auto">

            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {isEditing ? "Edit Consignment" : "New Consignment"}
              </h2>
              <button onClick={closeModal}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* CN Number */}
              <div>
                <label>CN Number *</label>
                <input
                  name="cnNumber"
                  value={formData.cnNumber}
                  onChange={handleInput}
                  className="border px-3 py-2 w-full rounded"
                />
                {formErrors.cnNumber && (
                  <p className="text-red-600 text-sm">{formErrors.cnNumber}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label>Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInput}
                  className="border px-3 py-2 w-full rounded"
                />
              </div>

              {/* Consignor / Consignee */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>Consignor *</label>
                  <select
                    name="consignorId"
                    value={formData.consignorId}
                    onChange={handleInput}
                    className="border px-3 py-2 w-full rounded"
                  >
                    <option value="">Select consignor</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Consignee *</label>
                  <select
                    name="consigneeId"
                    value={formData.consigneeId}
                    onChange={handleInput}
                    className="border px-3 py-2 w-full rounded"
                  >
                    <option value="">Select consignee</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* From / To Destination */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>From Destination *</label>
                  <select
                    name="fromDestinationId"
                    value={formData.fromDestinationId}
                    onChange={handleInput}
                    className="border px-3 py-2 w-full rounded"
                  >
                    <option value="">Select destination</option>
                    {destinations.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>To Destination *</label>
                  <select
                    name="toDestinationId"
                    value={formData.toDestinationId}
                    onChange={handleInput}
                    className="border px-3 py-2 w-full rounded"
                  >
                    <option value="">Select destination</option>
                    {destinations.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Packages */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>Packages</label>
                  <input
                    name="packages"
                    value={formData.packages || ""}
                    onChange={handleInput}
                    type="number"
                    className="border px-3 py-2 w-full rounded"
                  />
                </div>

                <div>
                  <label>Package UOM</label>
                  <input
                    name="packageUom"
                    value={formData.packageUom || ""}
                    onChange={handleInput}
                    className="border px-3 py-2 w-full rounded"
                  />
                </div>
              </div>

              {/* Contents */}
              <div>
                <label>Contents</label>
                <textarea
                  name="contents"
                  value={formData.contents}
                  onChange={handleInput}
                  className="border px-3 py-2 w-full rounded"
                ></textarea>
              </div>

              {/* Weights */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label>Net Weight</label>
                  <input
                    name="netWeight"
                    value={formData.netWeight || ""}
                    onChange={handleInput}
                    type="number"
                    step="0.01"
                    className="border px-3 py-2 w-full rounded"
                  />
                </div>
                <div>
                  <label>Gross Weight</label>
                  <input
                    name="grossWeight"
                    value={formData.grossWeight || ""}
                    onChange={handleInput}
                    type="number"
                    step="0.01"
                    className="border px-3 py-2 w-full rounded"
                  />
                </div>
                <div>
                  <label>Charge Weight</label>
                  <input
                    name="chargeWeight"
                    value={formData.chargeWeight || ""}
                    onChange={handleInput}
                    type="number"
                    step="0.01"
                    className="border px-3 py-2 w-full rounded"
                  />
                </div>
              </div>

              {/* Weight UOM */}
              <div>
                <label>Weight UOM *</label>
                <input
                  name="weightUom"
                  value={formData.weightUom || ""}
                  onChange={handleInput}
                  className="border px-3 py-2 w-full rounded"
                />
              </div>

              {/* Rate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>Rate</label>
                  <input
                    name="rate"
                    value={formData.rate || ""}
                    onChange={handleInput}
                    type="number"
                    step="0.01"
                    className="border px-3 py-2 w-full rounded"
                  />
                </div>
                <div>
                  <label>Rate On</label>
                  <input
                    name="rateOn"
                    value={formData.rateOn || ""}
                    onChange={handleInput}
                    className="border px-3 py-2 w-full rounded"
                  />
                </div>
              </div>

              {/* Freight */}
              <div>
                <label>Freight Charges</label>
                <input
                  name="freightCharges"
                  value={formData.freightCharges || ""}
                  onChange={handleInput}
                  type="number"
                  step="0.01"
                  className="border px-3 py-2 w-full rounded"
                />
              </div>

              {/* Vehicle */}
              <div>
                <label>Vehicle No</label>
                <input
                  name="vehicleNo"
                  value={formData.vehicleNo || ""}
                  onChange={handleInput}
                  className="border px-3 py-2 w-full rounded"
                />
              </div>

              {/* Driver */}
              <div>
                <label>Driver Name</label>
                <input
                  name="driverName"
                  value={formData.driverName || ""}
                  onChange={handleInput}
                  className="border px-3 py-2 w-full rounded"
                />
              </div>

              {/* Remarks */}
              <div>
                <label>Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks || ""}
                  onChange={handleInput}
                  className="border px-3 py-2 w-full rounded"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  {actionLoading
                    ? "Saving..."
                    : isEditing
                    ? "Update"
                    : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- DELETE CONFIRMATION ---------------- */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p>This action cannot be undone.</p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </MainLayout>
  );
}