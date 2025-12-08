import MainLayout from "../../../layout/Mainlayout.jsx";
import { useContext, useEffect, useState } from "react";
import { SettingsContext } from "../../../context/SettingsContext.jsx";
import {
  createLorryHire,
  updateLorryHire,
  getLorryHire,
  getLorryOwners,
  getLorryBrokers,
  getDestinations,
} from "../../../api/lorryHireApi.js";
import Autocomplete from "../../../components/Autocomplete.jsx";
import { useParams, useNavigate } from "react-router-dom";

export default function CreateLorryHire() {
  const { selectedCompany, selectedBranch, selectedFinancialYear } = useContext(SettingsContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = !!id;

  // Guard while settings load
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
    challanDate: "",
    lorryHireDate: "",
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

  // Fetch master data
  useEffect(() => {
    if (!selectedCompany) return;

    getLorryOwners(selectedCompany.id).then((res) => setOwners(res.data || []));
    getLorryBrokers(selectedCompany.id).then((res) => setBrokers(res.data || []));
    getDestinations().then((res) => setDestinations(res.data || []));
  }, [selectedCompany]);

  // Load existing challan if editing
  useEffect(() => {
    if (!isEditMode) return;

    getLorryHire(id).then((data) => {
      setForm({
        challanNumber: data.challanNumber || "",
        challanDate: data.challanDate?.substring(0, 10) || "",
        lorryHireDate: data.lorryHireDate?.substring(0, 10) || "",
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
    });
  }, [id, isEditMode]);

  // Generic handler
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Submit handler
  const handleView = () => {
    navigate("/lorry-hire");
  }
  const handleSubmit = async () => {
    const numericFields = [
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

    numericFields.forEach((field) => {
      cleaned[field] = cleaned[field] === "" ? undefined : Number(cleaned[field]);
    });

    const payload = {
      ...cleaned,
      companyId: selectedCompany.id,
      branchId: selectedBranch.id,
      financialYearId: selectedFinancialYear.id,
    };

    try {
      if (isEditMode) {
        await updateLorryHire(id, payload);
        alert("Challan updated!");
      } else {
        await createLorryHire(payload);
        alert("Challan created!");
      }
      navigate("/lorry-hire/create");
    } catch (err) {
      console.error("Error saving:", err.response?.data || err);
      alert("Error saving challan");
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">
          {isEditMode ? "Edit Lorry Hire Challan" : "Create Lorry Hire Challan"}
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <input name="challanNumber" placeholder="Challan Number" className="border p-2" value={form.challanNumber} onChange={handleChange} />
          <input type="date" name="challanDate" className="border p-2" value={form.challanDate} onChange={handleChange} />
          <input type="date" name="lorryHireDate" className="border p-2" value={form.lorryHireDate} onChange={handleChange} />

          <input name="vehicleNo" placeholder="Vehicle No" className="border p-2" value={form.vehicleNo} onChange={handleChange} />
          <input name="slipNo" placeholder="Slip No" className="border p-2" value={form.slipNo} onChange={handleChange} />

          {/* OWNER */}
          <Autocomplete
            label="Lorry Owner"
            items={owners}
            value={owners.find((o) => o.id == form.lorryOwnerId)}
            onChange={(owner) => setForm({ ...form, lorryOwnerId: owner.id })}
          />

          {/* BROKER */}
          <Autocomplete
            label="Broker"
            items={brokers}
            value={brokers.find((b) => b.id == form.brokerId)}
            onChange={(broker) => setForm({ ...form, brokerId: broker.id })}
          />

          {/* DESTINATION */}
          <Autocomplete
            label="Destination"
            items={destinations}
            value={destinations.find((d) => d.id == form.destinationId)}
            onChange={(dest) => setForm({ ...form, destinationId: dest.id })}
          />

          <textarea name="remarks" placeholder="Remarks" className="border p-2 col-span-3" value={form.remarks} onChange={handleChange} />
        </div>

        <h3 className="mt-6 font-bold mb-2">Charges</h3>

        <div className="grid grid-cols-3 gap-4">
          {[
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
          ].map((field) => (
            <input key={field} name={field} placeholder={field} value={form[field]} className="border p-2" onChange={handleChange} />
          ))}

          <label className="flex items-center gap-2">
            <input type="checkbox" name="gstApplicable" checked={form.gstApplicable} onChange={handleChange} />
            GST Applicable
          </label>
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
