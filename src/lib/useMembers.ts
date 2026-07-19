import { useEffect, useState } from "react";
import { supabase } from "./supabase.ts";
import type { Profile } from "./types.ts";

export function useMemberCount() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .then(({ count: c }) => {
        if (active && c !== null) setCount(c);
      });
    return () => {
      active = false;
    };
  }, []);
  return count;
}

export function useProfiles(enabled = true) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    supabase
      .from("profiles")
      .select("id, email, display_name, created_at")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data) setProfiles(data as Profile[]);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [enabled]);
  return { profiles, loading };
}
