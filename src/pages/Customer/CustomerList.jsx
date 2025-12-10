import { useState, useEffect, useCallback } from "react"; // Added useEffect and useCallback
import CustomerForm from "./CustomerForm.jsx";
// Import the necessary API functions
import { getCustomers, deleteCustomer, updateCustomer, createCustomer } from "../../api/custApi.js"; 

const ITEMS_PER_PAGE = 10;

// Refactored to remove 'customers' and 'loading' props
// Also removed 'deleteCustomer' as it will be imported and used locally
const CustomerList = () => { 
  // State for data management
  const [customers, setCustomers] = useState([]); // New state for customer data
  const [loading, setLoading] = useState(true);   // New state for loading status
  const [error, setError] = useState(null);       // New state for error handling

  // Existing states
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editId, setEditId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [hoveredCustomerId, setHoveredCustomerId] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  // 1. Data Fetching Function (made portable/reusable)
  const fetchCustomers = useCallback(async (companyId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomers(companyId); // Assuming getCustomers takes an optional companyId
      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setError("Failed to load customer list.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. useEffect to Fetch Data on Mount
  useEffect(() => {
    // NOTE: If your list depends on selectedCompany/Branch from context, 
    // you would need to use useContext here and pass the ID to fetchCustomers.
    fetchCustomers(); 
  }, [fetchCustomers]);

  // Data Filtering and Pagination (Unchanged)
  const filtered = customers.filter(
    c =>
      c.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      c.companyCode?.toLowerCase().includes(search.toLowerCase()) ||
      c.billName?.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCustomers = filtered.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearch = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // 3. Handle Delete (Using imported function and local refresh)
  const handleDeleteConfirm = async () => {
    if (deleteConfirm) {
      try {
        await deleteCustomer(deleteConfirm.id); // Use the imported delete function
        setDeleteConfirm(null);
        // Refresh the list after successful deletion
        fetchCustomers(); 
      } catch (err) {
        // Handle error and show a message
        setError("Failed to delete customer.");
      }
    }
  };

  // Remaining Handlers (Unchanged)
  const handleRowHover = (e, customerId) => {
    setHoveredCustomerId(customerId);
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPosition({
      x: rect.left,
      y: rect.top
    });
  };

  const handleRowLeave = () => {
    setHoveredCustomerId(null);
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }
  
  if (error && !loading && customers.length === 0) {
      return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  // NOTE: The CustomerForm MUST now be passed the API functions
  if (editId) {
    return (
        <CustomerForm 
            customerId={editId} 
            onClose={() => setEditId(null)} 
            // Pass the imported API functions and the fetchCustomers callback for refresh
            createCustomer={createCustomer} 
            updateCustomer={updateCustomer} 
            fetchCustomers={fetchCustomers}
        />
    );
  }

  return (
    <>
      <div>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by company name, code, or bill name..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Company Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bill Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedCustomers.map(customer => (
                <tr 
                  key={customer.id} 
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onMouseEnter={(e) => handleRowHover(e, customer.id)}
                  onMouseLeave={handleRowLeave}
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{customer.companyCode}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.companyName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.billName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{customer.phone || "-"}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        onClick={() => setEditId(customer.companyCode)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium text-sm inline-flex items-center gap-2 transition"
                        title="Edit customer"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(customer)}
                        className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 font-medium text-sm inline-flex items-center gap-2 transition"
                        title="Delete customer"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-500">No customers found</div>
          )}
        </div>

        {/* Pagination Controls (Unchanged) */}
        {filtered.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 text-sm disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Previous page"
            >
              ❮
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 3) {
                  page = i + 1;
                } else if (currentPage <= 2) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 1) {
                  page = totalPages - 2 + i;
                } else {
                  page = currentPage - 1 + i;
                }
                return page;
              }).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-2 py-1 rounded-full font-medium text-xs transition ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-sm disabled:opacity-30 disabled:cursor-not-allowed transition"
              title="Next page"
            >
              ❯
            </button>
          </div>
        )}
      </div>

      {/* Customer Details Hover Popup (Unchanged, uses local customers state) */}
      {hoveredCustomerId && (
        <div className="fixed z-40 pointer-events-none" style={{
          left: `${hoverPosition.x}px`,
          top: `${hoverPosition.y - 10}px`,
          transform: 'translateY(-100%)'
        }}>
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 mb-2 w-96 pointer-events-auto">
            {(() => {
              const customer = customers.find(c => c.id === hoveredCustomerId);
              if (!customer) return null;
              return (
                <div className="space-y-3">
                  <div className="border-b border-gray-200 pb-3 mb-3">
                    <h3 className="font-bold text-gray-900 text-lg">{customer.companyName}</h3>
                    <p className="text-xs text-gray-500">{customer.companyCode}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">Bill Name</p>
                      <p className="text-sm text-gray-900">{customer.billName || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">Phone</p>
                      <p className="text-sm text-gray-900">{customer.phone || "-"}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">Debit</p>
                      <p className="text-sm text-gray-900">{customer.debit || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">Credit</p>
                      <p className="text-sm text-gray-900">{customer.credit || "-"}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">Credit Days</p>
                      <p className="text-sm text-gray-900">{customer.creditDays || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase">Interest Rate</p>
                      <p className="text-sm text-gray-900">{customer.interestRate || "-"}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase">Address 1</p>
                        <p className="text-sm text-gray-900">{customer.address1 || "-"}</p>
                      </div>
                      {customer.address2 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">Address 2</p>
                          <p className="text-sm text-gray-900">{customer.address2}</p>
                        </div>
                      )}
                      {customer.address3 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase">Address 3</p>
                          <p className="text-sm text-gray-900">{customer.address3}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Edit Modal (Updated to pass API functions) */}
      {editId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Edit Customer</h2>
              <button
                onClick={() => setEditId(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <CustomerForm 
                customerId={editId} 
                onClose={() => setEditId(null)} 
                createCustomer={createCustomer} // Imported
                updateCustomer={updateCustomer} // Imported
                fetchCustomers={fetchCustomers} // Local refresh callback
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Unchanged) */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Customer?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.companyName}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerList;