import Sidebar from "./sidebar.jsx";
import Navbar from "./Navbar.jsx";

export default function MainLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar - Sticky */}
        <div className="sticky top-0 z-50">
          <Navbar />
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
}
