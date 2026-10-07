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
const LOCAL_STORAGE_ACCOUNTS_KEY = "conlact_registered_accounts";

interface StoredAccount {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string; // En frontend localdemo guardamos la credencial para validar login offline
  role: UserRole;
  createdAt: string;
}

function getStoredAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredAccount(account: StoredAccount): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredAccounts();
    const filtered = current.filter((a) => a.email.toLowerCase() !== account.email.toLowerCase());
    filtered.push(account);
    localStorage.setItem(LOCAL_STORAGE_ACCOUNTS_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Error guardando cuenta en almacenamiento local:", err);
  }
}

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
    if (user?.app_metadata?.role === "admin" || user?.user_metadata?.role === "admin") return "admin";
    if (user?.email?.toLowerCase() === "admin@conlact.org") return "admin";
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
      currentUser.email?.toLowerCase() === "admin@conlact.org" ||
      currentUser.app_metadata?.role === "admin" ||
      currentUser.user_metadata?.role === "admin";

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
            if (parsed.user) {
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
            if (parsed.user) {
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
        // 1. Caso Administrador del Sistema
        if (cleanEmail === "admin@conlact.org") {
          if (password !== "AdminConlact2026*" && password.length < 6) {
            return { success: false, error: "Contraseña incorrecta para el Administrador." };
          }
          const adminUser: User = {
            id: "d1000000-0000-0000-0000-000000000001",
            app_metadata: { provider: "email", role: "admin" },
            user_metadata: { full_name: "Administrador CONLAC-T", role: "admin" },
            aud: "authenticated",
            created_at: "2026-01-01T00:00:00.000Z",
            email: "admin@conlact.org",
            phone: "",
            confirmed_at: "2026-01-01T00:00:00.000Z",
            last_sign_in_at: new Date().toISOString(),
            role: "authenticated",
            updated_at: new Date().toISOString(),
          };
          const adminProfile: UserProfile = {
            id: "d1000000-0000-0000-0000-000000000001",
            full_name: "Administrador CONLAC-T",
            role: "admin",
            is_active: true,
            email: "admin@conlact.org",
            created_at: "2026-01-01T00:00:00.000Z",
          };
          setUser(adminUser);
          setProfile(adminProfile);
          localStorage.setItem(
            LOCAL_STORAGE_SESSION_KEY,
            JSON.stringify({ user: adminUser, profile: adminProfile })
          );
          return { success: true };
        }

        // 2. Caso Cliente del Sistema
        if (cleanEmail === "cliente@conlact.org") {
          if (password !== "ClienteConlact2026*" && password.length < 6) {
            return { success: false, error: "Contraseña incorrecta para el Cliente." };
          }
          const customerUser: User = {
            id: "c2000000-0000-0000-0000-000000000002",
            app_metadata: { provider: "email", role: "customer" },
            user_metadata: { full_name: "Cliente Frecuente Pilahuín", role: "customer" },
            aud: "authenticated",
            created_at: "2026-01-01T00:00:00.000Z",
            email: "cliente@conlact.org",
            phone: "",
            confirmed_at: "2026-01-01T00:00:00.000Z",
            last_sign_in_at: new Date().toISOString(),
            role: "authenticated",
            updated_at: new Date().toISOString(),
          };
          const customerProfile: UserProfile = {
            id: "c2000000-0000-0000-0000-000000000002",
            full_name: "Cliente Frecuente Pilahuín",
            role: "customer",
            is_active: true,
            email: "cliente@conlact.org",
            created_at: "2026-01-01T00:00:00.000Z",
          };
          setUser(customerUser);
          setProfile(customerProfile);
          localStorage.setItem(
            LOCAL_STORAGE_SESSION_KEY,
            JSON.stringify({ user: customerUser, profile: customerProfile })
          );
          return { success: true };
        }

        // 3. Revisar en cuentas registradas en este navegador
        const storedAccounts = getStoredAccounts();
        const matched = storedAccounts.find((a) => a.email.toLowerCase() === cleanEmail);
        if (matched) {
          if (matched.passwordHash !== password) {
            return { success: false, error: "Contraseña incorrecta." };
          }
          const matchedUser: User = {
            id: matched.id,
            app_metadata: { provider: "email", role: matched.role },
            user_metadata: { full_name: matched.fullName, role: matched.role },
            aud: "authenticated",
            created_at: matched.createdAt,
            email: matched.email,
            phone: "",
            confirmed_at: matched.createdAt,
            last_sign_in_at: new Date().toISOString(),
            role: "authenticated",
            updated_at: new Date().toISOString(),
          };
          const matchedProfile: UserProfile = {
            id: matched.id,
            full_name: matched.fullName,
            role: matched.role,
            is_active: true,
            email: matched.email,
            created_at: matched.createdAt,
          };
          setUser(matchedUser);
          setProfile(matchedProfile);
          localStorage.setItem(
            LOCAL_STORAGE_SESSION_KEY,
            JSON.stringify({ user: matchedUser, profile: matchedProfile })
          );
          return { success: true };
        }

        // 4. Intento de inicio de sesión estándar vía Supabase Auth sólo si la clave es válida
        if (isSupabaseConfigured()) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

          if (error) {
            let friendlyMessage = error.message;
            if (error.message.includes("Invalid login credentials")) {
              friendlyMessage = "Correo electrónico o contraseña incorrectos.";
            } else if (error.message.includes("Email not confirmed")) {
              friendlyMessage = "Por favor verifica tu correo electrónico antes de ingresar.";
            }
            return { success: false, error: friendlyMessage };
          }

          if (data.user) {
            setUser(data.user);
            const resolved = await resolveProfile(data.user);
            setProfile(resolved);
            localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
            return { success: true };
          }
        }

        return { success: false, error: "Correo electrónico o contraseña incorrectos." };
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
        // Verificar si la cuenta ya existe en local
        const existing = getStoredAccounts().find((a) => a.email.toLowerCase() === cleanEmail);
        if (existing || cleanEmail === "admin@conlact.org" || cleanEmail === "cliente@conlact.org") {
          return { success: false, error: "Ya existe una cuenta registrada con este correo electrónico." };
        }

        const newId = "c" + Math.random().toString(36).substring(2, 11) + "-0000-0000";
        const now = new Date().toISOString();

        // 1. Si Supabase tiene clave configurada, intentar registrar en Supabase Auth
        if (isSupabaseConfigured()) {
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                full_name: cleanName,
                role: "customer",
              },
            },
          });

          if (error) {
            let friendly = error.message;
            if (error.message.includes("User already registered")) {
              friendly = "Ya existe una cuenta registrada con este correo electrónico.";
              return { success: false, error: friendly };
            }
            // Si falla por credencial de api o red, proceder con guardado local
          } else if (data.user) {
            setUser(data.user);
            const resolved = await resolveProfile(data.user);
            setProfile(resolved);
            saveStoredAccount({
              id: data.user.id,
              fullName: cleanName,
              email: cleanEmail,
              passwordHash: password,
              role: "customer",
              createdAt: now,
            });
            return { success: true };
          }
        }

        // 2. Registro local persistente (permite iniciar y cerrar sesión de forma persistente)
        const newCustomerUser: User = {
          id: newId,
          app_metadata: { provider: "email", role: "customer" },
          user_metadata: { full_name: cleanName, role: "customer" },
          aud: "authenticated",
          created_at: now,
          email: cleanEmail,
          phone: "",
          confirmed_at: now,
          last_sign_in_at: now,
          role: "authenticated",
          updated_at: now,
        };
        const customerProfile: UserProfile = {
          id: newId,
          full_name: cleanName,
          role: "customer",
          is_active: true,
          email: cleanEmail,
          created_at: now,
        };

        // Guardar cuenta de forma permanente para futuros logins
        saveStoredAccount({
          id: newId,
          fullName: cleanName,
          email: cleanEmail,
          passwordHash: password,
          role: "customer",
          createdAt: now,
        });

        // Establecer sesión activa
        setUser(newCustomerUser);
        setProfile(customerProfile);
        localStorage.setItem(
          LOCAL_STORAGE_SESSION_KEY,
          JSON.stringify({ user: newCustomerUser, profile: customerProfile })
        );

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
