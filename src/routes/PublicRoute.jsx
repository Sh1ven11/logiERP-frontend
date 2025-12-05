import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

export default function PublicRoute({ children }) {
  const { user } = useContext(AuthContext);

  if (user) {
    // Logged in → redirect to dashboard
    return <Navigate to="/" replace />;
  }

  return children;
}
