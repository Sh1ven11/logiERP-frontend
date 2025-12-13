import React, { useEffect, useState, useContext } from "react";
import { SettingsContext } from "../../context/SettingsContext.jsx";
import { getConsignments, deleteConsignment } from "../../api/consignApi.js";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layout/Mainlayout.jsx";
import { Plus, Edit, Trash2, Search } from "lucide-react";

export default function ConsignmentsList() {
  const { selectedCompany, selectedFinancialYear } = useContext(SettingsContext);
  const navigate = useNavigate();

  const [consignments, setConsignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

  async function load() {
    if (!selectedCompany?.id) return;

    setLoading(true);
    try {
      const result = await getConsignments({
        cnNumber: searchQuery,
        companyId: selectedCompany.id,
        financialYearId: selectedFinancialYear?.id
      });

      setConsignments(result || []);
    } catch (err) {
      setError("Failed to load consignments");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [searchQuery, selectedCompany?.id]);

  async function handleDelete(id) {
    if (!window.confirm("Are you sure?")) return;

    try {
      await deleteConsignment(id);
      setConsignments(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-semibold">
            Consignments ({selectedCompany?.name ?? "No company"})
          </h1>

          <button
            onClick={() => navigate("/consignments/new")}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            <Plus size={20} /> New Consignment
          </button>
        </div>

        {/* Search */}
        <div className="mb-4 max-w-sm">
          <div className="flex items-center border rounded-lg px-3 py-2 bg-white">
            <Search size={18} className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search CN Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full outline-none"
            />
          </div>
        </div>

        {loading && <div className="text-center py-8">Loading...</div>}
        {error && <div className="text-red-600 text-center py-4">{error}</div>}

        {!loading && consignments.length > 0 && (
          <div className="overflow-x-auto bg-white border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
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
                {consignments.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="border p-3">{c.cnNumber}</td>
                    <td className="border p-3">{new Date(c.date).toISOString().slice(0, 10)}</td>
                    <td className="border p-3">{c.consignor?.companyName}</td>
                    <td className="border p-3">{c.consignee?.companyName}</td>
                    <td className="border p-3">{c.packages}</td>

                    <td className="border p-3 text-center">
                      <button
                        className="text-blue-600 mr-3"
                        onClick={() => navigate(`/consignments/${c.id}/edit`)}
                      >
                        <Edit size={18} />
                      </button>
                      <button className="text-red-600" onClick={() => handleDelete(c.id)}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

        {!loading && consignments.length === 0 && (
          <div className="text-center text-gray-600 py-8">No consignments found.</div>
        )}
      </div>
    </MainLayout>
  );
}
