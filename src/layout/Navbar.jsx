import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { SettingsContext } from "../context/SettingsContext.jsx";

export default function Navbar() {
  const { user } = useContext(AuthContext);
  const {
    companies,
    branches,
    financialYears,
    selectedCompany,
    selectedBranch,
    selectedFinancialYear,
    setSelectedCompany,
    setSelectedBranch,
    setSelectedFinancialYear,
  } = useContext(SettingsContext);

  const today = new Date().toLocaleDateString();

  return (
    <div className="w-full bg-white shadow-md px-6 py-4 flex items-center justify-between">
      {/* Left group */}
      <div className="flex items-center gap-4">

        {/* Company dropdown */}
        <select
          className="border px-3 py-2 rounded-md"
          value={selectedCompany?.id || ""}
          onChange={(e) => {
            const company = companies.find(c => c.id === Number(e.target.value));
            setSelectedCompany(company);
          }}
        >
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Branch dropdown */}
        <select
          className="border px-3 py-2 rounded-md"
          value={selectedBranch?.id || ""}
          onChange={(e) => {
            const branch = branches.find(b => b.id === Number(e.target.value));
            setSelectedBranch(branch);
          }}
        >
          {branches.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        {/* Financial Year */}
        <select
          className="border px-3 py-2 rounded-md"
          value={selectedFinancialYear?.id || ""}
          onChange={(e) => {
            const fy = financialYears.find(f => f.id === Number(e.target.value));
            setSelectedFinancialYear(fy);
          }}
        >
          {financialYears.map(fy => (
            <option key={fy.id} value={fy.id}>{fy.yearLabel}</option>
          ))}
        </select>

        {/* Date */}
        <span className="text-gray-700">{today}</span>
      </div>

      {/* Username */}
      <div className="font-semibold text-gray-700">
        {user?.username}
      </div>
    </div>
  );
}
