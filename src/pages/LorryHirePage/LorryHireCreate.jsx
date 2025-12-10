import MainLayout from "../../layout/Mainlayout.jsx";
import { useContext, useEffect, useState } from "react";
import { SettingsContext } from "../../context/SettingsContext.jsx";
import {
  createLorryHire,
  updateLorryHire,
  getLorryHire,
} from "../../api/lorryHireApi.js";
import { getLorryOwners } from "../../api/lorryOwnerApi.js";
import { getBrokers as getLorryBrokers } from "../../api/brokerApi.js";
import { getDestinations } from "../../api/destinationApi.js";
import Autocomplete from "../../components/Autocomplete.jsx";
import ConsignmentSelector from "../../components/ConsignSelector.jsx";
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
  //Form state
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
    tdsApplicable: "no",
    tdsRate: "",
    panNumber: "",
    tdsType: "", // 'broker', 'lorryOwner', or 'manual'
  });

  const [selectedConsignments, setSelectedConsignments] = useState([]);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);

  // Calculation functions
  const calculateTDSAmount = () => {
    if (form.tdsApplicable === "no" || !form.tdsRate || !form.lorryHire) return 0;
    return (Number(form.lorryHire) * Number(form.tdsRate)) / 100;
  };

  const calculateTotalAmount = () => {
    const baseAmount = Number(form.lorryHire || 0);
    const extraCharges = 
      Number(form.loadingCharges || 0) +
      Number(form.unloadingCharges || 0) +
      Number(form.dieselAdvance || 0) +
      (form.gstApplicable ? Number(form.gstAmount || 0) : 0);
    
    return baseAmount + extraCharges;
  };

  const calculateBalance = () => {
    const totalAmount = calculateTotalAmount();
    const tdsAmount = calculateTDSAmount();
    const advancePaid = Number(form.advancePaid || 0);
    
    return totalAmount - tdsAmount - advancePaid;
  };

  // Auto-update the balancePayable field
  useEffect(() => {
    const balance = calculateBalance();
    setForm(prev => ({ ...prev, balancePayable: balance.toFixed(2) }));
  }, [
    form.lorryHire,
    form.loadingCharges,
    form.unloadingCharges,
    form.dieselAdvance,
    form.gstApplicable,
    form.gstAmount,
    form.tdsApplicable,
    form.tdsRate,
    form.advancePaid
  ]);

  // LOAD MASTER DATA
 // --- In CreateLorryHire.jsx ---

  // LOAD MASTER DATA
  useEffect(() => {
      // 1. Context Check
      if (!selectedCompany?.id) return; 

      const companyId = selectedCompany.id;

      // Lorry Owners (working)
      getLorryOwners(companyId).then((res) => {
          setOwners(res.data || []);
      });
      
      // FIX: Simplified Promise Handling for Brokers
      getLorryBrokers(companyId)
          .then((res) => {
              // Log final successful count before setting state (optional check)
              setBrokers(res|| []);
          })
          .catch((err) => {
              console.error("Broker fetch failed in component:", err);
              // Optionally set an error state here if needed
          });

      // Destinations (assumes no company filter)
      getDestinations().then((res) => {
          setDestinations(res.data || []);
      });

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
        // New TDS fields
        tdsApplicable: data.tdsApplicable || "no",
        tdsRate: data.tdsPercent || "",
        panNumber: data.panCardUsed || "",
        tdsType: data.tdsType || "",
      });

      // selected consignments from backend
      setSelectedConsignments(data.consignments || []);
      setSelectedBroker(data.broker || null);
      setSelectedOwner(data.lorryOwner || null);

    });
  }, [id, isEditMode]);

  // Handle TDS applicable change
  const handleTdsApplicableChange = (value) => {
    // Start with a clean slate for panNumber/tdsType when changing the type
    let updatedForm = { ...form, tdsApplicable: value, tdsType: "", panNumber: "" };
    console.log("value changed to:", value);
    
    if (value === "no") {
      updatedForm.tdsRate = "";
    } 
    
    // --- UPDATED LOGIC FOR BROKER ---
    else if (value === "broker") {
      // Check if selectedBroker exists AND has a truthy panNumber
      if (selectedBroker?.panNumber) {
        updatedForm.panNumber = selectedBroker.panNumber;
        updatedForm.tdsType = "broker";
      } else {
        // PAN missing, set panNumber to empty string and tdsType to "manual" or "yes" to enable input
        updatedForm.panNumber = "";
        updatedForm.tdsType = "manual"; // Set to manual to allow user entry
      }
    } 
    
    // --- UPDATED LOGIC FOR LORRY OWNER ---
    else if (value === "lorryOwner") {
      // Check if selectedOwner exists AND has a truthy panNumber
      if (selectedOwner?.panNumber) {
        updatedForm.panNumber = selectedOwner.panNumber;
        updatedForm.tdsType = "lorryOwner";
      } else {  
        // PAN missing, set panNumber to empty string and tdsType to "manual" or "yes" to enable input
        updatedForm.panNumber = "";
        updatedForm.tdsType = "manual"; // Set to manual to allow user entry
      }
    } 
    
    // --- UPDATED LOGIC FOR MANUAL ENTRY (YES) ---
    else if (value === "yes") {
      // Always set panNumber to empty string to ensure manual input is required
      updatedForm.panNumber = "";
      updatedForm.tdsType = "manual";
    }
    
    setForm(updatedForm);
  };

  // Handle broker selection
  const handleBrokerChange = (broker) => {
    setSelectedBroker(broker);
    let newForm = { ...form, brokerId: broker.id };

    // Check if TDS is set to broker and update PAN accordingly
    if (form.tdsApplicable === "broker") {
      if (broker?.panNumber) {
        newForm.panNumber = broker.panNumber;
        newForm.tdsType = "broker";
      } else {
        newForm.panNumber = "";
        newForm.tdsType = "manual";
      }
    }

    setForm(newForm);
  };

  // Handle lorry owner selection
  const handleOwnerChange = (owner) => {
    setSelectedOwner(owner);
    let newForm = { ...form, lorryOwnerId: owner.id };

    // Check if TDS is set to lorry owner and update PAN accordingly
    if (form.tdsApplicable === "lorryOwner") {
      if (owner?.panNumber) {
        newForm.panNumber = owner.panNumber;
        newForm.tdsType = "lorryOwner";
      } else {
        newForm.panNumber = "";
        newForm.tdsType = "manual";
      }
    }

    setForm(newForm);
  };

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
      "tdsRate",
    ];
  

    const cleaned = { ...form };

    // 2. Clean and convert the fields
    fieldsToClean.forEach((field) => {
      // If the field has a truthy value (i.e., not an empty string ""), convert it to a Number.
      // Otherwise, set it to undefined.
      cleaned[field] = cleaned[field] ? Number(cleaned[field]) : undefined;
    });

    // 3. Prepare the final payload
    const payload = {
      ...cleaned,
      panCardUsed: cleaned.panNumber, // Backend expects 'panCardUsed'
      tdsPercent: cleaned.tdsRate,// backend expects 'tdsPercent'
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
            <input 
              type="date" 
              name="challanDate" 
              className="border p-2 w-full"
              value={form.challanDate} 
              onChange={handleChange} 
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Lorry Hire Date</label>
            <input 
              type="date" 
              name="lorryHireDate" 
              className="border p-2 w-full"
              value={form.lorryHireDate} 
              onChange={handleChange} 
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Challan Number</label>
            <input 
              name="challanNumber" 
              className="border p-2 w-full"
              value={form.challanNumber} 
              onChange={handleChange} 
            />
          </div>
          
          <div>
            <label className="text-sm font-semibold">Vehicle Number</label><br />
            <input 
              name="vehicleNo" 
              placeholder="Vehicle No" 
              className="border p-2 w-full"
              value={form.vehicleNo} 
              onChange={handleChange} 
            />
          </div>
          
          <div>
            <label className="text-sm font-semibold">Slip Number</label><br />
            <input 
              name="slipNo" 
              placeholder="Slip No" 
              className="border p-2 w-full"
              value={form.slipNo} 
              onChange={handleChange} 
            />
          </div>
          
          <Autocomplete 
            label="Lorry Owner" 
            items={owners}
            value={owners.find((o) => o.id == form.lorryOwnerId)}
            onChange={handleOwnerChange}
          />

          <Autocomplete 
            label="Broker" 
            items={brokers}
            value={brokers.find((b) => b.id == form.brokerId)}
            onChange={handleBrokerChange}
          />

          <Autocomplete 
            label="Destination" 
            items={destinations}
            value={destinations.find((d) => d.id == form.destinationId)}
            onChange={(d) => setForm({ ...form, destinationId: d.id })}
          />

          <textarea 
            name="remarks" 
            placeholder="Remarks"
            className="border p-2 col-span-3"
            value={form.remarks} 
            onChange={handleChange} 
          />
        </div>

        {/* TDS SECTION */}
        <div className="grid grid-cols-3 gap-4 mb-4 p-4 border rounded-lg bg-gray-50">
          <div>
            <label className="text-sm font-semibold">TDS Applicable</label>
            <select
              name="tdsApplicable"
              className="border p-2 w-full"
              value={form.tdsApplicable}
              onChange={(e) => handleTdsApplicableChange(e.target.value)}
            >
              <option value="no">No</option>
              <option value="broker">On Broker</option>
              <option value="lorryOwner">On Lorry Owner</option>
              <option value="yes">Yes (Manual Entry)</option>
            </select>
          </div>

          {(form.tdsApplicable === "broker" || form.tdsApplicable === "lorryOwner" || form.tdsApplicable === "yes") && (
            <>
              <div>
                <label className="text-sm font-semibold">TDS Rate (%)</label>
                <input
                  type="number"
                  name="tdsRate"
                  placeholder="TDS Rate"
                  className="border p-2 w-full"
                  value={form.tdsRate}
                  onChange={handleChange}
                  step="0.01"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  {(form.tdsType === "broker" || form.tdsType === "lorryOwner") 
                    ? "PAN Card (Auto-filled)" 
                    : "PAN Card"}
                </label>
                <input
                  type="text"
                  name="panNumber" // Changed from 'panCard' to 'panNumber' to match form state
                  placeholder="PAN Card Number"
                  className="border p-2 w-full uppercase"
                  value={form.panNumber}
                  onChange={handleChange}
                  readOnly={form.tdsType === "broker" || form.tdsType === "lorryOwner"} // Check tdsType for readOnly status
                  style={{
                    backgroundColor: (form.tdsType === "broker" || form.tdsType === "lorryOwner") 
                      ? '#f3f4f6' 
                      : 'white'
                  }}
                />
                {(form.tdsApplicable === "broker" && form.tdsType === "broker") && (
                  <p className="text-xs text-gray-500 mt-1">
                    From broker: {selectedBroker?.name}
                  </p>
                )}
                {(form.tdsApplicable === "lorryOwner" && form.tdsType === "lorryOwner") && (
                  <p className="text-xs text-gray-500 mt-1">
                    From lorry owner: {selectedOwner?.name}
                  </p>
                )}
                {(form.tdsApplicable !== "no" && form.panNumber === "" && form.tdsType === "manual") && (
                  <p className="text-xs text-red-500 mt-1 font-medium">
                    PAN is required for TDS. Please enter manually.
                  </p>
                )}
              </div>
            </>
          )}
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

        {/* CHARGES SECTION */}
        <h3 className="mt-6 font-bold mb-4 text-lg border-b pb-2">Charges</h3>

        <div className="grid grid-cols-2 gap-6">
          {/* LEFT COLUMN - BASIC CALCULATIONS */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-gray-700">Basic Calculations</h4>
              
              <div className="space-y-3">
                {/* Total Packages - Read Only */}
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Total Packages</label>
                  <input
                    type="text"
                    className="border p-2 w-40 text-right bg-gray-100"
                    value={form.totalPackages}
                    readOnly
                  />
                </div>

                {/* Total Weight - Read Only */}
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Total Weight (kg)</label>
                  <input
                    type="text"
                    className="border p-2 w-40 text-right bg-gray-100"
                    value={form.totalWeight}
                    readOnly
                  />
                </div>

                {/* Hire Rate */}
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Hire Rate (per kg)</label>
                  <input
                    type="number"
                    name="rate"
                    className="border p-2 w-40 text-right"
                    value={form.rate}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                {/* Calculated Hire Amount */}
                <div className="flex justify-between items-center bg-blue-50 p-3 rounded">
                  <label className="text-sm font-semibold">Calculated Hire Amount</label>
                  <div className="font-semibold text-blue-700">
                    ₹{(Number(form.rate || 0) * Number(form.totalWeight || 0)).toFixed(2)}
                  </div>
                </div>

                {/* Lorry Hire (Manual Entry) */}
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Lorry Hire (Final Amount)</label>
                  <input
                    type="number"
                    name="lorryHire"
                    className="border p-2 w-40 text-right font-medium border-blue-300"
                    value={form.lorryHire}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* TDS CALCULATION */}
            {(form.tdsApplicable !== "no") && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3 text-red-700">TDS Deduction</h4>
                
                <div className="space-y-3">
                  {/* TDS Rate */}
                  {form.tdsRate && (
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium">TDS Rate</label>
                      <div className="text-right">
                        <span className="font-medium">{form.tdsRate}%</span>
                        <span className="text-xs text-gray-500 ml-2">
                          on ₹{Number(form.lorryHire || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* TDS Amount */}
                  {form.tdsRate && form.lorryHire && (
                    <div className="flex justify-between items-center bg-red-100 p-3 rounded">
                      <label className="text-sm font-semibold text-red-700">TDS Amount (-)</label>
                      <div className="font-semibold text-red-700">
                        ₹{calculateTDSAmount().toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - PAYMENT & BALANCE */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-gray-700">Extra Charges</h4>
              
              <div className="space-y-3">
                {/* Loading Charges */}
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Loading Charges</label>
                  <input
                    type="number"
                    name="loadingCharges"
                    className="border p-2 w-40 text-right"
                    value={form.loadingCharges}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                {/* Unloading Charges */}
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Unloading Charges</label>
                  <input
                    type="number"
                    name="unloadingCharges"
                    className="border p-2 w-40 text-right"
                    value={form.unloadingCharges}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                {/* Diesel Advance */}
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Diesel Advance</label>
                  <input
                    type="number"
                    name="dieselAdvance"
                    className="border p-2 w-40 text-right"
                    value={form.dieselAdvance}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                {/* GST */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="gstApplicable"
                      checked={form.gstApplicable}
                      onChange={handleChange}
                    />
                    <label className="text-sm font-medium">GST Applicable</label>
                  </div>
                  {form.gstApplicable && (
                    <input
                      type="number"
                      name="gstAmount"
                      className="border p-2 w-40 text-right"
                      value={form.gstAmount}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* PAYMENT SUMMARY */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium mb-3 text-green-700">Payment Summary</h4>
              
              <div className="space-y-3">
                {/* Advance Paid */}
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Advance Paid</label>
                  <input
                    type="number"
                    name="advancePaid"
                    className="border p-2 w-40 text-right border-green-300"
                    value={form.advancePaid}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                {/* CALCULATED BALANCE */}
                <div className="bg-green-100 p-3 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-green-700">Total Amount</label>
                    <div className="font-semibold text-green-700">
                      ₹{calculateTotalAmount().toFixed(2)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium">Less: TDS</label>
                    <div className="text-green-700">
                      - ₹{calculateTDSAmount().toFixed(2)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-3 border-t pt-2">
                    <label className="text-sm font-medium">Less: Advance</label>
                    <div className="text-green-700">
                      - ₹{Number(form.advancePaid || 0).toFixed(2)}
                    </div>
                  </div>

                  {/* Balance Payable */}
                  <div className="flex justify-between items-center bg-white p-3 rounded border">
                    <label className="text-sm font-bold">Balance Payable</label>
                    <div className="font-bold text-lg">
                      ₹{calculateBalance().toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
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