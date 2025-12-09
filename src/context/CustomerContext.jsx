import { createContext, useState, useCallback } from "react";
import * as custApi from "../api/custApi.js";

export const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCustomers = useCallback(async (companyId) => {
    setLoading(true);
    try {
      const data = await custApi.getCustomers(companyId);
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGroups = useCallback(async (companyId) => {
    setLoading(true);
    try {
      const data = await custApi.getCustomerGroups(companyId);
      setGroups(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCustomer = useCallback(async (customerData) => {
    try {
      console.log("[CustomerContext] Creating customer with data:", customerData);
      const newCustomer = await custApi.createCustomer(customerData);
      console.log("[CustomerContext] Customer created, response:", newCustomer);
      setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
      return newCustomer;
    } catch (err) {
      console.error("[CustomerContext] Create customer error:", err);
      setError(err.message);
      throw err;
    }
  }, []);

  const updateCustomer = useCallback(async (customerId, customerData) => {
    try {
      const updated = await custApi.updateCustomer(customerId, customerData);
      setCustomers(prevCustomers => prevCustomers.map(c => c.id === customerId ? updated : c));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const deleteCustomer = useCallback(async (customerId) => {
    try {
      await custApi.deleteCustomer(customerId);
      setCustomers(prevCustomers => prevCustomers.filter(c => c.id !== customerId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const createGroup = useCallback(async (groupData) => {
    try {
      const newGroup = await custApi.createCustomerGroup(groupData);
      setGroups([...groups, newGroup]);
      return newGroup;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [groups]);

  const updateGroup = useCallback(async (groupId, groupData) => {
    try {
      const updated = await custApi.updateCustomerGroup(groupId, groupData);
      setGroups(groups.map(g => g.id === groupId ? updated : g));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [groups]);

  const deleteGroup = useCallback(async (groupId) => {
    try {
      await custApi.deleteCustomerGroup(groupId);
      setGroups(groups.filter(g => g.id !== groupId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [groups]);

  const addCustomersToGroup = useCallback(async (groupId, customerIds) => {
    try {
      await custApi.addCustomersToGroup(groupId, customerIds);
      // After successfully adding customers to group, re-fetch customers to update their groupId
      // This way the UI immediately reflects the group assignment
      const currentCompanyId = customers.length > 0 ? customers[0].companyId : null;
      if (currentCompanyId) {
        await fetchCustomers(currentCompanyId);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [customers, fetchCustomers]);

  const removeCustomerFromGroup = useCallback(async (groupId, customerId) => {
    try {
      await custApi.removeCustomerFromGroup(groupId, customerId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  return (
    <CustomerContext.Provider
      value={{
        customers,
        groups,
        loading,
        error,
        fetchCustomers,
        fetchGroups,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        createGroup,
        updateGroup,
        deleteGroup,
        addCustomersToGroup,
        removeCustomerFromGroup,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};