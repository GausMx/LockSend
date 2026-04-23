import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // checking persisted session on mount

  // On app load, restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem("locksend_token");
    if (token) {
      api.get("/api/auth/me")
        .then((data) => setUser(data.user))
        .catch(() => {
          // Token invalid/expired — clear it
          localStorage.removeItem("locksend_token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("locksend_token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("locksend_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
