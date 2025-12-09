import { useState, useContext } from "react";
import { CustomerContext } from "../../context/CustomerContext.jsx";
import GroupCustomersModal from "./GroupCustomersModal.jsx";

const GroupList = () => {
  const { groups, loading, deleteGroup } = useContext(CustomerContext);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);

  const filtered = groups.filter(g =>
    g.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search groups..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(group => (
          <div key={group.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition bg-white">
            <h3 className="font-semibold text-gray-900 mb-4">{group.name}</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedGroup(group.id)}
                className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition"
              >
                Manage Customers
              </button>
              <button
                onClick={() => deleteGroup(group.id)}
                className="w-full px-3 py-2 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 font-medium transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8 text-gray-500">No groups found</div>
      )}

      {selectedGroup && (
        <GroupCustomersModal
          groupId={selectedGroup}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </div>
  );
};

export default GroupList;