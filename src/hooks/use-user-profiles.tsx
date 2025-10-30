
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { collection, onSnapshot, writeBatch, doc, FirestoreError, getDocs } from "firebase/firestore";
import { useFirestore, errorEmitter, FirestorePermissionError, useUser as useFirebaseUser, useMemoFirebase } from "@/firebase";
import type { UserProfile } from "@/types";

export const USER_PROFILES: UserProfile[] = [
  { id: 'procurement', name: 'Procurement', avatarUrl: 'https://picsum.photos/seed/procurement/100/100' },
  { id: 'production', name: 'Production', avatarUrl: 'https://picsum.photos/seed/production/100/100' },
  { id: 'logistics', name: 'Logistics', avatarUrl: 'https://picsum.photos/seed/logistics/100/100' },
  { id: 'sales', name: 'Sales', avatarUrl: 'https://picsum.photos/seed/sales/100/100' },
];

interface UserProfilesContextType {
  profiles: UserProfile[];
  loading: boolean;
}

const UserProfilesContext = createContext<UserProfilesContextType | undefined>(undefined);

export const UserProfilesProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();
  const { user, isUserLoading } = useFirebaseUser();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) {
        setLoading(true);
        return;
    }
    
    if (!user || !firestore) {
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

        if (missingProfiles.length > 0 && querySnapshot.docs.length < USER_PROFILES.length) {
            const batch = writeBatch(firestore);
            missingProfiles.forEach(profile => {
                const profileDocRef = doc(firestore, "users", profile.id);
                batch.set(profileDocRef, profile);
            });
            // Non-blocking commit
            batch.commit().catch(error => {
                 const contextualError = new FirestorePermissionError({
                    path: 'users',
                    operation: 'write',
                });
                errorEmitter.emit('permission-error', contextualError);
            });
        } else {
            setProfiles(firestoreProfiles.length > 0 ? firestoreProfiles : USER_PROFILES);
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
  }, [user, isUserLoading, firestore]);
  
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
