import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase.ts";

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isOwner: boolean;
  refreshOwner: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState>({
  session: null,
  user: null,
  loading: true,
  isOwner: false,
  refreshOwner: () => Promise.resolve(),
  signIn: async () => ({ error: "not initialized" }),
  signUp: async () => ({ error: "not initialized" }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  const refreshOwner = useCallback(async () => {
    const s = session;
    if (!s?.user) {
      setIsOwner(false);
      return;
    }
    const { data, error } = await supabase
      .from("site_settings")
      .select("owner_id")
      .eq("id", 1)
      .maybeSingle();
    if (error) {
      setIsOwner(false);
      return;
    }
    setIsOwner(data?.owner_id === s.user.id);
  }, [session]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    void refreshOwner();
  }, [session, loading, refreshOwner]);

  return (
    <Ctx.Provider value={{ session, user: session?.user ?? null, loading, isOwner, refreshOwner, signIn, signUp, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
