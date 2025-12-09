import { useState, useContext } from "react";
import { SettingsContext } from "../../context/SettingsContext.jsx";

const GroupForm = ({ onClose, createGroup }) => {
  const { selectedCompany } = useContext(SettingsContext);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createGroup({ name, companyId: selectedCompany?.id });
      onClose();
    } catch (err) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., VIP Customers"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
        >
          {loading ? "Creating..." : "Create"}
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

export default GroupForm;