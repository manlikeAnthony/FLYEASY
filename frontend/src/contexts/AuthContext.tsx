import React, { createContext, useContext, useEffect, useState } from "react";

type User = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

type AuthContextValue = {
  user: User | null;
  setUser: (u: User | null) => void;
  clearAuth: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem("fe_user");
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });
  useEffect(() => {
    const onLogout = () => {
      setUser(null);
      localStorage.removeItem("fe_user");
      try {
        window.location.assign("/login");
      } catch (e) {
        /* ignore */
      }
    };

    window.addEventListener("logout", onLogout);
    return () => window.removeEventListener("logout", onLogout);
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("fe_user", JSON.stringify(user));
    else localStorage.removeItem("fe_user");
  }, [user]);

  const clearAuth = () => {
    setUser(null);
    localStorage.removeItem("fe_user");
    try {
      window.location.assign("/login");
    } catch (e) {
      /* ignore */
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;
