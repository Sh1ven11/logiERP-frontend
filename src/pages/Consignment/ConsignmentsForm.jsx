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

  // Set correct default date for NEW CN
  useEffect(() => {
    if (!editing && selectedFinancialYear) {
      setForm(f => ({
        ...f,
        date: selectedFinancialYear.startDate.slice(0, 10)
      }));
    }
  }, [selectedFinancialYear, editing]);

  // -------------------------
  // SEARCH STATE
  // -------------------------
  const [search, setSearch] = useState({
    consignor: "",
    consignee: "",
    fromDest: "",
    toDest: ""
  });

  const [options, setOptions] = useState({
    consignor: [],
    consignee: [],
    fromDest: [],
    toDest: []
  });

  // -------------------------
  // EDIT MODE LOAD
  // -------------------------
  useEffect(() => {
    async function load() {
      if (!editing) return;

      const data = await getConsignmentById(id);

      setForm({
        ...data,
        date: data.date?.slice(0, 10),
        consignorId: data.consignorId,
        consigneeId: data.consigneeId,
        fromDestinationId: data.fromDestinationId,
        toDestinationId: data.toDestinationId
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
  // FORM INPUT HANDLER
  // -------------------------
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  // -------------------------
  // SEARCH HANDLER
  // -------------------------
  async function handleSearch(type, value) {
    setSearch(prev => ({ ...prev, [type]: value }));

    // Reset ID field when typing
    const idMap = {
      consignor: "consignorId",
      consignee: "consigneeId",
      fromDest: "fromDestinationId",
      toDest: "toDestinationId",
    };

    setForm(prev => ({ ...prev, [idMap[type]]: "" }));

    if (value.length < 2) {
      setOptions(prev => ({ ...prev, [type]: [] }));
      return;
    }

    if (type === "consignor" || type === "consignee") {
      const list = await getCustomersByName(selectedCompany.id, value);
      setOptions(prev => ({ ...prev, [type]: list }));
    } else {
      const list = await getDestinationsByName(value);
      setOptions(prev => ({ ...prev, [type]: list }));
    }
  }

  // -------------------------
  // OPTION SELECTOR (FIXED)
  // -------------------------
  const fieldMap = {
    consignor: "consignorId",
    consignee: "consigneeId",
    fromDest: "fromDestinationId",
    toDest: "toDestinationId",
  };

  function selectOption(type, id, label) {
    const field = fieldMap[type];

    setForm(prev => ({
      ...prev,
      [field]: id
    }));

    setSearch(prev => ({
      ...prev,
      [type]: label
    }));

    setOptions(prev => ({
      ...prev,
      [type]: []
    }));
  }

  // -------------------------
  // SUBMIT HANDLER
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

      // number conversions
      packages: toNumOrNull(form.packages),
      netWeight: toNumOrNull(form.netWeight),
      grossWeight: toNumOrNull(form.grossWeight),
      chargeWeight: toNumOrNull(form.chargeWeight),
      rate: toNumOrNull(form.rate),
      freightCharges: toNumOrNull(form.freightCharges),
    };

    console.log("FINAL PAYLOAD:", payload);

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
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">
          {editing ? "Edit Consignment" : "New Consignment"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* CN Number */}
          <div>
            <label>CN Number *</label>
            <input
              name="cnNumber"
              value={form.cnNumber}
              onChange={handleChange}
              className="border w-full px-3 py-2 rounded"
            />
          </div>

          {/* DATE */}
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

          {/* CONSIGNOR / CONSIGNEE */}
          <div className="grid grid-cols-2 gap-4">

            {/* CONSIGNOR */}
            <div className="relative">
              <label>Consignor *</label>
              <input
                value={search.consignor}
                onChange={(e) => handleSearch("consignor", e.target.value)}
                className="border w-full px-3 py-2 rounded"
              />
              {options.consignor.length > 0 && (
                <div className="absolute bg-white border mt-1 w-full shadow rounded z-10">
                  {options.consignor.map(o => (
                    <div
                      key={o.id}
                      onClick={() => selectOption("consignor", o.id, o.companyName)}
                      className="p-2 hover:bg-blue-100 cursor-pointer"
                    >
                      {o.companyName}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CONSIGNEE */}
            <div className="relative">
              <label>Consignee *</label>
              <input
                value={search.consignee}
                onChange={(e) => handleSearch("consignee", e.target.value)}
                className="border w-full px-3 py-2 rounded"
              />
              {options.consignee.length > 0 && (
                <div className="absolute bg-white border mt-1 w-full shadow rounded z-10">
                  {options.consignee.map(o => (
                    <div
                      key={o.id}
                      onClick={() => selectOption("consignee", o.id, o.companyName)}
                      className="p-2 hover:bg-blue-100 cursor-pointer"
                    >
                      {o.companyName}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* FROM / TO DESTINATION */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label>From Destination *</label>
              <input
                value={search.fromDest}
                onChange={(e) => handleSearch("fromDest", e.target.value)}
                className="border w-full px-3 py-2 rounded"
              />
              {options.fromDest.length > 0 && (
                <div className="absolute bg-white border mt-1 w-full shadow rounded z-10">
                  {options.fromDest.map(o => (
                    <div
                      key={o.id}
                      onClick={() => selectOption("fromDest", o.id, o.name)}
                      className="p-2 hover:bg-blue-100 cursor-pointer"
                    >
                      {o.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <label>To Destination *</label>
              <input
                value={search.toDest}
                onChange={(e) => handleSearch("toDest", e.target.value)}
                className="border w-full px-3 py-2 rounded"
              />
              {options.toDest.length > 0 && (
                <div className="absolute bg-white border mt-1 w-full shadow rounded z-10">
                  {options.toDest.map(o => (
                    <div
                      key={o.id}
                      onClick={() => selectOption("toDest", o.id, o.name)}
                      className="p-2 hover:bg-blue-100 cursor-pointer"
                    >
                      {o.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* PKG */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Packages</label>
              <input
                name="packages"
                value={form.packages}
                onChange={handleChange}
                type="number"
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
            ></textarea>
          </div>

          {/* WEIGHTS */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label>Net Weight</label>
              <input
                name="netWeight"
                value={form.netWeight}
                onChange={handleChange}
                type="number"
                className="border w-full px-3 py-2 rounded"
              />
            </div>
            <div>
              <label>Gross Weight</label>
              <input
                name="grossWeight"
                value={form.grossWeight}
                onChange={handleChange}
                type="number"
                className="border w-full px-3 py-2 rounded"
              />
            </div>
            <div>
              <label>Charge Weight</label>
              <input
                name="chargeWeight"
                value={form.chargeWeight}
                onChange={handleChange}
                type="number"
                className="border w-full px-3 py-2 rounded"
              />
            </div>
          </div>

          <div>
            <label>Weight UOM *</label>
            <input
              name="weightUom"
              value={form.weightUom}
              onChange={handleChange}
              className="border w-full px-3 py-2 rounded"
            />
          </div>

          {/* RATE */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Rate</label>
              <input
                name="rate"
                value={form.rate}
                onChange={handleChange}
                type="number"
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

          <div>
            <label>Freight Charges</label>
            <input
              name="freightCharges"
              value={form.freightCharges}
              onChange={handleChange}
              type="number"
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
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate("/consignments")}
              className="px-4 py-2 rounded border"
            >
              Back to List
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded bg-blue-600 text-white"
            >
              {editing ? "Update Consignment" : "Create Consignment"}
            </button>
          </div>

        </form>
      </div>
    </MainLayout>
  );
}
