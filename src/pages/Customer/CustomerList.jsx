import { useState, useContext } from "react";
import { CustomerContext } from "../../context/CustomerContext.jsx";
import CustomerForm from "./CustomerForm.jsx";

const CustomerList = () => {
  const { customers, loading, deleteCustomer } = useContext(CustomerContext);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [hoveredCustomerId, setHoveredCustomerId] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  const filtered = customers.filter(
    c =>
      c.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      c.companyCode?.toLowerCase().includes(search.toLowerCase()) ||
      c.billName?.toLowerCase().includes(search.toLowerCase())
  );

  if (editId) {
    return <CustomerForm customerId={editId} onClose={() => setEditId(null)} />;
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  const handleDeleteConfirm = async () => {
    if (deleteConfirm) {
      try {
        await deleteCustomer(deleteConfirm.id);
        setDeleteConfirm(null);
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

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

  return (
    <>
      <div>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by company name, code, or bill name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
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
              {filtered.map(customer => (
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
                        onClick={() => setEditId(customer.id)}
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
      </div>

      {/* Customer Details Hover Popup */}
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

      {/* Edit Modal */}
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
              <CustomerForm customerId={editId} onClose={() => setEditId(null)} />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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