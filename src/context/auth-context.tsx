"use client";

import React, { createContext, useEffect, useMemo, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import type { UserProfile } from "@/types";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth as useFirebaseAuth } from "@/firebase";
import { useUserProfiles } from "@/hooks/use-user-profiles";
import {
  ensureUserDocument,
  persistRoleSelection,
  fetchUserRoleSelection,
  clearRoleSession,
} from "@/lib/firebase/server-actions";
import { isRoleSlug, ROLE_DEFINITIONS } from "@/lib/firebase/firestore-schema";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (profileId: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "userProfileId";

const getRoleHomePath = (roleId: string) => {
  if (isRoleSlug(roleId)) {
    return ROLE_DEFINITIONS[roleId].defaultPath;
  }
  return `/app/role/${roleId}`;
};

const readRedirectParam = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("redirect");
  } catch (error) {
    console.warn("Unable to read redirect query parameter", error);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useFirebaseAuth();
  const { profiles, loading: profilesLoading } = useUserProfiles();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setLoading(true);
      } else {
        setUser(null);
        setProfile(null);
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
          console.warn("Unable to clear stored profile id", error);
        }
        void clearRoleSession();
        if (pathname !== "/") {
          router.push("/");
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, pathname, router]);

  useEffect(() => {
    if (!user || profilesLoading) {
      if (!user && !profilesLoading) {
        setLoading(false);
      }
      return;
    }

    let isCancelled = false;

    const resolveProfile = (profileId: string | null) => {
      if (!profileId) {
        setProfile(null);
        return null;
      }
      const resolved = profiles.find((candidate) => candidate.id === profileId) || null;
      setProfile(resolved);
      return resolved;
    };

    const syncProfile = async () => {
      let idToken: string | null = null;

      try {
        idToken = await user.getIdToken();
      } catch (error) {
        console.error("Failed to obtain Firebase ID token", error);
        setLoading(false);
        return;
      }

      try {
        await ensureUserDocument({ idToken });
      } catch (error) {
        console.error("Failed to ensure user document", error);
      }

      const storedProfileId = (() => {
        try {
          return localStorage.getItem(STORAGE_KEY);
        } catch (error) {
          console.warn("Unable to read stored profile id", error);
          return null;
        }
      })();

      if (storedProfileId) {
        const resolved = resolveProfile(storedProfileId);
        if (resolved) {
          if (pathname === "/") {
            const redirectTarget = readRedirectParam();
            router.push(redirectTarget ?? getRoleHomePath(resolved.id));
          }
          setLoading(false);
          return;
        }
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
          console.warn("Unable to clear invalid stored profile id", error);
        }
      }

      try {
        if (!idToken) {
          throw new Error("Missing Firebase ID token");
        }

        const selection = await fetchUserRoleSelection({ idToken });
        if (isCancelled) return;

        if (selection.activeRoleId && isRoleSlug(selection.activeRoleId)) {
          try {
            localStorage.setItem(STORAGE_KEY, selection.activeRoleId);
          } catch (error) {
            console.warn("Unable to persist active role id", error);
          }
          const resolved = resolveProfile(selection.activeRoleId);
          if (resolved && pathname === "/") {
            const redirectTarget = readRedirectParam();
            router.push(redirectTarget ?? getRoleHomePath(resolved.id));
          }
        } else {
          resolveProfile(null);
          if (pathname !== "/") {
            router.replace("/");
          }
        }
      } catch (error) {
        console.error("Failed to fetch user role selection", error);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    void syncProfile();

    return () => {
      isCancelled = true;
    };
  }, [user, profiles, profilesLoading, pathname, router]);

  const login = async (profileId: string) => {
    setLoading(true);
    try {
      if (!user) {
        console.warn("Attempted role switch before Firebase user was ready");
        return;
      }

      const userProfile = profiles.find((candidate) => candidate.id === profileId) || null;

      if (!userProfile) {
        throw new Error(`Unknown profile id: ${profileId}`);
      }

      if (isRoleSlug(profileId)) {
        const idToken = await user.getIdToken();
        await ensureUserDocument({ idToken });
        await persistRoleSelection({ idToken, roleId: profileId });
      }

      setProfile(userProfile);
      try {
        localStorage.setItem(STORAGE_KEY, userProfile.id);
      } catch (error) {
        console.warn("Unable to persist selected profile", error);
      }

      if (pathname === "/") {
        const redirectTarget = readRedirectParam();
        router.push(redirectTarget ?? getRoleHomePath(userProfile.id));
      }
    } catch (error) {
      console.error("Role switch failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      await clearRoleSession();
      await auth.signOut();
    } catch (error) {
      console.error("Failed to sign out", error);
    } finally {
      setUser(null);
      setProfile(null);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.warn("Unable to clear stored profile id", error);
      }
      router.push("/");
      setLoading(false);
    }
  };

  const contextValue = useMemo(
    () => ({
      user,
      profile,
      loading,
      login,
      logout,
    }),
    [user, profile, loading]
  );

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

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
