import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user } = useContext(AuthContext);

  const companies = ["KTPL", "MLPL"];
  const branches = ["Mumbai", "Pune", "Hyderabad"];
  const financialYears = ["2024-2025", "2025-2026"];

  const today = new Date().toLocaleDateString();

  return (
    <div className="w-full bg-white shadow-md px-6 py-4 flex items-center justify-between">
      {/* Left side selectors */}
      <div className="flex items-center gap-6">

        {/* Company */}
        <select className="border rounded-md px-3 py-2">
          {companies.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        {/* Branch */}
        <select className="border rounded-md px-3 py-2">
          {branches.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>

        {/* Financial Year */}
        <select className="border rounded-md px-3 py-2">
          {financialYears.map((fy) => (
            <option key={fy}>{fy}</option>
          ))}
        </select>

        {/* Current Date */}
        <span className="text-gray-600 font-medium">
          {today}
        </span>
      </div>

      {/* Right side: username */}
      <div className="flex items-center gap-4">
        <span className="font-semibold text-gray-700">
          {user?.username || "User"}
        </span>
      </div>
    </div>
  );
}
