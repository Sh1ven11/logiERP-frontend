import { useState, useEffect } from "react";

const GroupCustomersModal = ({ groupId, onClose, customers, addCustomersToGroup }) => {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const inGroup = customers.filter(c => c.groupId === groupId).map(c => c.id);
    setSelected(inGroup);
  }, [groupId, customers]);

  const filtered = customers.filter(c =>
    c.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    c.companyCode?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selected.length === filtered.length && filtered.length > 0) {
      // Deselect all filtered
      setSelected(prev => prev.filter(id => !filtered.find(f => f.id === id)));
    } else {
      // Select all filtered
      const filteredIds = filtered.map(f => f.id);
      setSelected(prev => {
        const newSelected = new Set(prev);
        filteredIds.forEach(id => newSelected.add(id));
        return Array.from(newSelected);
      });
    }
  };

  const handleClearAll = () => {
    setSelected([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addCustomersToGroup(groupId, selected);
      onClose();
    } catch (err) {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  const isAllFiltered = filtered.length > 0 && filtered.every(f => selected.includes(f.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Manage Customers</h2>
          <button
            onClick={onClose}
            className="text-white bg-red-600 hover:bg-red-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Search Box */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by customer name or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Selection Controls */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">
                {selected.length} selected
              </span>
              <span className="text-xs text-gray-500">
                ({filtered.length} results)
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className={`px-3 py-1 text-sm rounded font-medium transition ${
                  isAllFiltered
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {isAllFiltered ? "Deselect All" : "Select All"}
              </button>
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3 py-1 text-sm rounded font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Customer List */}
          <div className="mb-6 max-h-96 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-200">
            {filtered.length > 0 ? (
              filtered.map(customer => (
                <label
                  key={customer.id}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(customer.id)}
                    onChange={() => setSelected(prev =>
                      prev.includes(customer.id)
                        ? prev.filter(id => id !== customer.id)
                        : [...prev, customer.id]
                    )}
                    className="mr-3 w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{customer.companyName}</p>
                    <p className="text-xs text-gray-500">{customer.companyCode}</p>
                  </div>
                  {customer.phone && (
                    <p className="text-xs text-gray-400 ml-2">{customer.phone}</p>
                  )}
                </label>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500">
                  {search ? "No customers match your search" : "No customers available"}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm transition"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm transition"
            >
              {loading ? "Saving..." : `Save (${selected.length} selected)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupCustomersModal;