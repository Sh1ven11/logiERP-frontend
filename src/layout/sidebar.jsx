import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Sidebar() {
  const { logout } = useContext(AuthContext);

  const menuItems = [
    { name: "Dashboard", path: "/" },
    { name: "Customers", path: "/customers" },
    { name: "Consignments", path: "/consignments" },
    { name: "Lorry Hire", path: "/lorry-hire" },
  ];

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 text-xl font-bold border-b border-gray-700">
        ERP System
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block p-3 rounded-md mb-2 ${
                isActive ? "bg-gray-700" : "hover:bg-gray-800"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="p-4 bg-red-600 hover:bg-red-700 text-white font-semibold"
      >
        Logout
      </button>
    </div>
  );
}
