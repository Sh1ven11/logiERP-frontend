import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/Login/LoginPage.jsx";
import DashboardPage from "../pages/Dashboard/DashboardPage.jsx";
import CustomersPage from "../pages/Functions/CustomersPage.jsx";
import ConsignmentsPage from "../pages/Functions/ConsignmentsPage.jsx";
import LorryHirePage from "../pages/Functions/LorryHirePage.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import PublicRoute from "./PublicRoute.jsx";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public route — redirect to dashboard if already logged in */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Protected route — must be logged in */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
        <Route path="/consignments" element={<ProtectedRoute><ConsignmentsPage /></ProtectedRoute>} />
        <Route path="/lorry-hire" element={<ProtectedRoute><LorryHirePage /></ProtectedRoute>} />


      </Routes>
    </BrowserRouter>
  );
}
