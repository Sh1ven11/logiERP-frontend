import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    // ❌ Not logged in → redirect to login
    return <Navigate to="/login" replace />;
  }

  // ✅ Logged in → allow access
  return children;
}
