import { useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Home,
  Users,
  Truck,
  FileText,
  Package,
  ListChecks,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const { logout } = useContext(AuthContext);

  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState({
    logistics: false,
  });

  const toggleDropdown = (key) => {
    setOpenMenu((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const mainMenu = [
    { name: "Dashboard", path: "/", icon: <Home size={18} /> },
  ];

  const logisticsMenu = [
    { name: "Customers", path: "/customers", icon: <Users size={16} /> },
    { name: "Brokers", path: "/brokers", icon: <ListChecks size={16} /> },
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
          if (collapsed === false) {
            // if collapsing, close all dropdowns
            setOpenMenu({ logistics: false });
          }
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

        {/* LOGISTICS DROPDOWN */}
        <div className="mt-4">
          <button
            onClick={() => toggleDropdown("logistics")}
            className={`w-full flex items-center justify-between p-3 hover:bg-gray-800 rounded-md transition ${
              openMenu.logistics ? "bg-gray-800" : ""
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
