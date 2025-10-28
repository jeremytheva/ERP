"use client";

import React, { createContext, useState, useEffect, ReactNode, useMemo } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import type { UserProfile } from "@/types";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth as useFirebaseAuth } from "@/firebase";
import { useUserProfiles } from "@/hooks/use-user-profiles";
import { clearSession, getPersistedRole, persistActiveRole } from "@/lib/firebase/server-actions";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (profileId: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_PAGES = ["/"];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useFirebaseAuth();
  const { profiles, loading: profilesLoading } = useUserProfiles();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }

    setAuthLoading(true);
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        setAuthLoading(false);
      },
      () => {
        setUser(null);
        setAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    let active = true;

    if (!user) {
      setProfile(null);
      return () => {
        active = false;
      };
    }

    if (profilesLoading) {
      return () => {
        active = false;
      };
    }

    setProfileLoading(true);

    getPersistedRole()
      .then(({ roleId }) => {
        if (!active) return;
        if (roleId) {
          const matched = profiles.find((item) => item.id === roleId) || null;
          setProfile(matched);
        } else {
          setProfile(null);
        }
      })
      .finally(() => {
        if (active) {
          setProfileLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user, profiles, profilesLoading]);

  useEffect(() => {
    if (authLoading || profilesLoading || profileLoading) {
      return;
    }

    if (!user && !AUTH_PAGES.includes(pathname)) {
      router.replace("/");
      return;
    }

    if (user && profile) {
      const basePath = `/app/role/${profile.id}`;
      if (pathname === "/") {
        router.replace(`${basePath}/${profile.defaultComponent}`);
        return;
      }

      if (pathname === basePath) {
        router.replace(`${basePath}/${profile.defaultComponent}`);
        return;
      }
    }

    if (user && !profile && pathname.startsWith("/app/role")) {
      router.replace("/");
    }
  }, [authLoading, profileLoading, profilesLoading, user, profile, pathname, router]);

  const login = async (profileId: string) => {
    setProfileLoading(true);
    try {
      const result = await persistActiveRole(profileId);
      const matched = profiles.find((item) => item.id === profileId) || null;
      setProfile(matched);

      const defaultComponent = result.defaultComponent ?? matched?.defaultComponent ?? "dashboard";
      router.push(`/app/role/${profileId}/${defaultComponent}`);
    } catch (error) {
      console.error("Role switch failed:", error);
      throw error;
    } finally {
      setProfileLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) return;
    setProfileLoading(true);
    try {
      await auth.signOut();
      setUser(null);
      setProfile(null);
      await clearSession();
      router.push("/");
    } finally {
      setProfileLoading(false);
    }
  };

  const loading = useMemo(() => authLoading || profilesLoading || profileLoading, [authLoading, profilesLoading, profileLoading]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
