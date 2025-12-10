import { useState, useContext, useEffect } from "react";
import { SettingsContext } from "../../context/SettingsContext.jsx";
//    return <CustomerForm customerId={editId} onClose={() => setEditId(null)} />;
import { getCustomerById } from "../../api/custApi.js";
const CustomerForm = ({ customerId, onClose, createCustomer, updateCustomer, customers, fetchCustomers }) => {
  const { selectedCompany, selectedBranch } = useContext(SettingsContext);
  const [form, setForm] = useState({ 
    companyCode: "",
    companyName: "",
    billName: "",
    address1: "",
    address2: "",
    address3: "",
    phone: "",
    debit: "",
    credit: "",
    creditDays: "",
    interestRate: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCustomerData = async (id) => {
    try {
      setLoading(true); // Indicate that data loading is happening
      console.log("Fetching customer data for ID:", id);
      const customer = await getCustomerById(id); // Use the API function
      setForm(customer);
    } catch (err) {
      setError("Failed to fetch customer data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (customerId) {
      fetchCustomerData(customerId);
    }     // you might want to reset the form here.
  }, [customerId]); // Dependency on customerId is sufficient

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

      const dataToSend = {
        companyCode: form.companyCode,
        companyName: form.companyName,
        billName: form.billName,
        address1: form.address1 || null,
        address2: form.address2 || null,
        address3: form.address3 || null,
        phone: form.phone || null,
        debit: form.debit ? parseFloat(form.debit) : null,
        credit: form.credit ? parseFloat(form.credit) : null,
        creditDays: form.creditDays ? parseInt(form.creditDays, 10) : null,
        interestRate: form.interestRate ? parseFloat(form.interestRate) : null,
        companyId: companyIdNum,
        branchId: selectedBranch?.id || null,
      };
      if (customerId) {
        await updateCustomer(customerId, dataToSend);
      } else {
        const newCustomer = await createCustomer(dataToSend);
        await fetchCustomers(companyIdNum);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company Code</label>
        <input
          type="text"
          required
          value={form.companyCode}
          onChange={e => setForm({ ...form, companyCode: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
        <input
          type="text"
          required
          value={form.companyName}
          onChange={e => setForm({ ...form, companyName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bill Name</label>
        <input
          type="text"
          required
          value={form.billName}
          onChange={e => setForm({ ...form, billName: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
        <input
          type="text"
          value={form.address1}
          onChange={e => setForm({ ...form, address1: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
        <input
          type="text"
          value={form.address2}
          onChange={e => setForm({ ...form, address2: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 3</label>
        <input
          type="text"
          value={form.address3}
          onChange={e => setForm({ ...form, address3: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          type="tel"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Debit</label>
        <input
          type="number"
          value={form.debit}
          onChange={e => setForm({ ...form, debit: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Credit</label>
        <input
          type="number"
          value={form.credit}
          onChange={e => setForm({ ...form, credit: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Credit Days</label>
        <input
          type="number"
          value={form.creditDays}
          onChange={e => setForm({ ...form, creditDays: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate</label>
        <input
          type="number"
          value={form.interestRate}
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