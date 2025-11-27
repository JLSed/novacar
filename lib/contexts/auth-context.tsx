"use client";
import React, { createContext, useEffect } from "react";
import { createClient } from "../supabase/client";
import type { User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const client = createClient();
  const [user, setUser] = React.useState<User | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

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

    client.auth.getSession().then(async ({ data: { session } }) => {
      console.log("Session data:", session);

      if (session?.user) {
        setUser(session.user);
        const accessLevel = await fetchAccessLevel(session.user.id);
        setIsAdmin(accessLevel === 0);
      }

      setLoading(false);
    });

    const { data: authListener } = client.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          const accessLevel = await fetchAccessLevel(session.user.id);
          setIsAdmin(accessLevel === 0);
        } else {
          setUser(null);
          setIsAdmin(false);
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
