import axiosClient from "./authApi.js";
export const getBrokers = (companyId) => {
  return axiosClient.get(`/brokers?companyId=${companyId}`);
};