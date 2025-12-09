import MainLayout from "../../../layout/Mainlayout.jsx";
import { useContext, useEffect, useState } from "react";
import { SettingsContext } from "../../../context/SettingsContext.jsx";
import { getLorryHires, deleteLorryHire } from "../../../api/lorryHireApi";
import { useNavigate } from "react-router-dom";

export default function LorryHireList() {
  const navigate = useNavigate();
  const { selectedCompany, selectedBranch, selectedFinancialYear } =
    useContext(SettingsContext);

  const [challans, setChallans] = useState([]);

  const [filterSearch, setFilterSearch] = useState(""); // only challan number search

  // Load challans whenever company/branch/year changes
  useEffect(() => {
    if (!selectedCompany || !selectedBranch || !selectedFinancialYear) return;
    loadChallans();
  }, [selectedCompany, selectedBranch, selectedFinancialYear]);

  // Load challans when search filter changes
  useEffect(() => {
    loadChallans();
  }, [filterSearch]);

  // Load from backend
  const loadChallans = async () => {
    const data = await getLorryHires({
      companyId: selectedCompany?.id,
      branchId: selectedBranch?.id,
      financialYearId: selectedFinancialYear?.id,
      challanNumber: filterSearch || undefined,
    });

    setChallans(data);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this challan?")) return;
    await deleteLorryHire(id);
    loadChallans();
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Lorry Hire Challans</h1>

          <button
            onClick={() => navigate("/lorry-hire/create")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Create Challan
          </button>
        </div>

        {/* Only Search Filter */}
        <div className="flex gap-4 mb-4">
          <input
            placeholder="Search challan number"
            className="border p-2 w-64"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Challan No</th>
              <th className="border p-2">Vehicle</th>
              <th className="border p-2">Owner</th>
              <th className="border p-2">Broker</th>
              <th className="border p-2">Destination</th>
              <th className="border p-2">Lorry Hire</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {challans.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="border p-2">{c.challanNumber}</td>
                <td className="border p-2">{c.vehicleNo}</td>
                <td className="border p-2">{c.lorryOwner?.name}</td>
                <td className="border p-2">{c.broker?.name || "-"}</td>
                <td className="border p-2">{c.destination?.name}</td>
                <td className="border p-2">{c.lorryHire}</td>

                <td className="border p-2 flex gap-3">
                  <button
                    className="hover:underline"
                    onClick={() => navigate(`/lorry-hire/edit/${c.id}`)}
                  >
                    Edit
                  </button>

                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(c.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {challans.length === 0 && (
          <div className="text-gray-600 mt-4">No challans found.</div>
        )}
      </div>
    </MainLayout>
  );
}
