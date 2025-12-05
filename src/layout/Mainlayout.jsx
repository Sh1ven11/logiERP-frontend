import Sidebar from "./sidebar.jsx";
import Navbar from "./Navbar.jsx";

export default function MainLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <Navbar />

        {/* Main Content */}
        <div className="p-6 bg-gray-100 min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}
