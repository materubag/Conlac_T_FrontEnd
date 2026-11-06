"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { siteConfig } from "@/lib/config";
import type { UserProfile, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_SESSION_KEY = "conlact_auth_session";
function isSupabaseConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) return false;
  if (key.includes("aquí_tu_clave_anon") || key.includes("dummy-anon-key") || key.length < 30) {
    return false;
  }
  return true;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Determinar rol y estado de administrador
  const role: UserRole = useMemo(() => {
    if (profile?.role === "admin") return "admin";
    if (user?.app_metadata?.role === "admin") return "admin";

    return "customer";
  }, [profile, user]);

  const isAuthenticated = useMemo(() => Boolean(user), [user]);
  const isAdmin = useMemo(() => role === "admin", [role]);

  // Cargar perfil desde Supabase o construir perfil a partir del usuario
  const resolveProfile = useCallback(async (currentUser: User): Promise<UserProfile> => {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            full_name: data.full_name || currentUser.user_metadata?.full_name || "Usuario CONLAC-T",
            role: data.role === "admin" ? "admin" : "customer",
            is_active: data.is_active ?? true,
            email: currentUser.email,
            created_at: data.created_at,
            updated_at: data.updated_at,
          };
        }
      } catch {
        // Si la tabla no está accesible públicamente vía RLS, usar metadata
      }
    }

    const isUserAdmin =
      currentUser.app_metadata?.role === "admin";

    return {
      id: currentUser.id,
      full_name:
        (currentUser.user_metadata?.full_name as string) ||
        currentUser.email?.split("@")[0] ||
        "Usuario CONLAC-T",
      role: isUserAdmin ? "admin" : "customer",
      is_active: true,
      email: currentUser.email,
      created_at: currentUser.created_at,
    };
  }, []);

  // Inicializar sesión al cargar la aplicación
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        if (isSupabaseConfigured()) {
          const { data, error } = await supabase.auth.getSession();
          if (!error && data.session?.user && isMounted) {
            const activeUser = data.session.user;
            setUser(activeUser);
            const resolved = await resolveProfile(activeUser);
            if (isMounted) setProfile(resolved);
            return;
          }
        }

        // Revisar sesión local de respaldo
        const fallback = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
        if (fallback && isMounted) {
          try {
            const parsed = JSON.parse(fallback);
            if (parsed.user && parsed.access_token && parsed.expires_at > Date.now()) {
              setUser(parsed.user);
              setProfile(parsed.profile);
            }
          } catch {
            localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
          }
        }
      } catch {
        // Fallback en caso de corte de red
        const fallback = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
        if (fallback && isMounted) {
          try {
            const parsed = JSON.parse(fallback);
            if (parsed.user && parsed.access_token && parsed.expires_at > Date.now()) {
              setUser(parsed.user);
              setProfile(parsed.profile);
            }
          } catch {
            localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initSession();

    // Escuchar cambios de estado en Supabase Auth únicamente si está configurado
    if (isSupabaseConfigured()) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
        if (!isMounted) return;
        if (session?.user) {
          setUser(session.user);
          const resolved = await resolveProfile(session.user);
          if (isMounted) setProfile(resolved);
        } else if (!localStorage.getItem(LOCAL_STORAGE_SESSION_KEY)) {
          setUser(null);
          setProfile(null);
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [resolveProfile]);

  // Login con Supabase Auth o credenciales del sistema / cuentas locales
  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setLoading(true);
      const cleanEmail = email.trim().toLowerCase();

      try {
        const response = await fetch(`${siteConfig.backendUrl}/auth/login`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: cleanEmail, password }),
        });
        if (!response.ok) return { success: false, error: "Correo o contraseña incorrectos, o servidor no disponible." };
        const session = await response.json();
        const authenticatedUser = { id: session.user_id, email: session.email,
          app_metadata: { role: session.role }, user_metadata: { full_name: session.full_name },
          aud: "authenticated", created_at: new Date().toISOString() } as User;
        const authenticatedProfile: UserProfile = { id: session.user_id, email: session.email,
          full_name: session.full_name || session.email, role: session.role === "admin" ? "admin" : "customer", is_active: true };
        setUser(authenticatedUser); setProfile(authenticatedProfile);
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify({ user: authenticatedUser,
          profile: authenticatedProfile, access_token: session.access_token,
          expires_at: Date.now() + session.expires_in * 1000 }));
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error de conexión al servidor de autenticación.";
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [resolveProfile]
  );

  // Registro de usuario
  const register = useCallback(
    async (
      fullName: string,
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      setLoading(true);
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = fullName.trim();

      try {
        if (!isSupabaseConfigured()) return { success: false, error: "El registro no está configurado. Puedes comprar como invitado." };
        const { error } = await supabase.auth.signUp({ email: cleanEmail, password,
          options: { data: { full_name: cleanName } } });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al procesar el registro.";
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [resolveProfile]
  );

  // Cerrar sesión
  const logout = useCallback(async () => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch {
      // Ignorar error al cerrar sesión
    } finally {
      setUser(null);
      setProfile(null);
      localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    }
  }, []);

  // Recuperación de contraseña (envío directo por SMTP al correo del usuario)
  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim();

    try {
      // 1. Enviar correo real por SMTP a través de la API del Frontend
      const res = await fetch("/api/auth/recuperar-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      if (res.ok) {
        // También notificar a Supabase Auth en segundo plano si está disponible
        if (isSupabaseConfigured()) {
          try {
            const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;
            await supabase.auth.resetPasswordForEmail(cleanEmail, { redirectTo: redirectUrl });
          } catch {
            // Ignorar si Supabase no tiene el correo en su base de datos
          }
        }
        return { success: true };
      }

      // 2. Fallback de respaldo a través del endpoint de contacto del Backend
      const resBackend = await fetch(`${siteConfig.backendUrl}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: "Usuario CONLAC-T",
          email: cleanEmail,
          telefono: "N/A",
          asunto: "Solicitud de Restablecimiento de Contraseña",
          mensaje: `Se ha registrado una solicitud de recuperación de contraseña para la cuenta ${cleanEmail}.`,
          privacy_accepted: true,
        }),
      });

      if (!resBackend.ok) {
        throw new Error("No se pudo procesar la solicitud con el servidor de correo.");
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al solicitar restablecimiento de contraseña.";
      return { success: false, error: msg };
    }
  }, []);

  // Obtener JWT Bearer token
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        if (session.access_token && session.expires_at > Date.now()) return session.access_token;
      }
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token || null;
    } catch {
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        register,
        logout,
        resetPassword,
        getAccessToken,
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
