import axiosClient from "./authApi.js";

export const createLorryHire = async (data) => {
  const res = await axiosClient.post("/lorry-hire", data);
  return res.data;
};

export const getLorryHires = async (filters = {}) => {
  const res = await axiosClient.get("/lorry-hire", { params: filters });
  return res.data;
};

export const getLorryHire = async (id) => {
  const res = await axiosClient.get(`/lorry-hire/${id}`);
  return res.data;
};

export const updateLorryHire = async (id, data) => {
  const res = await axiosClient.patch(`/lorry-hire/${id}`, data);
  return res.data;
};

export const deleteLorryHire = async (id) => {
  const res = await axiosClient.delete(`/lorry-hire/${id}`);
  return res.data;
};

export const addLorryHireConsignments = async (id, consignmentIds) => {
  const res = await axiosClient.post(`/lorry-hire/${id}/consignments`, {
    consignmentIds,
  });
  return res.data;
};

export const removeLorryHireConsignment = async (id, cnId) => {
  const res = await axiosClient.delete(`/lorry-hire/${id}/consignments/${cnId}`);
  return res.data;
};

export const settleLorryHire = async (id, paymentDate) => {
  const res = await axiosClient.post(`/lorry-hire/${id}/settle`, {
    paymentDate,
  });
  return res.data;
};




