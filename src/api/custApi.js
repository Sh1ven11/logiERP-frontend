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
  console.log("Fetched customers:", res.data); // DEBUG
  return res.data;
};
export const getCustomersByName = async (companyId, query = '') => {
    // We call the search endpoint, passing the query parameter.
    // Assuming the backend filters by name/companyName when the 'query' is provided.
    const res = await axiosClient.get(`/customers/search`, {
        params: {
            companyId: companyId,
            query: query // Assuming backend DTO 'SearchDestinationDto' accepts a 'query' for name search
        }
    });
    
    // The backend should return the small, filtered list (e.g., 20 items)
    return res.data;
};

export const getCustomerById = async (customerId) => {
  // We call the search endpoint, passing the customerId as a query parameter.
  // Assuming the backend can search by 'code' which matches the 'customerId'.
  const res = await axiosClient.get(`/customers/search`, {
    params: {
      code: customerId // Change this query key if the backend uses 'query' or 'name' for ID lookup
    }
  });

  // The search endpoint usually returns an ARRAY of results.
  // We need to check if the array is not empty and return the first element.
  if (res.data && res.data.length > 0) {
    return res.data[0];
  }

  // If no customer is found, return null or throw an error
  throw new Error(`Customer with ID ${customerId} not found.`);
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