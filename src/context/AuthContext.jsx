import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user on page refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser({ token }); // keep user logged in
    }
  }, []);

  const login = (data) => {
    localStorage.setItem("token", data.access_token);
    setUser({ token: data.access_token }); // set logged-in user
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
