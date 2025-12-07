import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Check token validity
  const isExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // Load user on page refresh
  useEffect(() => {
    const access = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");

    if (!access || !refresh) {
      logout();
      return;
    }

    if (isExpired(access)) {
      // Do NOT decode expired token
      console.log("Access token expired on load → waiting for axios to refresh");
      return; // Axios interceptor will refresh token automatically if needed
    }

    try {
      const decoded = jwtDecode(access);
      setUser({
        id: decoded.sub,
        username: decoded.username,
      });
      localStorage.setItem("userId", decoded.sub);
    } catch {
      logout();
    }
  }, []);

  // LOGIN
  const login = (data) => {
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);

    const decoded = jwtDecode(data.access_token);
    localStorage.setItem("userId", decoded.sub);

    setUser({
      id: decoded.sub,
      username: decoded.username,
    });
  };

  // LOGOUT
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
