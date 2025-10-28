"use client";

import { useMemo } from "react";
import { collection, orderBy, query } from "firebase/firestore";
import { useAuth } from "@/hooks/use-auth";
import { useFirestore, useMemoFirebase } from "@/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import type { ActionItem } from "@/types";

export function useActionItems() {
  const { user, loading } = useAuth();
  const firestore = useFirestore();

  const actionItemsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, "users", user.uid, "actionItems"),
      orderBy("createdAt", "asc")
    );
  }, [user, firestore]);

  const { data, isLoading, error } = useCollection<ActionItem>(actionItemsQuery);

  return useMemo(
    () => ({
      items: data ?? [],
      isLoading: loading || isLoading,
      error,
    }),
    [data, isLoading, error, loading]
  );
}
