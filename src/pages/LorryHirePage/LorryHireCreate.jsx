import MainLayout from "../../layout/Mainlayout.jsx";
import { useContext, useEffect, useState } from "react";
import { SettingsContext } from "../../context/SettingsContext.jsx";
import {
  createLorryHire,
  updateLorryHire,
  getLorryHire,
  getLorryOwners,
  getLorryBrokers,
  getDestinations,
} from "../../api/lorryHireApi.js";

import Autocomplete from "../../components/Autocomplete.jsx";
import ConsignmentSelector from "../../components/ConsignSelector.jsx";   // ✅ NEW COMPONENT
import { useParams, useNavigate } from "react-router-dom";

export default function CreateLorryHire() {
  const { selectedCompany, selectedBranch, selectedFinancialYear } =
    useContext(SettingsContext);

  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = !!id;
  const today = new Date().toISOString().substring(0, 10);

  if (!selectedCompany || !selectedBranch || !selectedFinancialYear) {
    return (
      <MainLayout>
        <div className="p-6 text-gray-600">Loading settings...</div>
      </MainLayout>
    );
  }

  const [owners, setOwners] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [destinations, setDestinations] = useState([]);

  const [form, setForm] = useState({
    challanNumber: "",
    challanDate: today,
    lorryHireDate: today,
    vehicleNo: "",
    slipNo: "",
    remarks: "",
    lorryOwnerId: "",
    brokerId: "",
    destinationId: "",
    totalPackages: "",
    totalWeight: "",
    rate: "",
    lorryHire: "",
    advancePaid: "",
    balancePayable: "",
    loadingCharges: "",
    unloadingCharges: "",
    dieselAdvance: "",
    gstApplicable: false,
    gstAmount: "",
  });

  const [selectedConsignments, setSelectedConsignments] = useState([]);

  // LOAD MASTER DATA
  useEffect(() => {
    if (!selectedCompany) return;

    getLorryOwners(selectedCompany.id).then((res) => setOwners(res.data || []));
    getLorryBrokers(selectedCompany.id).then((res) => setBrokers(res.data || []));
    getDestinations().then((res) => setDestinations(res.data || []));
  }, [selectedCompany]);

  // LOAD EXISTING CHALLAN (EDIT MODE)
  useEffect(() => {
    if (!isEditMode) return;

    getLorryHire(id).then((data) => {
      setForm({
        challanNumber: data.challanNumber || "",
        challanDate: data.challanDate?.substring(0, 10) || today,
        lorryHireDate: data.lorryHireDate?.substring(0, 10) || today,
        vehicleNo: data.vehicleNo || "",
        slipNo: data.slipNo || "",
        remarks: data.remarks || "",
        lorryOwnerId: data.lorryOwnerId || "",
        brokerId: data.brokerId || "",
        destinationId: data.destinationId || "",
        totalPackages: data.totalPackages || "",
        totalWeight: data.totalWeight || "",
        rate: data.rate || "",
        lorryHire: data.lorryHire || "",
        advancePaid: data.advancePaid || "",
        balancePayable: data.balancePayable || "",
        loadingCharges: data.loadingCharges || "",
        unloadingCharges: data.unloadingCharges || "",
        dieselAdvance: data.dieselAdvance || "",
        gstApplicable: data.gstApplicable || false,
        gstAmount: data.gstAmount || "",
      });

      // selected consignments from backend
      setSelectedConsignments(data.consignments || []);
    });
  }, [id, isEditMode]);

  // FORM HANDLER
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };
  const handleSubmit = async () => {
    // 1. Identify all fields that must be numbers/IDs.
    const fieldsToClean = [
      "lorryOwnerId",
      "brokerId",
      "destinationId",
      "totalPackages",
      "totalWeight",
      "rate",
      "lorryHire",
      "advancePaid",
      "balancePayable",
      "loadingCharges",
      "unloadingCharges",
      "dieselAdvance",
      "gstAmount",
    ];

    const cleaned = { ...form };

    // 2. Clean and convert the fields
    fieldsToClean.forEach((field) => {
      // If the field has a truthy value (i.e., not an empty string ""), convert it to a Number.
      // Otherwise, set it to undefined.
      cleaned[field] = cleaned[field] ? Number(cleaned[field]) : undefined;
    });

    // 3. Prepare the final payload, ensuring Company/Branch/FY IDs are included.
    const payload = {
      ...cleaned,
      // NOTE: companyId, branchId, and financialYearId MUST be included here
      // as they are mandatory foreign keys, even if they are only sent once
      // during creation. They must be sent on update if they change (though they rarely do).
      companyId: selectedCompany.id,
      branchId: selectedBranch.id,
      financialYearId: selectedFinancialYear.id,
      consignmentIds: selectedConsignments.map((c) => c.id),
    };

    try {
      if (isEditMode) {
        await updateLorryHire(id, payload);
        alert("Challan updated!");
      } else {
        await createLorryHire(payload);
        alert("Challan created!");
      }
      navigate("/lorry-hire");
    } catch (err) {
      console.error("Error saving:", err.response?.data || err);
      alert("Error saving challan");
    }
  };

  const handleView = () => navigate("/lorry-hire");

  return (
    <MainLayout>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">
          {isEditMode ? "Edit Lorry Hire Challan" : "Create Lorry Hire Challan"}
        </h2>

        {/* DATE FIELDS */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm font-semibold">Challan Date</label>
            <input type="date" name="challanDate" className="border p-2 w-full"
              value={form.challanDate} onChange={handleChange} />
          </div>

          <div>
            <label className="text-sm font-semibold">Lorry Hire Date</label>
            <input type="date" name="lorryHireDate" className="border p-2 w-full"
              value={form.lorryHireDate} onChange={handleChange} />
          </div>

          <div>
            <label className="text-sm font-semibold">Challan Number</label>
            <input name="challanNumber" className="border p-2 w-full"
              value={form.challanNumber} onChange={handleChange} />
          </div>

          <input name="vehicleNo" placeholder="Vehicle No" className="border p-2"
            value={form.vehicleNo} onChange={handleChange} />

          <input name="slipNo" placeholder="Slip No" className="border p-2"
            value={form.slipNo} onChange={handleChange} />

          <Autocomplete label="Lorry Owner" items={owners}
            value={owners.find((o) => o.id == form.lorryOwnerId)}
            onChange={(o) => setForm({ ...form, lorryOwnerId: o.id })} />

          <Autocomplete label="Broker" items={brokers}
            value={brokers.find((b) => b.id == form.brokerId)}
            onChange={(b) => setForm({ ...form, brokerId: b.id })} />

          <Autocomplete label="Destination" items={destinations}
            value={destinations.find((d) => d.id == form.destinationId)}
            onChange={(d) => setForm({ ...form, destinationId: d.id })} />

          <textarea name="remarks" placeholder="Remarks"
            className="border p-2 col-span-3"
            value={form.remarks} onChange={handleChange} />
        </div>

        {/* CONSIGNMENT SELECTOR */}
        <h3 className="mt-6 mb-2 text-lg font-bold">Consignments</h3>
        <ConsignmentSelector
          value={selectedConsignments}
          onChange={setSelectedConsignments}
          onTotalsChange={(totals) => {
            setForm((prev) => ({
              ...prev,
              totalPackages: totals.totalPkgs,
              totalWeight: totals.totalWt
            }));
          }}
        />
      <h3 className="mt-6 font-bold mb-2">Charges</h3>

      <div className="grid grid-cols-3 gap-4">
          {[
            { key: "totalPackages", label: "Total Packages" },
            { key: "totalWeight", label: "Total Weight (kg)" },
            { key: "rate", label: "Rate" },
            { key: "lorryHire", label: "Lorry Hire Amount" },
            { key: "advancePaid", label: "Advance Paid" },
            { key: "balancePayable", label: "Balance Payable" },
            { key: "loadingCharges", label: "Loading Charges" },
            { key: "unloadingCharges", label: "Unloading Charges" },
            { key: "dieselAdvance", label: "Diesel Advance" },
            { key: "gstAmount", label: "GST Amount" },
          ].map(({ key, label }) => (
            <div key={key} className="flex flex-col">
              <label className="text-sm font-medium mb-1">{label}</label>
              <input
                name={key}
                placeholder={label}
                className="border p-2"
                value={form[key]}
                onChange={handleChange}
              />
            </div>
          ))}

          {/* GST APPLICABLE CHECKBOX */}
          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              name="gstApplicable"
              checked={form.gstApplicable}
              onChange={handleChange}
            />
            <label className="text-sm font-medium">GST Applicable</label>
          </div>
      </div>

         <div className="mt-8 flex items-center gap-4">
                {/* Primary Action */}
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-sm transition"
                >
                  {isEditMode ? "Update Challan" : "Create Challan"}
                </button>

                {/* Secondary Action */}
                <button
                  onClick={handleView}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg shadow-sm transition"
                >
                  Back to Challan List
                </button>
              </div>

      </div>
    </MainLayout>
  );
}
