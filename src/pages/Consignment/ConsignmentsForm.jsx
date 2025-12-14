import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SettingsContext } from "../../context/SettingsContext.jsx";

import {
  createConsignment,
  updateConsignment,
  getConsignmentById
} from "../../api/consignApi.js";

import { getCustomersByName } from "../../api/custApi.js";
import { getDestinationsByName } from "../../api/destinationApi.js";

import AAutocomplete from "../../components/Acomplete.jsx";
import MainLayout from "../../layout/Mainlayout.jsx";

export default function ConsignmentForm() {
  const { id } = useParams();
  const editing = Boolean(id);

  const { selectedCompany, selectedFinancialYear } = useContext(SettingsContext);
  const navigate = useNavigate();

  // -------------------------
  // FORM STATE
  // -------------------------
  const [form, setForm] = useState({
    cnNumber: "",
    date: "",

    consignorId: "",
    consigneeId: "",
    fromDestinationId: "",
    toDestinationId: "",

    packages: "",
    packageUom: "",
    contents: "",
    netWeight: "",
    grossWeight: "",
    chargeWeight: "",
    weightUom: "",
    rate: "",
    rateOn: "",
    freightCharges: "",
    vehicleNo: "",
    driverName: "",
    remarks: ""
  });

  // -------------------------
  // SEARCH DISPLAY STATE (FOR EDIT MODE)
  // -------------------------
  const [search, setSearch] = useState({
    consignor: "",
    consignee: "",
    fromDest: "",
    toDest: ""
  });

  // -------------------------
  // DEFAULT DATE
  // -------------------------
  useEffect(() => {
    if (!editing && selectedFinancialYear) {
      setForm(f => ({
        ...f,
        date: selectedFinancialYear.startDate.slice(0, 10)
      }));
    }
  }, [selectedFinancialYear, editing]);

  // -------------------------
  // LOAD EDIT DATA
  // -------------------------
  useEffect(() => {
    async function load() {
      if (!editing) return;

      const data = await getConsignmentById(id);

      setForm({
        ...data,
        date: data.date?.slice(0, 10)
      });

      setSearch({
        consignor: data.consignor?.companyName || "",
        consignee: data.consignee?.companyName || "",
        fromDest: data.fromDestination?.name || "",
        toDest: data.toDestination?.name || ""
      });
    }

    load();
  }, [id, editing]);

  // -------------------------
  // INPUT HANDLER
  // -------------------------
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  // -------------------------
  // SUBMIT
  // -------------------------
  async function handleSubmit(e) {
    e.preventDefault();

    const toNumOrNull = (x) =>
      x === "" || x === null || x === undefined ? null : Number(x);

    const payload = {
      ...form,
      companyId: Number(selectedCompany.id),
      branchId: 1,
      financialYearId: Number(selectedFinancialYear.id),

      packages: toNumOrNull(form.packages),
      netWeight: toNumOrNull(form.netWeight),
      grossWeight: toNumOrNull(form.grossWeight),
      chargeWeight: toNumOrNull(form.chargeWeight),
      rate: toNumOrNull(form.rate),
      freightCharges: toNumOrNull(form.freightCharges),
    };

    if (editing) {
      await updateConsignment(id, payload);
    } else {
      await createConsignment(payload);
    }

    navigate("/consignments");
  }

  // -------------------------
  // UI
  // -------------------------
  return (
    <MainLayout>
      <div className="p-5 max-w-4xl mx-auto">
        <h1 className="text-lg font-semibold mb-3">
          {editing ? "Edit Consignment" : "New Consignment"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">

          {/* CN + DATE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label>CN Number *</label>
              <input
                name="cnNumber"
                value={form.cnNumber}
                onChange={handleChange}
                className="border w-full px-3 py-2 rounded"
              />
            </div>

            <div>
              <label>Date *</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="border w-full px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* CONSIGNOR / CONSIGNEE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label>Consignor *</label>
              <AAutocomplete
                fetchFunction={(q) =>
                  getCustomersByName(selectedCompany.id, q)
                }
                onSelect={(c) =>
                  setForm(f => ({ ...f, consignorId: c?.id || "" }))
                }
                initialSearchValue={search.consignor}
                placeholder="Search Consignor"
                renderOption={(c) => (
                  <div className="text-sm font-medium">
                    {c.companyName}
                  </div>
                )}
              />
            </div>

            <div>
              <label>Consignee *</label>
              <AAutocomplete
                fetchFunction={(q) =>
                  getCustomersByName(selectedCompany.id, q)
                }
                onSelect={(c) =>
                  setForm(f => ({ ...f, consigneeId: c?.id || "" }))
                }
                initialSearchValue={search.consignee}
                placeholder="Search Consignee"
                renderOption={(c) => (
                  <div className="text-sm font-medium">
                    {c.companyName}
                  </div>
                )}
              />
            </div>
          </div>

          {/* FROM / TO DESTINATION */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label>From Destination *</label>
              <AAutocomplete
                fetchFunction={(q) => getDestinationsByName(q)}
                onSelect={(d) =>
                  setForm(f => ({ ...f, fromDestinationId: d?.id || "" }))
                }
                initialSearchValue={search.fromDest}
                placeholder="From"
                renderOption={(d) => (
                  <div className="text-sm font-medium">
                    {d.name}
                  </div>
                )}
              />
            </div>

            <div>
              <label>To Destination *</label>
              <AAutocomplete
                fetchFunction={(q) => getDestinationsByName(q)}
                onSelect={(d) =>
                  setForm(f => ({ ...f, toDestinationId: d?.id || "" }))
                }
                initialSearchValue={search.toDest}
                placeholder="To"
                renderOption={(d) => (
                  <div className="text-sm font-medium">
                    {d.name}
                  </div>
                )}
              />
            </div>
          </div>

          {/* PACKAGES */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label>Packages</label>
              <input
                name="packages"
                type="number"
                value={form.packages}
                onChange={handleChange}
                className="border w-full px-3 py-2 rounded"
              />
            </div>

            <div>
              <label>Package UOM</label>
              <input
                name="packageUom"
                value={form.packageUom}
                onChange={handleChange}
                className="border w-full px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* CONTENTS */}
          <div>
            <label>Contents</label>
            <textarea
              name="contents"
              value={form.contents}
              onChange={handleChange}
              className="border w-full px-3 py-2 rounded"
            />
          </div>

          {/* WEIGHTS */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label>Net Wt</label>
              <input
                name="netWeight"
                type="number"
                value={form.netWeight}
                onChange={handleChange}
                className="border w-full px-3 py-2 rounded"
              />
            </div>

            <div>
              <label>Gross Wt</label>
              <input
                name="grossWeight"
                type="number"
                value={form.grossWeight}
                onChange={handleChange}
                className="border w-full px-3 py-2 rounded"
              />
            </div>

            <div>
              <label>Charge Wt</label>
              <input
                name="chargeWeight"
                type="number"
                value={form.chargeWeight}
                onChange={handleChange}
                className="border w-full px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* RATE */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label>Weight UOM *</label>
              <input
                name="weightUom"
                value={form.weightUom}
                onChange={handleChange}
                className="border w-full px-3 py-2 rounded"
              />
            </div>

            <div>
              <label>Rate</label>
              <input
                name="rate"
                type="number"
                value={form.rate}
                onChange={handleChange}
                className="border w-full px-3 py-2 rounded"
              />
            </div>

            <div>
              <label>Rate On</label>
              <input
                name="rateOn"
                value={form.rateOn}
                onChange={handleChange}
                className="border w-full px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* VEHICLE / DRIVER / FREIGHT */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label>Freight Charges</label>
              <input
                name="freightCharges"
                type="number"
                value={form.freightCharges}
                onChange={handleChange}
                className="border w-full px-3 py-2 rounded"
              />
            </div>

            <div>
              <label>Vehicle No</label>
              <input
                name="vehicleNo"
                value={form.vehicleNo}
                onChange={handleChange}
                className="border w-full px-3 py-2 rounded"
              />
            </div>

            <div>
              <label>Driver Name</label>
              <input
                name="driverName"
                value={form.driverName}
                onChange={handleChange}
                className="border w-full px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* REMARKS */}
          <div>
            <label>Remarks</label>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              className="border w-full px-3 py-2 rounded"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-between pt-3">
            <button
              type="button"
              onClick={() => navigate("/consignments")}
              className="px-4 py-2 rounded border"
            >
              Back
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded bg-blue-600 text-white"
            >
              {editing ? "Update" : "Create"}
            </button>
          </div>

        </form>
      </div>
    </MainLayout>
  );
}
