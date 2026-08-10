"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api, errorMessage } from "./api";
import type { AuthResponse, User } from "./types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "tp_token";
const USER_KEY = "tp_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_KEY);
    const storedUser = window.localStorage.getItem(USER_KEY);
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        window.localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const persist = useCallback((res: AuthResponse) => {
    window.localStorage.setItem(TOKEN_KEY, res.access_token);
    window.localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);
      const { data } = await api.post<AuthResponse>("/api/auth/token", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      persist(data);
    },
    [persist]
  );

  const register = useCallback(
    async (data: { name: string; email: string; password: string }) => {
      await api.post("/api/auth/register", data);
      await login(data.email, data.password);
    },
    [login]
  );

  const demoLogin = useCallback(async () => {
    try {
      await login("demo@talentpulse.app", "demo1234");
    } catch (e) {
      throw new Error(errorMessage(e, "Connexion démo impossible"));
    }
  }, [login]);

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    router.push("/");
  }, [router]);

  const updateUser = useCallback((u: User) => {
    setUser(u);
    window.localStorage.setItem(USER_KEY, JSON.stringify(u));
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, demoLogin, logout, updateUser }),
    [user, token, loading, login, register, demoLogin, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
