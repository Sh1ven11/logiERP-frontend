import { useState, useContext, useEffect } from "react";
import { SettingsContext } from "../../context/SettingsContext.jsx";
// Import all necessary API functions
import { getCustomerById, updateCustomer, createCustomer } from "../../api/custApi.js"; 

// Define the initial state structure (companyCode removed)
const INITIAL_FORM_STATE = {
  companyName: "", // Starts here
  billName: "",
  address1: "",
  address2: "",
  address3: "",
  phone: "",
  debit: "",
  credit: "",
  creditDays: "",
  interestRate: ""
};

// customerId prop is the unique companyCode when in Edit mode
const CustomerForm = ({ customerId, onClose, fetchCustomers }) => {
  const { selectedCompany, selectedBranch } = useContext(SettingsContext);
  
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // NEW STATE: Store the numeric database ID required for the update API call
  const [dbId, setDbId] = useState(null); 

  // fetchCustomerData now expects the unique companyCode
  const fetchCustomerData = async (companyCode) => {
    try {
      setLoading(true);
      setError("");
      
      const customer = await getCustomerById(companyCode); 
      
      setDbId(customer.id); 
      
      // Sanitize the incoming data: Note that companyCode will be ignored/not set in form state
      const sanitizedCustomer = {};
      for (const key in INITIAL_FORM_STATE) {
          sanitizedCustomer[key] = customer[key] ?? ""; 
      }
      
      setForm(prevForm => ({
        ...prevForm,
        ...sanitizedCustomer 
      }));

    } catch (err) {
      setError("Failed to fetch customer data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // useEffect handles fetching data OR resetting the form
  useEffect(() => {
    if (customerId) {
      fetchCustomerData(customerId);
    } else {
      setForm(INITIAL_FORM_STATE);
      setDbId(null);
      setError("");
    }
  }, [customerId]); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!selectedCompany?.id) {
        setError("Company not selected. Please select a company first.");
        setLoading(false);
        return;
      }

      const companyIdNum = typeof selectedCompany.id === 'string' 
        ? parseInt(selectedCompany.id, 10) 
        : selectedCompany.id;

      if (isNaN(companyIdNum)) {
        setError("Invalid company ID");
        setLoading(false);
        return;
      }

      // FINAL PAYLOAD: CompanyCode is omitted entirely, relied upon the backend to generate it.
      const dataToSend = {
        companyName: form.companyName,
        billName: form.billName,
        address1: form.address1 || null,
        address2: form.address2 || null,
        address3: form.address3 || null,
        phone: form.phone || null,
        // Convert empty string "" to null for API if field is numeric
        debit: form.debit ? parseFloat(form.debit) : 0,
        credit: form.credit ? parseFloat(form.credit) : 0,
        creditDays: form.creditDays ? parseInt(form.creditDays, 10) : 0,
        interestRate: form.interestRate ? parseFloat(form.interestRate) : 0,
        companyId: companyIdNum,
        branchId: selectedBranch?.id || null,
      };

      // Use imported functions directly
      if (customerId) {
        // Update: sends dataToSend (no companyCode, uses dbId)
        if (!dbId) throw new Error("Database ID missing for update.");
        await updateCustomer(dbId, dataToSend); 
      } else {
        // Create: sends dataToSend (no companyCode, backend generates it)
        await createCustomer(dataToSend); 
        await fetchCustomers(companyIdNum);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save customer");
    } finally {
      setLoading(false);
    }
  };

  const getInputValue = (key) => form[key] ?? ""; 

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      {/* COMPANY CODE INPUT REMOVED: 
        If needed for display in Edit mode, you must handle the display logic here
        (e.g., using a disabled input or a simple <div> based on customer.companyCode 
        retrieved during fetchCustomerData, though it is not stored in 'form' state).
      */}

      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
        <input
          type="text"
          required
          value={getInputValue('companyName')}
          onChange={e => setForm({ ...form, companyName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Bill Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bill Name</label>
        <input
          type="text"
          required
          value={getInputValue('billName')}
          onChange={e => setForm({ ...form, billName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Address Line 1 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
        <input
          type="text"
          value={getInputValue('address1')}
          onChange={e => setForm({ ...form, address1: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Address Line 2 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
        <input
          type="text"
          value={getInputValue('address2')}
          onChange={e => setForm({ ...form, address2: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Address Line 3 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 3</label>
        <input
          type="text"
          value={getInputValue('address3')}
          onChange={e => setForm({ ...form, address3: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          type="tel"
          value={getInputValue('phone')}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Debit (Numeric) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Debit</label>
        <input
          type="number"
          value={getInputValue('debit')}
          onChange={e => setForm({ ...form, debit: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Credit (Numeric) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Credit</label>
        <input
          type="number"
          value={getInputValue('credit')}
          onChange={e => setForm({ ...form, credit: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Credit Days (Numeric) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Credit Days</label>
        <input
          type="number"
          value={getInputValue('creditDays')}
          onChange={e => setForm({ ...form, creditDays: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Interest Rate (Numeric) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate</label>
        <input
          type="number"
          value={getInputValue('interestRate')}
          onChange={e => setForm({ ...form, interestRate: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {loading ? "Saving..." : customerId ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;