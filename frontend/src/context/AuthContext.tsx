"use client";

import * as React from "react";
import { User } from "@/types/user";
import { authService } from "@/services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadUser() {
      if (typeof window !== "undefined") {
        const storedToken = localStorage.getItem("zoom_token");
        const storedUser = localStorage.getItem("zoom_user");

        if (storedToken && storedUser) {
          try {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            const currentUser = await authService.getMe();
            setUser(currentUser);
            localStorage.setItem("zoom_user", JSON.stringify(currentUser));
          } catch (err) {
            console.error("Token verification failed:", err);
            localStorage.removeItem("zoom_token");
            localStorage.removeItem("zoom_user");
            setToken(null);
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("zoom_token", newToken);
      localStorage.setItem("zoom_user", JSON.stringify(newUser));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("zoom_token");
      localStorage.removeItem("zoom_user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
