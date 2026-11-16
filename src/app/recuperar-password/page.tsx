"use client";
import { useAuth } from "@/context/AuthContext";
import { PasswordRecoveryFlow } from "@/components/account/PasswordRecoveryFlow";
export default function RecuperarPasswordPage() {
 const { user, loading, logout } = useAuth();
 return <div className="bg-background px-4 py-12 sm:py-16">{loading ? <p className="text-center text-primary">Cargando…</p> : <PasswordRecoveryFlow initialEmail={user?.email} onPasswordChanged={logout} />}</div>;
}
