
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { collection, onSnapshot, writeBatch, doc, FirestoreError } from "firebase/firestore";
import { useFirestore, errorEmitter, FirestorePermissionError, useAuth as useFirebaseAuth } from "@/firebase";
import type { UserProfile } from "@/types";
import { USER_PROFILES } from "@/lib/mock-data";

interface UserProfilesContextType {
  profiles: UserProfile[];
  loading: boolean;
}

const UserProfilesContext = createContext<UserProfilesContextType | undefined>(undefined);

export const UserProfilesProvider = ({ children }: { children: ReactNode }) => {
  const auth = useFirebaseAuth();
  const firestore = useFirestore();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !firestore) {
      setProfiles(USER_PROFILES);
      setLoading(false);
      return;
    }
    setLoading(true);
    
    const profilesColRef = collection(firestore, "users");

    const unsubscribe = onSnapshot(profilesColRef, async (querySnapshot) => {
        const firestoreProfiles = querySnapshot.docs.map(doc => doc.data() as UserProfile);
        const firestoreProfileIds = new Set(firestoreProfiles.map(p => p.id));

        const missingProfiles = USER_PROFILES.filter(mockProfile => !firestoreProfileIds.has(mockProfile.id));

        if (missingProfiles.length > 0) {
            const batch = writeBatch(firestore);
            missingProfiles.forEach(profile => {
                const profileDocRef = doc(firestore, "users", profile.id);
                batch.set(profileDocRef, profile);
            });
            await batch.commit();
        } else {
            setProfiles(firestoreProfiles);
            setLoading(false);
        }
    },
    (error: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
            path: 'users',
            operation: 'list',
        });
        errorEmitter.emit('permission-error', contextualError);
        setProfiles(USER_PROFILES); // Fallback to mock
        setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);
  
  const value = { profiles, loading };

  return (
    <UserProfilesContext.Provider value={value}>
      {children}
    </UserProfilesContext.Provider>
  );
};

export const useUserProfiles = () => {
  const context = useContext(UserProfilesContext);
  if (context === undefined) {
    throw new Error("useUserProfiles must be used within a UserProfilesProvider");
  }
  return context;
};
