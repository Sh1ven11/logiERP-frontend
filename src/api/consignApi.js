import axiosClient from "./authApi.js";

export const getConsignments = async (filters = {}) => {
  const res = await axiosClient.get("/consignments/search", { params: filters });
  console.log("Fetched consignments:", res.data); // DEBUG
  return res.data;
}
export const deleteConsignment = async (id) => {
  const res = await axiosClient.delete(`/consignments/${id}`);
  return res.data;
}
export const createConsignment = async (data) => {
  const res = await axiosClient.post("/consignments", data);
  return res.data;
}
export const updateConsignment = async (id, data) => {
  const res = await axiosClient.patch(`/consignments/${id}`, data);
  return res.data;
}
export const getConsignment = async (id) => {
  const res = await axiosClient.get(`/consignments`);
  return res.data;
} 