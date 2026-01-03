"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, authStorage, StoredUser } from "@/shared/api";

interface AuthContextType {
  user: StoredUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loginAction: (email: string, password: string) => Promise<void>;
  registerAction: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = authStorage.getUser();
    const storedToken = authStorage.getToken();

    if (storedUser && storedToken) {
      setUser(storedUser);
      authApi
        .getMe()
        .then((res) => {
          setUser(res.user);
          authStorage.setUser(res.user);
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const loginAction = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    setUser(response.user);
    authStorage.setToken(response.token);
    authStorage.setRefreshToken(response.refreshToken);
    authStorage.setUser(response.user);
  };

  const registerAction = async (email: string, password: string, name: string) => {
    const response = await authApi.register({ name, email, password });
    setUser(response.user);
    authStorage.setToken(response.token);
    authStorage.setRefreshToken(response.refreshToken);
    authStorage.setUser(response.user);
  };

  const logout = () => {
    setUser(null);
    authStorage.clear();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === "ADMIN",
    loginAction,
    registerAction,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
