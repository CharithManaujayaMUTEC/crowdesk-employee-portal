"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { PortalUser } from "@/lib/types";

type AuthContextValue = {
  user: PortalUser | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const TOKEN_KEY = "crowdesk.session.token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const activeToken = token || sessionStorage.getItem(TOKEN_KEY);
    if (!activeToken) return;
    const payload = await api<{ user?: PortalUser }>("/me", {}, activeToken);
    if (!payload.user) throw new Error("The API returned an invalid user response.");
    setUser(payload.user);
    setToken(activeToken);
  }, [token]);

  useEffect(() => {
    const saved = sessionStorage.getItem(TOKEN_KEY);
    if (!saved) {
      setReady(true);
      return;
    }
    setToken(saved);
    api<{ user?: PortalUser }>("/me", {}, saved)
      .then((payload) => {
        if (!payload.user) throw new Error("Invalid session response.");
        setUser(payload.user);
      })
      .catch(() => clearSession())
      .finally(() => setReady(true));

    const onUnauthorized = () => clearSession();
    window.addEventListener("crowdesk:unauthorized", onUnauthorized);
    return () => window.removeEventListener("crowdesk:unauthorized", onUnauthorized);
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const payload = await api<{ token?: string; user?: PortalUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim(), password })
    });
    if (!payload.token || !payload.user) throw new Error("The API returned an invalid login response.");
    sessionStorage.setItem(TOKEN_KEY, payload.token);
    setToken(payload.token);
    setUser(payload.user);
  }, []);

  const logout = useCallback(async () => {
    const activeToken = token || sessionStorage.getItem(TOKEN_KEY);
    try {
      if (activeToken) await api("/auth/logout", { method: "POST" }, activeToken);
    } finally {
      clearSession();
    }
  }, [token, clearSession]);

  const value = useMemo(() => ({ user, token, ready, login, logout, refreshUser }), [user, token, ready, login, logout, refreshUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider.");
  return value;
}
