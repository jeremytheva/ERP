"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User, onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { UserProfile } from "@/types";
import { USER_PROFILES } from "@/lib/mock-data";
import { usePathname, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (profileId: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const storedProfileId = localStorage.getItem("userProfileId");
        const userProfile = USER_PROFILES.find(p => p.id === storedProfileId) || null;
        setProfile(userProfile);
        if (pathname === '/') {
          router.push('/dashboard');
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
  }, [router, pathname]);

  const login = async (profileId: string) => {
    setLoading(true);
    try {
        const userCredential = await signInAnonymously(auth);
        setUser(userCredential.user);
        const userProfile = USER_PROFILES.find(p => p.id === profileId) || null;
        setProfile(userProfile);
        if (userProfile) {
            localStorage.setItem("userProfileId", userProfile.id);
        }
        router.push("/dashboard");
    } catch (error) {
        console.error("Anonymous sign-in failed:", error);
    } finally {
        setLoading(false);
    }
  };

  const logout = async () => {
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
