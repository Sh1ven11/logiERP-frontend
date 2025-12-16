import MainLayout from "../../layout/Mainlayout.jsx";
import { useContext, useEffect, useState } from "react";
import { SettingsContext } from "../../context/SettingsContext.jsx";
import { createLorryHire, updateLorryHire, getLorryHire } from "../../api/lorryHireApi.js";
import { getLorryOwnersByName } from "../../api/lorryOwnerApi.js";
import { getBrokersByName } from "../../api/brokerApi.js";
import { getDestinationsByName } from "../../api/destinationApi.js";
import AAutocomplete from "../../components/Acomplete.jsx";
import ConsignmentSelector from "../../components/ConsignSelector.jsx";
import { useParams, useNavigate } from "react-router-dom";

export default function CreateLorryHire() {
  const { selectedCompany, selectedBranch, selectedFinancialYear } =
    useContext(SettingsContext);

  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    challanNumber: "",
    challanDate: today,
    lorryHireDate: today,

    vehicleNo: "",
    driverName: "",
    driverLicenseNo: "",
    remarks: "",

    lorryOwnerId: "",
    brokerId: "",
    destinationId: "",

    totalPackages: "",
    totalWeight: "",

    rate: "",
    lorryHire: "",
    advancePaid: "",

    loadingCharges: "",
    unloadingCharges: "",
    dieselAdvance: "",

    gstApplicable: false,
    gstAmount: "",

    tdsApplicable: "no",
    tdsRate: "",     // UI-only
    panNumber: "",   // UI-only
  });

  const [selectedConsignments, setSelectedConsignments] = useState([]);
  
  // --------------------------------------------------
  // ⭐ FIX: LOAD EDIT DATA useEffect
  // --------------------------------------------------
  useEffect(() => {
    async function loadData() {
      if (!isEditMode) return;

      try {
        // Fetch the existing Lorry Hire record by ID
        // Note: Assumes getLorryHire(id) returns the full record including relations
        const data = await getLorryHire(id); 

        // 1. Populate the main form state
        setForm({
          // Simple string fields
          challanNumber: data.challanNumber || "",
          vehicleNo: data.vehicleNo || "",
          driverName: data.driverName || "",
          driverLicenseNo: data.driverLicenseNo || "",
          remarks: data.remarks || "",

          // Dates (format to YYYY-MM-DD for input type="date")
          challanDate: data.challanDate?.slice(0, 10) || today,
          lorryHireDate: data.lorryHireDate?.slice(0, 10) || today,

          // IDs (must be strings for the form state)
          lorryOwnerId: data.lorryOwnerId?.toString() || "",
          brokerId: data.brokerId?.toString() || "",
          destinationId: data.destinationId?.toString() || "",

          // Numeric fields (stored as strings for input value)
          totalPackages: data.totalPackages?.toString() || "",
          totalWeight: data.totalWeight?.toString() || "",
          rate: data.rate?.toString() || "",
          lorryHire: data.lorryHire?.toString() || "",
          advancePaid: data.advancePaid?.toString() || "",
          loadingCharges: data.loadingCharges?.toString() || "",
          unloadingCharges: data.unloadingCharges?.toString() || "",
          dieselAdvance: data.dieselAdvance?.toString() || "",
          gstAmount: data.gstAmount?.toString() || "",
          
          // Boolean/Select fields
          gstApplicable: data.gstApplicable || false,
          tdsApplicable: data.tdsApplicable || "no", 

          // UI-only/Derived fields
          tdsRate: data.tdsPercent?.toString() || "", // tdsPercent is mapped back to tdsRate
          panNumber: data.panCardUsed || "", // panCardUsed is mapped back to panNumber
        });

        // 2. Populate the Consignment Selector state
        // Assumes data.consignments is an array of relationship objects 
        // that must be mapped to the actual consignment objects (c.consignment)
        if (data.consignments) {
            setSelectedConsignments(data.consignments.map(c => c.consignment));
        }

      } catch (error) {
        console.error("Failed to load Lorry Hire Challan:", error);
      }
    }

    loadData();
  }, [id, isEditMode]); // Dependencies: re-run if ID or editing mode changes
  
  // --------------------------------------------------
  // END FIX
  // --------------------------------------------------


  const calculatedHire = Number(form.rate || 0) * Number(form.totalWeight || 0);
  const tdsAmount =
    form.tdsApplicable !== "no" && form.tdsRate
      ? (Number(form.lorryHire || 0) * Number(form.tdsRate)) / 100
      : 0;

  const totalAmount =
    Number(form.lorryHire || 0) +
    Number(form.loadingCharges || 0) +
    Number(form.unloadingCharges || 0) +
    Number(form.dieselAdvance || 0) +
    (form.gstApplicable ? Number(form.gstAmount || 0) : 0);

  const balancePayable =
    totalAmount - tdsAmount - Number(form.advancePaid || 0);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async () => {
    const cleaned = { ...form };

    [
      "lorryOwnerId",
      "brokerId",
      "destinationId",
      "totalPackages",
      "totalWeight",
      "rate",
      "lorryHire",
      "advancePaid",
      "loadingCharges",
      "unloadingCharges",
      "dieselAdvance",
      "gstAmount",
    ].forEach((f) => {
      cleaned[f] = cleaned[f] ? Number(cleaned[f]) : undefined;
    });

    // remove UI-only fields
    delete cleaned.tdsRate;
    delete cleaned.panNumber;

    const payload = {
      ...cleaned,
      tdsPercent: form.tdsRate ? Number(form.tdsRate) : undefined,
      panCardUsed: form.panNumber || undefined,
      companyId: selectedCompany.id,
      branchId: selectedBranch.id,
      financialYearId: selectedFinancialYear.id,
      consignmentIds: selectedConsignments.map((c) => c.id),
    };

    isEditMode
      ? await updateLorryHire(id, payload)
      : await createLorryHire(payload);

    navigate("/lorry-hire");
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <h1 className="text-xl font-bold">
          {isEditMode ? "Edit" : "Create"} Lorry Hire Challan
        </h1>

        {/* BASIC */}
        <div className="grid grid-cols-3 gap-4">
          <input name="challanNumber" value={form.challanNumber} onChange={handleChange} className="border p-2" placeholder="Challan No" />
          <input type="date" name="challanDate" value={form.challanDate} onChange={handleChange} className="border p-2" />
          <input type="date" name="lorryHireDate" value={form.lorryHireDate} onChange={handleChange} className="border p-2" />

          <input name="vehicleNo" value={form.vehicleNo} onChange={handleChange} className="border p-2" placeholder="Vehicle No" />
          <input name="driverName" value={form.driverName} onChange={handleChange} className="border p-2" placeholder="Driver Name" />
          <input name="driverLicenseNo" value={form.driverLicenseNo} onChange={handleChange} className="border p-2" placeholder="Driver License No" />
        </div>

        {/* PARTIES */}
        <div className="grid grid-cols-3 gap-4">
          <AAutocomplete
            fetchFunction={(q) => getLorryOwnersByName(selectedCompany.id, q)}
            placeholder="Lorry Owner"
            // The value is set by the state update in useEffect
            // If AAutocomplete needs explicit initial text, you will need a 'search' state.
            onSelect={(o) => setForm((f) => ({ ...f, lorryOwnerId: o?.id || "" }))}
          />
          <AAutocomplete
            fetchFunction={(q) => getBrokersByName(selectedCompany.id, q)}
            placeholder="Broker"
            onSelect={(b) => setForm((f) => ({ ...f, brokerId: b?.id || "" }))}
          />
          <AAutocomplete
            fetchFunction={getDestinationsByName}
            placeholder="Destination"
            onSelect={(d) => setForm((f) => ({ ...f, destinationId: d?.id || "" }))}
          />
        </div>

        {/* CONSIGNMENTS */}
        <ConsignmentSelector
          value={selectedConsignments}
          onChange={setSelectedConsignments}
          onTotalsChange={(t) =>
            setForm((f) => ({
              ...f,
              totalPackages: t.totalPkgs,
              totalWeight: t.totalWt,
              lorryHire: f.lorryHire || calculatedHire,
            }))
          }
        />

        {/* RATE */}
        <div className="grid grid-cols-3 gap-4">
          <input name="rate" value={form.rate} onChange={handleChange} className="border p-2" placeholder="Rate" />
          <input readOnly value={calculatedHire.toFixed(2)} className="border p-2 bg-gray-100" />
          <input name="lorryHire" value={form.lorryHire} onChange={handleChange} className="border p-2" placeholder="Final Hire" />
        </div>

        {/* CHARGES */}
        <div className="grid grid-cols-3 gap-4">
          <input name="loadingCharges" value={form.loadingCharges} onChange={handleChange} className="border p-2" placeholder="Loading" />
          <input name="unloadingCharges" value={form.unloadingCharges} onChange={handleChange} className="border p-2" placeholder="Unloading" />
          <input name="dieselAdvance" value={form.dieselAdvance} onChange={handleChange} className="border p-2" placeholder="Diesel" />
        </div>

        {/* TDS */}
        <div className="border p-4 rounded">
          <select name="tdsApplicable" value={form.tdsApplicable} onChange={handleChange} className="border p-2">
            <option value="no">No TDS</option>
            <option value="lorryOwner">On Owner</option>
            <option value="broker">On Broker</option>
            <option value="yes">Manual</option>
          </select>

          {form.tdsApplicable !== "no" && (
            <div className="grid grid-cols-2 gap-4 mt-3">
              <input name="tdsRate" value={form.tdsRate} onChange={handleChange} className="border p-2" placeholder="TDS %" />
              <input name="panNumber" value={form.panNumber} onChange={handleChange} className="border p-2" placeholder="PAN" />
            </div>
          )}
        </div>

        {/* SUMMARY */}
        <div className="bg-green-50 p-4 rounded">
          <div>Total: ₹{totalAmount.toFixed(2)}</div>
          <div>TDS: ₹{tdsAmount.toFixed(2)}</div>
          <div className="font-bold">Balance: ₹{balancePayable.toFixed(2)}</div>
        </div>

        <button onClick={handleSubmit} className="bg-blue-600 text-white px-6 py-2 rounded">
          {isEditMode ? "Update" : "Create"}
        </button>
      </div>
    </MainLayout>
  );
}