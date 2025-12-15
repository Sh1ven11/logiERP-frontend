import axiosClient from "./authApi.js";

/* ----------------------------------------------------
   SEARCH CNs
---------------------------------------------------- */
export const getConsignments = async (filters = {}) => {
  const res = await axiosClient.get("/consignments/search", { params: filters });
  return res.data;
};

/* ----------------------------------------------------
   NORMAL LIST (company + FY)
---------------------------------------------------- */
export const getAllConsignments = async (companyId, financialYearId) => {
  const res = await axiosClient.get("/consignments", {
    params: { companyId, financialYearId },
  });
  return res.data;
};

/* ----------------------------------------------------
   GET ONE CN
---------------------------------------------------- */
export const getConsignmentById = async (id) => {
  const res = await axiosClient.get(`/consignments/${id}`);
  return res.data;
};

/* ----------------------------------------------------
   DELETE CN
---------------------------------------------------- */
export const deleteConsignment = async (id) => {
  const res = await axiosClient.delete(`/consignments/${id}`);
  return res.data;
};

/* ----------------------------------------------------
   CREATE CN
---------------------------------------------------- */
export const createConsignment = async (data) => {
  // Auto-convert IDs if needed
  const payload = {
    ...data,
    companyId: Number(data.companyId),
    financialYearId: Number(data.financialYearId),
    branchId: Number(data.branchId),
    consignorId: Number(data.consignorId),
    consigneeId: Number(data.consigneeId),
    fromDestinationId: Number(data.fromDestinationId),
    toDestinationId: Number(data.toDestinationId),
  };

  const res = await axiosClient.post("/consignments", payload);
  return res.data;
};

/* ----------------------------------------------------
   UPDATE CN
---------------------------------------------------- */
export const updateConsignment = async (id, data) => {
  const payload = {
    ...data,
    companyId: Number(data.companyId),
    financialYearId: Number(data.financialYearId),
    branchId: Number(data.branchId),
    consignorId: Number(data.consignorId),
    consigneeId: Number(data.consigneeId),
    fromDestinationId: Number(data.fromDestinationId),
    toDestinationId: Number(data.toDestinationId),
  };

  const res = await axiosClient.patch(`/consignments/${id}`, payload);
  return res.data;
};
