import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabaseBrowser } from "@/lib/supabase-browser";

export type AppRole =
  | "admin"
  | "solicitante"
  | "comprador"
  | "aprovador"
  | "almoxarife";

interface Profile {
  id: string;
  full_name: string | null;
  department: string | null;
  email: string | null;
}

interface AuthContextValue {
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  roles: AppRole[];
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfileAndRoles(userId: string) {
  const [{ data: profile, error: profileError }, { data: roles, error: rolesError }] = await Promise.all([
    supabaseBrowser
      .from("profiles")
      .select("id, full_name, department, email")
      .eq("id", userId)
      .maybeSingle(),
    supabaseBrowser
      .from("user_roles")
      .select("role")
      .eq("user_id", userId),
  ]);

  if (profileError) throw profileError;
  if (rolesError) throw rolesError;

  return {
    profile: profile satisfies Profile | null,
    roles: (roles || []).map((item) => item.role as AppRole),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);

  const refreshProfile = async () => {
    const currentUser = (await supabaseBrowser.auth.getUser()).data.user ?? user;

    if (!currentUser) {
      setProfile(null);
      setRoles([]);
      return;
    }

    const result = await loadProfileAndRoles(currentUser.id);
    setProfile(result.profile);
    setRoles(result.roles);
  };

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      const [{ data: sessionData }, { data: userData }] = await Promise.all([
        supabaseBrowser.auth.getSession(),
        supabaseBrowser.auth.getUser(),
      ]);

      if (!mounted) return;

      setSession(sessionData.session);
      setUser(userData.user);

      if (userData.user) {
        const result = await loadProfileAndRoles(userData.user.id);
        if (!mounted) return;
        setProfile(result.profile);
        setRoles(result.roles);
      }

      if (mounted) setIsLoading(false);
    };

    void bootstrap();

    const { data: authListener } = supabaseBrowser.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setProfile(null);
        setRoles([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      void loadProfileAndRoles(nextSession.user.id)
        .then((result) => {
          if (!mounted) return;
          setProfile(result.profile);
          setRoles(result.roles);
        })
        .finally(() => {
          if (mounted) setIsLoading(false);
        });
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    isLoading,
    session,
    user,
    profile,
    roles,
    signInWithPassword: async (email: string, password: string) => {
      const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    signOut: async () => {
      const { error } = await supabaseBrowser.auth.signOut();
      if (error) throw error;
    },
    refreshProfile,
    hasRole: (role: AppRole) => roles.includes(role),
  }), [isLoading, profile, roles, session, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
