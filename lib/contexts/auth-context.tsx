"use client";
import React, { createContext, useEffect, useState } from "react";
import { createClient } from "../supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const client = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // Start with loading true

  useEffect(() => {
    const fetchAccessLevel = async (userId: string) => {
      try {
        const { data, error } = await client
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

    const { data: authListener } = client.auth.onAuthStateChange(
      async (event, session: Session | null) => {
        console.log("Auth event:", event);
        if (session?.user) {
          setUser(session.user);
          const accessLevel = await fetchAccessLevel(session.user.id);
          setIsAdmin(accessLevel === 0);
        } else {
          //setUser(null);
          setIsAdmin(false);
        }
        // Only set loading to false after the initial session is handled
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [client]);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
