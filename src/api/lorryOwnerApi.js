import axiosClient from "./authApi.js";
export const getLorryOwnersByName = async (companyId, query) => {
  try {
    const res = await axiosClient.get('/lorry-owners/search', {
      params: {
        companyId,
        query,
      },
    });

    return res.data;
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err.message ||
      'Failed to fetch lorry owners by name';

    throw new Error(message);
  }
};

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
  return axiosClient.patch(`/lorry-owners/${id}`, data);
};
export const deleteLorryOwner = (id) => {
  return axiosClient.delete(`/lorry-owners/${id}`);
};