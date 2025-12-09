import { useState, useContext, useEffect } from "react";
import { SettingsContext } from "../../context/SettingsContext.jsx";
import * as custApi from "../../api/custApi.js";
import Mainlayout from "../../layout/Mainlayout.jsx";
import CustomerList from "./CustomerList.jsx";
import GroupList from "./GroupList.jsx";
import CustomerForm from "./CustomerForm.jsx";
import GroupForm from "./GroupForm.jsx";

const CustomerContent = () => {
  const { selectedCompany } = useContext(SettingsContext);
  const [activeTab, setActiveTab] = useState("customers");
  const [showForm, setShowForm] = useState(false);
  
  // State for customers and groups
  const [customers, setCustomers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch customers
  const fetchCustomers = async (companyId) => {
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
  };

  // Fetch groups
  const fetchGroups = async (companyId) => {
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
  };

  // Create customer
  const createCustomer = async (customerData) => {
    try {
      const newCustomer = await custApi.createCustomer(customerData);
      setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
      return newCustomer;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update customer
  const updateCustomer = async (customerId, customerData) => {
    try {
      const updated = await custApi.updateCustomer(customerId, customerData);
      setCustomers(prevCustomers => prevCustomers.map(c => c.id === customerId ? updated : c));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete customer
  const deleteCustomer = async (customerId) => {
    try {
      await custApi.deleteCustomer(customerId);
      setCustomers(prevCustomers => prevCustomers.filter(c => c.id !== customerId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Create group
  const createGroup = async (groupData) => {
    try {
      const newGroup = await custApi.createCustomerGroup(groupData);
      setGroups(prevGroups => [...prevGroups, newGroup]);
      return newGroup;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Update group
  const updateGroup = async (groupId, groupData) => {
    try {
      const updated = await custApi.updateCustomerGroup(groupId, groupData);
      setGroups(prevGroups => prevGroups.map(g => g.id === groupId ? updated : g));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete group
  const deleteGroup = async (groupId) => {
    try {
      await custApi.deleteCustomerGroup(groupId);
      setGroups(prevGroups => prevGroups.filter(g => g.id !== groupId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Add customers to group
  const addCustomersToGroup = async (groupId, customerIds) => {
    try {
      await custApi.addCustomersToGroup(groupId, customerIds);
      // Re-fetch customers to get updated groupId
      if (selectedCompany?.id) {
        await fetchCustomers(selectedCompany.id);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Remove customer from group
  const removeCustomerFromGroup = async (groupId, customerId) => {
    try {
      await custApi.removeCustomerFromGroup(groupId, customerId);
      setCustomers(prevCustomers => 
        prevCustomers.map(c => c.id === customerId ? { ...c, groupId: null } : c)
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Fetch data when company changes
  useEffect(() => {
    if (selectedCompany?.id) {
      fetchCustomers(selectedCompany.id);
      fetchGroups(selectedCompany.id);
    }
  }, [selectedCompany?.id]);

  return (
    <Mainlayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white-900">Customers</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your customers and customer groups</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveTab("customers");
                  setShowForm(false);
                }}
                className={`px-6 py-2 font-medium text-sm rounded-full transition ${
                  activeTab === "customers"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-500 border border-gray-200 hover:text-gray-700"
                }`}
              >
                Customers
              </button>
              <button
                onClick={() => {
                  setActiveTab("groups");
                  setShowForm(false);
                }}
                className={`px-6 py-2 font-medium text-sm rounded-full transition ${
                  activeTab === "groups"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-500 border border-gray-200 hover:text-gray-700"
                }`}
              >
                Groups
              </button>
            </div>
          </div>

          <div className="p-8">
            {!showForm ? (
              <>
                <button
                  onClick={() => setShowForm(true)}
                  className="mb-8 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium"
                >
                  {activeTab === "customers" ? "+ Add Customer" : "+ Create Group"}
                </button>
                {activeTab === "customers" ? (
                  <CustomerList 
                    customers={customers}
                    loading={loading}
                    deleteCustomer={deleteCustomer}
                  />
                ) : (
                  <GroupList 
                    groups={groups}
                    loading={loading}
                    deleteGroup={deleteGroup}
                    addCustomersToGroup={addCustomersToGroup}
                    customers={customers}
                  />
                )}
              </>
            ) : activeTab === "customers" ? (
              <CustomerForm 
                onClose={() => setShowForm(false)}
                createCustomer={createCustomer}
                updateCustomer={updateCustomer}
                customers={customers}
                fetchCustomers={fetchCustomers}
              />
            ) : (
              <GroupForm 
                onClose={() => setShowForm(false)}
                createGroup={createGroup}
              />
            )}
          </div>
        </div>
      </div>
    </Mainlayout>
  );
};

const Customer = () => <CustomerContent />;

export default Customer;