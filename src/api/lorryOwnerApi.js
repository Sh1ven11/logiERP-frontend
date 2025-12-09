import axiosClient from "./authApi.js";
export const getLorryOwners = (companyId) => {
  return axiosClient.get(`/lorry-owners?companyId=${companyId}`);
};
