
"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import type { UserProfile } from "@/types";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth as useFirebaseAuth } from "@/firebase";
import { useUserProfiles } from "@/hooks/use-user-profiles";


interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (profileId: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useFirebaseAuth();
  const { profiles, loading: profilesLoading } = useUserProfiles();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth || profilesLoading) {
        if (!profilesLoading) setLoading(false); // Firebase not initialized yet
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const storedProfileId = localStorage.getItem("userProfileId");
        const userProfile = profiles.find(p => p.id === storedProfileId) || null;
        setProfile(userProfile);
        // If there's a user but no profile, and we are not on the auth page, it might be the initial login
        // but if we have a user and profile, and are on the auth page, redirect to dashboard.
        if (userProfile && pathname === '/') {
          router.push('/dashboard');
        } else if (!userProfile && pathname !== '/') {
          // If profile is lost somehow, send back to login
          // but preserve history for back button
          router.replace('/');
        }

      } else {
        setUser(null);
        setProfile(null);
        localStorage.removeItem("userProfileId");
        if (pathname !== '/') {
           router.push("/");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname, auth, profiles, profilesLoading]);

  const login = async (profileId: string) => {
    setLoading(true);
    try {
        if (!user) {
            // This will be handled by the onAuthStateChanged listener
        }
        const userProfile = profiles.find(p => p.id === profileId) || null;
        setProfile(userProfile);
        if (userProfile) {
            localStorage.setItem("userProfileId", userProfile.id);
        }
        
        // Only push to dashboard if we are coming from the login page
        if(pathname === '/') {
            router.push("/dashboard");
        }
    } catch (error)
    {
        console.error("Role switch failed:", error);
    } finally {
        setLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) return;
    setLoading(true);
    await auth.signOut();
    setUser(null);
    setProfile(null);
    localStorage.removeItem("userProfileId");
    router.push("/");
    setLoading(false);
  };
  
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
