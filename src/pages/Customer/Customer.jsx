import { useState, useContext, useEffect } from "react";
import { SettingsContext } from "../../context/SettingsContext.jsx";
import { CustomerContext, CustomerProvider } from "../../context/CustomerContext.jsx";
import Mainlayout from "../../layout/Mainlayout.jsx";
import CustomerList from "./CustomerList.jsx";
import GroupList from "./GroupList.jsx";
import CustomerForm from "./CustomerForm.jsx";
import GroupForm from "./GroupForm.jsx";

const CustomerContent = () => {
  const { selectedCompany } = useContext(SettingsContext);
  const { fetchCustomers, fetchGroups } = useContext(CustomerContext);
  const [activeTab, setActiveTab] = useState("customers");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (selectedCompany?.id) {
      fetchCustomers(selectedCompany.id);
      fetchGroups(selectedCompany.id);
    }
  }, [selectedCompany?.id, fetchCustomers, fetchGroups]);

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
                  <CustomerList />
                ) : (
                  <GroupList />
                )}
              </>
            ) : activeTab === "customers" ? (
              <CustomerForm onClose={() => setShowForm(false)} />
            ) : (
              <GroupForm onClose={() => setShowForm(false)} />
            )}
          </div>
        </div>
      </div>
    </Mainlayout>
  );
};

const Customer = () => (
  <CustomerProvider>
    <CustomerContent />
  </CustomerProvider>
);

export default Customer;