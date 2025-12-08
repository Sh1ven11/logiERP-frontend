import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/Login/LoginPage.jsx";
import DashboardPage from "../pages/Dashboard/DashboardPage.jsx";
import CustomersPage from "../pages/Functions/CustomersPage.jsx";
import ConsignmentsPage from "../pages/Functions/ConsignmentsPage.jsx";
import LorryHireList from "../pages/Functions/LorryHirePage/LorryPageList.jsx";
import BrokersPage from "../pages/Functions/BrokersPage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import PublicRoute from "./PublicRoute.jsx";
import BillsPage from "../pages/Functions/BillsPage.jsx";
import LorryHireCreate from "../pages/Functions/LorryHirePage/LorryHireCreate.jsx";
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public route — redirect to dashboard if already logged in */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>}/>
        <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
        <Route path="/brokers" element={<ProtectedRoute><BrokersPage /></ProtectedRoute>} />

        <Route path="/consignments" element={<ProtectedRoute><ConsignmentsPage /></ProtectedRoute>} />
        <Route path="/lorry-hire/create" element={<ProtectedRoute><LorryHireCreate /></ProtectedRoute>} />
        <Route path="/lorry-hire/edit/:id" element={<ProtectedRoute><LorryHireCreate /></ProtectedRoute>} />

        <Route path="/lorry-hire" element={<ProtectedRoute><LorryHireList /></ProtectedRoute>} />
        <Route path="/bills" element={<ProtectedRoute><BillsPage /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />


      </Routes>
    </BrowserRouter>
  );
}
