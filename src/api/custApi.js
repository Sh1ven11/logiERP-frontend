import axiosClient from "./authApi.js";

// CUSTOMER CRUD
export const createCustomer = async (customerData) => {
  const res = await axiosClient.post("/customers", customerData);
  return res.data;
};

export const getCustomers = async (companyId) => {
  const res = await axiosClient.get("/customers", {
    params: { companyId },
  });
  return res.data;
};

export const getCustomerById = async (customerId) => {
  const res = await axiosClient.get(`/customers/${customerId}`);
  return res.data;
};

export const updateCustomer = async (customerId, customerData) => {
  const res = await axiosClient.patch(`/customers/${customerId}`, customerData);
  return res.data;
};

export const deleteCustomer = async (customerId) => {
  const res = await axiosClient.delete(`/customers/${customerId}`);
  return res.data;
};

// CUSTOMER GROUP OPERATIONS
export const createCustomerGroup = async (groupData) => {
  const res = await axiosClient.post("/customer-groups", groupData);
  return res.data;
};

export const getCustomerGroups = async (companyId) => {
  const res = await axiosClient.get("/customer-groups", {
    params: { companyId },
  });
  return res.data;
};

export const getCustomersInGroup = async (groupId) => {
  const res = await axiosClient.get(`/customer-groups/${groupId}/customers`);
  return res.data;
};

export const updateCustomerGroup = async (groupId, groupData) => {
  const res = await axiosClient.patch(`/customer-groups/${groupId}`, groupData);
  return res.data;
};

export const deleteCustomerGroup = async (groupId) => {
  const res = await axiosClient.delete(`/customer-groups/${groupId}`);
  return res.data;
};

export const addCustomersToGroup = async (groupId, customerIds) => {
  const res = await axiosClient.patch(
    `/customer-groups/${groupId}/add-customers`,
    { customerIds }
  );
  return res.data;
};

export const removeCustomerFromGroup = async (groupId, customerId) => {
  const res = await axiosClient.patch(
    `/customer-groups/${groupId}/remove-customer/${customerId}`
  );
  return res.data;
};