import axiosClient from "./authApi.js";

export const getConsignments = async (filters = {}) => {
  const res = await axiosClient.get("/consignments/search", { params: filters });
  return res.data;
}