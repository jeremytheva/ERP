"use client";

import { useMemo } from "react";
import { collection, orderBy, query } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { useFirestore, useMemoFirebase } from "@/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import type { CompetitorNote } from "@/types";

export function useCompetitorNotes() {
  const { user, loading } = useAuth();
  const firestore = useFirestore();

  const notesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, "competitorNotes"), orderBy("order", "asc"));
  }, [user, firestore]);

  const { data, isLoading, error } = useCollection<CompetitorNote>(notesQuery);

  return useMemo(
    () => ({
      notes: data ?? [],
      isLoading: loading || isLoading,
      error,
    }),
    [data, isLoading, error, loading]
  );
}
