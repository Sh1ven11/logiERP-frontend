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

  const { selectedCompany, selectedFinancialYear } =
    useContext(SettingsContext);
  const navigate = useNavigate();

  // --------------------------------------------------
  // FORM STATE
  // --------------------------------------------------
  const [form, setForm] = useState({
    cnNumber: "",
    date: "",

    consignorId: "",
    consigneeId: "",
    billedToId: "",

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
    remarks: ""
  });

  // --------------------------------------------------
  // AUTOCOMPLETE DISPLAY STATE
  // --------------------------------------------------
  const [search, setSearch] = useState({
    consignor: "",
    consignee: "",
    billedTo: "",
    fromDest: "",
    toDest: ""
  });

  // --------------------------------------------------
  // DEFAULT DATE
  // --------------------------------------------------
  useEffect(() => {
    if (!editing && selectedFinancialYear) {
      setForm(f => ({
        ...f,
        date: selectedFinancialYear.startDate.slice(0, 10)
      }));
    }
  }, [editing, selectedFinancialYear]);

  // --------------------------------------------------
  // LOAD EDIT DATA
  // --------------------------------------------------
  useEffect(() => {
    async function load() {
      if (!editing) return;

      const data = await getConsignmentById(id);

      setForm({
        cnNumber: data.cnNumber,
        date: data.date?.slice(0, 10),

        consignorId: data.consignorId,
        consigneeId: data.consigneeId,
        billedToId: data.billedToId,

        fromDestinationId: data.fromDestinationId,
        toDestinationId: data.toDestinationId,

        packages: data.packages ?? "",
        packageUom: data.packageUom ?? "",
        contents: data.contents ?? "",

        netWeight: data.netWeight ?? "",
        grossWeight: data.grossWeight ?? "",
        chargeWeight: data.chargeWeight ?? "",
        weightUom: data.weightUom ?? "",

        rate: data.rate ?? "",
        rateOn: data.rateOn ?? "",
        remarks: data.remarks ?? ""
      });

      setSearch({
        consignor: data.consignor?.companyName || "",
        consignee: data.consignee?.companyName || "",
        billedTo: data.billedTo?.companyName || "",
        fromDest: data.fromDestination?.name || "",
        toDest: data.toDestination?.name || ""
      });
    }

    load();
  }, [editing, id]);

  // --------------------------------------------------
  // INPUT HANDLER
  // --------------------------------------------------
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------
  const handleSubmit = async e => {
    e.preventDefault();

    if (!form.consignorId || !form.consigneeId || !form.billedToId) {
      alert("Consignor, Consignee and Billed To are required");
      return;
    }

    const toNumOrNull = v =>
      v === "" || v === null || v === undefined ? null : Number(v);

    const payload = {
      ...form,
      companyId: Number(selectedCompany.id),
      branchId: 1,
      financialYearId: Number(selectedFinancialYear.id),

      consignorId: Number(form.consignorId),
      consigneeId: Number(form.consigneeId),
      billedToId: Number(form.billedToId),

      fromDestinationId: Number(form.fromDestinationId),
      toDestinationId: Number(form.toDestinationId),

      packages: toNumOrNull(form.packages),
      netWeight: toNumOrNull(form.netWeight),
      grossWeight: toNumOrNull(form.grossWeight),
      chargeWeight: toNumOrNull(form.chargeWeight),
      rate: toNumOrNull(form.rate)
    };

    if (editing) {
      await updateConsignment(id, payload);
    } else {
      await createConsignment(payload);
    }

    navigate("/consignments");
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <MainLayout>
      <div className="p-3 max-w-6xl mx-auto">
        <h1 className="text-lg font-semibold mb-3">
          {editing ? "Edit Consignment" : "New Consignment"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">

            {/* LEFT COLUMN */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="cnNumber"
                  value={form.cnNumber}
                  onChange={handleChange}
                  placeholder="CN Number"
                  className="border p-2 rounded"
                />
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
              </div>

              {/* CONSIGNOR */}
              <AAutocomplete
                fetchFunction={q =>
                  getCustomersByName(selectedCompany.id, q)
                }
                onSelect={c =>
                  setForm(f => ({ ...f, consignorId: c?.id || "" }))
                }
                initialSearchValue={search.consignor}
                placeholder="Consignor"
              />

              {/* CONSIGNEE (AUTO SET BILLED TO) */}
              <AAutocomplete
                fetchFunction={q =>
                  getCustomersByName(selectedCompany.id, q)
                }
                onSelect={c =>
                  setForm(f => ({
                    ...f,
                    consigneeId: c?.id || "",
                    billedToId: c?.id || ""
                  }))
                }
                initialSearchValue={search.consignee}
                placeholder="Consignee"
              />

              {/* 🔹 BILLED TO (EDITABLE) */}
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Billed To
                </label>
                <AAutocomplete
                  fetchFunction={q =>
                    getCustomersByName(selectedCompany.id, q)
                  }
                  onSelect={c =>
                    setForm(f => ({ ...f, billedToId: c?.id || "" }))
                  }
                  initialSearchValue={search.billedTo}
                  placeholder="Billing Customer"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Defaulted to Consignee, can be changed
                </p>
              </div>

              {/* DESTINATIONS */}
              <div className="grid grid-cols-2 gap-3">
                <AAutocomplete
                  fetchFunction={q => getDestinationsByName(q)}
                  onSelect={d =>
                    setForm(f => ({ ...f, fromDestinationId: d?.id || "" }))
                  }
                  initialSearchValue={search.fromDest}
                  placeholder="From"
                />
                <AAutocomplete
                  fetchFunction={q => getDestinationsByName(q)}
                  onSelect={d =>
                    setForm(f => ({ ...f, toDestinationId: d?.id || "" }))
                  }
                  initialSearchValue={search.toDest}
                  placeholder="To"
                />
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <input name="netWeight" type="number" placeholder="Net Wt" value={form.netWeight} onChange={handleChange} className="border p-2 rounded" />
                <input name="grossWeight" type="number" placeholder="Gross Wt" value={form.grossWeight} onChange={handleChange} className="border p-2 rounded" />
                <input name="chargeWeight" type="number" placeholder="Charge Wt" value={form.chargeWeight} onChange={handleChange} className="border p-2 rounded" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <input name="weightUom" placeholder="Wt UOM" value={form.weightUom} onChange={handleChange} className="border p-2 rounded" />
                <input name="rate" type="number" placeholder="Rate" value={form.rate} onChange={handleChange} className="border p-2 rounded" />
                <input name="rateOn" placeholder="Rate On" value={form.rateOn} onChange={handleChange} className="border p-2 rounded" />
              </div>

              <textarea name="contents" placeholder="Contents" rows={2} value={form.contents} onChange={handleChange} className="border p-2 rounded" />
              <textarea name="remarks" placeholder="Remarks" rows={2} value={form.remarks} onChange={handleChange} className="border p-2 rounded" />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <button type="button" onClick={() => navigate("/consignments")} className="border px-4 py-2 rounded">
              Back
            </button>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
              {editing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
