"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { User } from "@supabase/supabase-js";
import type { UserProfile, UserRole } from "@/types";
import type { AccountUpdateResult } from "@/lib/accountSecurity";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  canEdit: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  getAccessToken: () => Promise<string | null>;
  changeEmail: (email: string, currentPassword: string) => Promise<AccountUpdateResult>;
  verifyEmailChange: (requestId: string, code: string) => Promise<AccountUpdateResult>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AccountUpdateResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Determinar rol y estado de administrador
  const role: UserRole = useMemo(() => {
    if (profile?.id === user?.id && (profile?.role === "admin" || profile?.role === "editor")) return profile.role;
    if (user?.app_metadata?.role === "admin" || user?.app_metadata?.role === "editor") return user.app_metadata.role;
    return "customer";
  }, [profile, user]);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);
  const isAdmin = useMemo(() => role === "admin", [role]);
  const canEdit = useMemo(() => isAuthenticated && (role === "admin" || role === "editor"), [isAuthenticated, role]);

  // El servidor SQLite es la autoridad del perfil y del rol.
  const resolveProfile = useCallback(async (currentUser: User): Promise<UserProfile> => ({ id: currentUser.id, full_name: String(currentUser.user_metadata?.full_name || "Usuario CONLAC-T"), role: currentUser.app_metadata?.role === "admin" ? "admin" : currentUser.app_metadata?.role === "editor" ? "editor" : "customer", is_active: true, email: currentUser.email, created_at: currentUser.created_at }), []);

  // Inicializar sesión al cargar la aplicación
  useEffect(() => {
   const controller = new AbortController();
   const refresh = async () => {
     try {
       const response = await fetch("/api/auth/session", { cache: "no-store", credentials: "same-origin", signal: controller.signal });
       if (!response.ok) return;
       const result = await response.json();
       if (controller.signal.aborted) return;
       setUser(result.session?.user ?? null);
       setProfile(result.session?.profile ?? null);
     } catch { /* Conservar la sesion cargada si hay un fallo temporal de red. */ }
     finally { if (!controller.signal.aborted) setLoading(false); }
   };
   void refresh();
   const onRefresh = () => { void refresh(); };
   window.addEventListener("focus", onRefresh);
   window.addEventListener("conlact:auth-updated", onRefresh);
   return () => { controller.abort(); window.removeEventListener("focus", onRefresh); window.removeEventListener("conlact:auth-updated", onRefresh); };
 }, []);

  // Inicio de sesión con credenciales y cookie HttpOnly del servidor SQLite.
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
   setLoading(true);
   try {
     const response = await fetch("/api/auth/login", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
     const result = await response.json();
     if (!response.ok || !result.success) return { success: false, error: result.error || "No se pudo iniciar sesion." };
     setUser(result.user); setProfile(result.profile || await resolveProfile(result.user));
     return { success: true };
   } catch { return { success: false, error: "No se pudo conectar con el servidor de acceso." }; }
   finally { setLoading(false); }
 }, [resolveProfile]);

  // Registro de usuario
  const register = useCallback(async (): Promise<{ success: boolean; error?: string }> => ({ success: false, error: "La creacion publica de cuentas esta deshabilitada." }), []);

  // Cerrar sesión
  const logout = useCallback(async () => {
   try { await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: "{}" }); }
   finally { setUser(null); setProfile(null); }
 }, []);

  // Recuperación de contraseña (envío directo por SMTP al correo del usuario)
  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
   try {
     const response = await fetch("/api/auth/recuperar-password", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "request", email }) });
     const result = await response.json();
     return { success: response.ok && result.success, error: result.error };
   } catch { return { success: false, error: "No se pudo solicitar el codigo." }; }
 }, []);

  // Actualizar credenciales sin desmontar la pantalla de cuenta.
  const changeEmail = useCallback(async (email: string, currentPassword: string): Promise<AccountUpdateResult> => {
   try {
     const response = await fetch("/api/auth/cambiar-correo", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "request", email, currentPassword }) });
     const result = await response.json();
     if (!response.ok || !result.success) return { success: false, error: result.error || "No se pudo enviar el código.", retryAfter: Number(response.headers.get("Retry-After")) || undefined };
     return { success: true, requiresConfirmation: true, message: result.message, requestId: result.requestId, expiresIn: result.expiresIn, resendAfter: result.resendAfter };
   } catch { return { success: false, error: "No se pudo conectar con el servidor." }; }
 }, []);

  const verifyEmailChange = useCallback(async (requestId: string, code: string): Promise<AccountUpdateResult> => {
    try {
      const response = await fetch("/api/auth/cambiar-correo", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "verify", requestId, code }) });
      const result = await response.json();
      if (!response.ok || !result.success) return { success: false, error: result.error || "No se pudo verificar el correo." };
      setUser(result.user); setProfile(result.profile);
      return { success: true, message: result.message };
    } catch { return { success: false, error: "No se pudo conectar con el servidor." }; }
  }, []);

  const changePassword = useCallback(async (): Promise<AccountUpdateResult> => ({ success: false, error: "Usa el flujo de codigo de seis digitos en /recuperar-password." }), []);

  // Interfaz conservada para consumidores anteriores; la sesión SQLite usa cookie.
  const getAccessToken = useCallback(async (): Promise<string | null> => null, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAuthenticated,
        isAdmin,
        canEdit,
        loading,
        login,
        register,
        logout,
        resetPassword,
        getAccessToken,
        changeEmail,
        verifyEmailChange,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser utilizado dentro de un <AuthProvider>");
  }
  return context;
}
