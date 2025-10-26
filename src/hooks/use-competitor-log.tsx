
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, FirestoreError } from "firebase/firestore";
import { useAuth } from "./use-auth";
import type { CompetitorLogEntry } from "@/types";
import { useFirestore, errorEmitter, FirestorePermissionError, useMemoFirebase } from "@/firebase";

interface CompetitorLogContextType {
  logEntries: CompetitorLogEntry[];
  addLogEntry: (text: string, author: string) => Promise<void>;
}

const CompetitorLogContext = createContext<CompetitorLogContextType | undefined>(undefined);

export const CompetitorLogProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const firestore = useFirestore();
  const [logEntries, setLogEntries] = useState<CompetitorLogEntry[]>([]);

  const competitorLogQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    const logColRef = collection(firestore, "competitor_log");
    return query(logColRef, orderBy("createdAt", "desc"));
  }, [user, firestore]);

  useEffect(() => {
    if (!competitorLogQuery) {
        setLogEntries([]);
        return;
    }

    const unsubscribe = onSnapshot(competitorLogQuery, (querySnapshot) => {
      const entries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      } as CompetitorLogEntry));
      setLogEntries(entries);
    },
    (error: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
            path: 'competitor_log',
            operation: 'list',
        });
        errorEmitter.emit('permission-error', contextualError);
    });

    return () => unsubscribe();
  }, [competitorLogQuery]);

  const addLogEntry = async (text: string, author: string) => {
    if (!user || !firestore) return;
    const logColRef = collection(firestore, "competitor_log");
    const data = {
      text,
      author,
      createdAt: serverTimestamp(),
    };
    addDoc(logColRef, data)
        .catch(error => {
            const contextualError = new FirestorePermissionError({
                path: 'competitor_log',
                operation: 'create',
                requestResourceData: data,
            });
            errorEmitter.emit('permission-error', contextualError);
        });
  };
  
  const value = { logEntries, addLogEntry };

  return (
    <CompetitorLogContext.Provider value={value}>
      {children}
    </CompetitorLogContext.Provider>
  );
};

export const useCompetitorLog = () => {
  const context = useContext(CompetitorLogContext);
  if (context === undefined) {
    throw new Error("useCompetitorLog must be used within a CompetitorLogProvider");
  }
  return context;
};
