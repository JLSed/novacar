"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    isAdmin: false,
  });

  useEffect(() => {
    const supabase = createClient();
    let isMounted = true;

    const fetchAccessLevel = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("access_level")
          .eq("user_id", userId)
          .single();

        if (error) {
          console.error("Error fetching access level:", error);
          return null;
        }
        return data?.access_level;
      } catch (error) {
        console.error("Exception fetching access level:", error);
        return null;
      }
    };

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (session?.user) {
          const accessLevel = await fetchAccessLevel(session.user.id);
          if (isMounted) {
            setAuthState({
              user: session.user,
              loading: false,
              isAdmin: accessLevel === 0,
            });
          }
        } else {
          if (isMounted) {
            setAuthState({
              user: null,
              loading: false,
              isAdmin: false,
            });
          }
        }
      } catch (error) {
        console.error("Error getting session:", error);
        if (isMounted) {
          setAuthState({
            user: null,
            loading: false,
            isAdmin: false,
          });
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    // IMPORTANT: onAuthStateChange callback MUST NOT be async - it causes getSession() to hang
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        // Use a separate function call (not awaited) for async operations
        fetchAccessLevel(session.user.id).then((accessLevel) => {
          if (isMounted) {
            setAuthState({
              user: session.user,
              loading: false,
              isAdmin: accessLevel === 0,
            });
          }
        });
      } else {
        setAuthState({
          user: null,
          loading: false,
          isAdmin: false,
        });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return authState;
};

export default useAuth;
