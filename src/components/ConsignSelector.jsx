import { useState, useRef, useEffect, useContext } from "react";
import { SettingsContext } from "../context/SettingsContext.jsx";
import axiosClient from "../api/authApi.js";

export default function ConsignmentSelector({ value, onChange, onTotalsChange }) {
  const { selectedCompany, selectedFinancialYear } = useContext(SettingsContext);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  const [totals, setTotals] = useState({ totalPkgs: 0, totalWt: 0 });

  const wrapperRef = useRef(null);

  // -----------------------------
  // SEARCH (Debounced)
  // -----------------------------
  useEffect(() => {
    if (!query || query.length < 1) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      const res = await axiosClient.get("/consignments/search", {
        params: {
          query,
          companyId: selectedCompany?.id,
          financialYearId: selectedFinancialYear?.id,
        },
      });

      setResults(res.data || []);
      setOpen(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, selectedCompany, selectedFinancialYear]);

  // -----------------------------
  // OUTSIDE CLICK
  // -----------------------------
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // -----------------------------
  // ADD CONSIGNMENT
  // Normalize incoming structure
  // -----------------------------
  const addCN = (raw) => {
    // Convert search result into backend structure
    const cn = raw.consignment
      ? raw
      : {
          id: raw.id,
          consignment: {
            cnNumber: raw.cnNumber,
            packages: raw.packages,
            netWeight: raw.chargeWeight,
            packageUom: raw.packageUom || "-",
            rateOn: raw.rateOn || "-",
            fromDestination: raw.fromDestination || {},
            toDestination: raw.toDestination || {},
          },
        };

    if (!value.some((v) => v.id === cn.id)) {
      onChange([...value, cn]);
    }

    setQuery("");
    setOpen(false);
  };

  // -----------------------------
  // REMOVE CONSIGNMENT
  // -----------------------------
  const removeCN = (id) => {
    onChange(value.filter((c) => c.id !== id));
  };

  // -----------------------------
  // AUTO CALCULATE TOTALS
  // -----------------------------
  useEffect(() => {
    if (!value || value.length === 0) {
      setTotals({ totalPkgs: 0, totalWt: 0 });
      onTotalsChange?.({ totalPkgs: 0, totalWt: 0 });
      return;
    }

    const totalPkgs = value.reduce((sum, c) => sum + (c.consignment.packages || 0), 0);
    const totalWt = value.reduce((sum, c) => sum + (c.consignment.netWeight || 0), 0);

    setTotals({ totalPkgs, totalWt });
    onTotalsChange?.({ totalPkgs, totalWt });
  }, [value]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <label className="text-sm font-medium">Add Consignments</label>

      {/* SEARCH BOX */}
      <input
        className="border p-2 w-full mt-1"
        placeholder="Search consignment number..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => open && setOpen(true)}
      />

      {/* SEARCH RESULTS DROPDOWN */}
      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white border rounded shadow max-h-60 overflow-auto z-20">
          {results.map((cn) => (
            <li
              key={cn.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => addCN(cn)}
            >
              <b>{cn.cnNumber}</b> — {cn.packages} pkgs, {cn.chargeWeight} kg
            </li>
          ))}
        </ul>
      )}

      {/* SELECTED CONSIGNMENTS TABLE */}
      {value.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-2">Selected Consignments</h3>

          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">CN No</th>
                <th className="border p-2">Packages</th>
                <th className="border p-2">Pkg UOM</th>
                <th className="border p-2">Weight</th>
                <th className="border p-2">Rate On</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {value.map((cn) => (
                <tr key={cn.id} className="hover:bg-gray-50">
                  <td className="border p-2">{cn.consignment.cnNumber}</td>
                  <td className="border p-2">{cn.consignment.packages}</td>
                  <td className="border p-2">{cn.consignment.packageUom}</td>
                  <td className="border p-2">{cn.consignment.netWeight}</td>
                  <td className="border p-2">{cn.consignment.rateOn}</td>

                  <td className="border p-2 text-center">
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => removeCN(cn.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* TOTALS */}
          <div className="mt-3 p-3 bg-gray-100 rounded border">
            <b>Total Packages:</b> {totals.totalPkgs} <br />
            <b>Total Weight:</b> {totals.totalWt} kg
          </div>
        </div>
      )}
    </div>
  );
}
