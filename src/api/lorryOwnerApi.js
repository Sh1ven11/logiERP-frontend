import axiosClient from "./authApi.js";
export const getLorryOwners = async (companyId) => {
    // Note the use of 'await'
    const res = await axiosClient.get(`/lorry-owners?companyId=${companyId}`);
    
    // Return the response data directly, simplifying the call in the component
    return res.data;
};
export const createLorryOwner = (data) => {
  return axiosClient.post(`/lorry-owners`, data);
};
export const updateLorryOwner = (id, data) => {
  return axiosClient.put(`/lorry-owners/${id}`, data);
};
export const deleteLorryOwner = (id) => {
  return axiosClient.delete(`/lorry-owners/${id}`);
};