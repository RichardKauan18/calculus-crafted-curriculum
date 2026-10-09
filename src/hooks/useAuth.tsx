import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, hasSupabaseConfig } from "@/lib/supabase";

export type Profile = { id: string; name: string; role: "student" | "teacher"; created_at: string };
type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileError: string | null;
  isTeacher: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, name: string) => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
  updatePassword: (password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setLoading(false);
      return;
    }
    let mounted = true;
    let profileRequest = 0;
    const fetchProfile = async (userId: string | undefined) => {
      const request = ++profileRequest;
      if (!userId) {
        if (mounted && request === profileRequest) {
          setProfile(null);
          setProfileError(null);
          setLoading(false);
        }
        return;
      }
      if (mounted) {
        setLoading(true);
        setProfileError(null);
      }
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id,name:full_name,role,created_at")
          .eq("id", userId)
          .maybeSingle();
        if (!mounted || request !== profileRequest) return;
        if (error) {
          setProfile(null);
          setProfileError("Não foi possível carregar os dados do perfil. Atualize a página ou tente novamente.");
        } else if (!data) {
          setProfile(null);
          setProfileError("Sua conta foi autenticada, mas o perfil ainda não existe. Entre em contato com o suporte.");
        } else {
          setProfile(data as Profile);
        }
      } catch {
        if (mounted && request === profileRequest) {
          setProfile(null);
          setProfileError("Ocorreu uma falha ao carregar o perfil. Verifique sua conexão e tente novamente.");
        }
      } finally {
        if (mounted && request === profileRequest) setLoading(false);
      }
    };

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setProfileError("Não foi possível verificar sua sessão. Atualize a página e tente novamente.");
        setLoading(false);
        return;
      }
      setSession(data.session);
      void fetchProfile(data.session?.user.id);
    }).catch(() => {
      if (mounted) {
        setProfileError("Não foi possível verificar sua sessão. Verifique sua conexão.");
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!mounted) return;
      setSession(next);
      // Run the profile request after the auth callback releases Supabase's internal lock.
      queueMicrotask(() => {
        if (mounted) void fetchProfile(next?.user.id);
      });
    });
    return () => {
      mounted = false;
      profileRequest += 1;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!hasSupabaseConfig) return "Supabase ainda não foi configurado.";
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? mapAuthError(error.message) : null;
  };
  const signUp = async (email: string, password: string, name: string) => {
    if (!hasSupabaseConfig) return "Supabase ainda não foi configurado.";
    const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    return error ? mapAuthError(error.message) : null;
  };
  const resetPassword = async (email: string) => {
    if (!hasSupabaseConfig) return "Supabase ainda não foi configurado.";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    return error ? mapAuthError(error.message) : null;
  };
  const updatePassword = async (password: string) => {
    if (!hasSupabaseConfig) return "Supabase ainda não foi configurado.";
    const { error } = await supabase.auth.updateUser({ password });
    return error ? mapAuthError(error.message) : null;
  };
  const signOut = async () => {
    if (hasSupabaseConfig) await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setProfileError(null);
  };
  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        profileError,
        isTeacher: profile?.role === "teacher",
        signIn,
        signUp,
        resetPassword,
        updatePassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
function mapAuthError(message: string) {
  if (message.includes("Invalid login credentials")) return "E-mail ou senha incorretos.";
  if (message.includes("already registered")) return "Este e-mail já está cadastrado.";
  if (message.includes("Password should be at least"))
    return "A senha deve ter pelo menos 6 caracteres.";
  if (message.includes("Email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (message.toLowerCase().includes("rate limit")) return "Muitas tentativas. Aguarde um pouco e tente novamente.";
  return message;
}
