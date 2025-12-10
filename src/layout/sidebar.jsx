import { useState, useContext, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Home,
  Users, // Used for Customers and Lorry Owners (Contacts)
  Truck, // Main Logistics Icon
  FileText,
  Package,
  ListChecks, // Used for Brokers (Contacts)
  LogOut,
  MapPin, // New icon for Destinations
} from "lucide-react";

export default function Sidebar() {
  const { logout } = useContext(AuthContext);

  const [collapsed, setCollapsed] = useState(false);

  // Initialize from localStorage - Added 'contacts' to the state
  const [openMenu, setOpenMenu] = useState(() => {
    const saved = localStorage.getItem("sidebarMenuState");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        // Updated initial state to include 'contacts'
        return { logistics: false, contacts: false };
      }
    }
    // Updated initial state to include 'contacts'
    return { logistics: false, contacts: false };
  });

  // Save menu state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("sidebarMenuState", JSON.stringify(openMenu));
  }, [openMenu]);

  const toggleDropdown = (key) => {
    setOpenMenu((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const mainMenu = [
    { name: "Dashboard", path: "/", icon: <Home size={18} /> },
  ];

  // NEW CONTACTS MENU
  const contactsMenu = [
    { name: "Customers", path: "/customers", icon: <Users size={16} /> },
    { name: "Brokers", path: "/brokers", icon: <ListChecks size={16} /> },
    { name: "Lorry Owners", path: "/lorry-owners", icon: <Truck size={16} /> },
    { name: "Destinations", path: "/destinations", icon: <MapPin size={16} /> },
  ];

  // UPDATED LOGISTICS MENU (Removed Customers and Brokers)
  const logisticsMenu = [
    { name: "Consignments", path: "/consignments", icon: <FileText size={16} /> },
    { name: "Lorry Hire", path: "/lorry-hire", icon: <Truck size={16} /> },
    { name: "Bills", path: "/bills", icon: <Package size={16} /> },
  ];

  return (
    <div
      className={`h-screen bg-gray-900 text-white flex flex-col border-r border-gray-800 transition-all duration-300 overflow-y-auto relative z-50 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Collapse Button */}
      <button
        onClick={() => {
          setCollapsed(!collapsed);
        }}
        className="p-3 hover:bg-gray-800 border-b border-gray-800 flex justify-center"
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* MAIN NAV */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {mainMenu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-md transition ${
                isActive ? "bg-gray-700 text-white" : "hover:bg-gray-800"
              }`
            }
          >
            {item.icon}
            {!collapsed && <span className="text-sm">{item.name}</span>}
          </NavLink>
        ))}

        {/* CONTACTS DROPDOWN (New Dropdown) */}
        <div className="mt-4">
          <button
            onClick={() => toggleDropdown("contacts")}
            className={`w-full flex items-center justify-between p-3 rounded-md transition text-gray-300 hover:text-white hover:bg-gray-800 ${
              openMenu.contacts ? "bg-gray-800 text-white" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <Users size={18} /> {/* Using Users icon for Contacts group */}
              {!collapsed && <span className="text-sm">Contacts</span>}
            </div>

            {!collapsed &&
              (openMenu.contacts ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              ))}
          </button>

          {/* Dropdown Items */}
          {openMenu.contacts && !collapsed && (
            <div className="ml-6 mt-2 border-l border-gray-700 pl-3 space-y-1">
              {contactsMenu.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-2 rounded-md transition ${
                      isActive ? "bg-gray-700" : "hover:bg-gray-800"
                    }`
                  }
                >
                  {item.icon}
                  <span className="text-sm">{item.name}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {/* LOGISTICS DROPDOWN (Updated Content) */}
        <div className="mt-4">
          <button
            onClick={() => toggleDropdown("logistics")}
            className={`w-full flex items-center justify-between p-3 rounded-md transition text-gray-300 hover:text-white hover:bg-gray-800 ${
              openMenu.logistics ? "bg-gray-800 text-white" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <Truck size={18} />
              {!collapsed && <span className="text-sm">Logistics</span>}
            </div>

            {!collapsed &&
              (openMenu.logistics ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              ))}
          </button>

          {/* Dropdown Items */}
          {openMenu.logistics && !collapsed && (
            <div className="ml-6 mt-2 border-l border-gray-700 pl-3 space-y-1">
              {logisticsMenu.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 p-2 rounded-md transition ${
                      isActive ? "bg-gray-700" : "hover:bg-gray-800"
                    }`
                  }
                >
                  {item.icon}
                  <span className="text-sm">{item.name}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* LOGOUT */}
      <button
        onClick={logout}
        className={`p-4 bg-red-600 hover:bg-red-700 text-white font-medium flex items-center justify-center gap-2 ${
          collapsed ? "text-xs" : ""
        }`}
      >
        <LogOut size={16} />
        {!collapsed && "Logout"}
      </button>
    </div>
  );
}