"use client";

import { useMemo, useCallback } from "react";
import {
  collection,
  doc,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import {
  useFirestore,
  useCollection,
  useMemoFirebase,
  errorEmitter,
  FirestorePermissionError,
} from "@/firebase";
import {
  DebriefReportDocument,
  DebriefReportDocumentSchema,
  StrategicNoteUpdateSchema,
  StrategyDocument,
  StrategyDocumentSchema,
} from "@/lib/logic/strategic-schemas";

const convertTimestamp = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === "object" && value !== null) {
    const candidate = value as { seconds?: number; nanoseconds?: number };
    if (typeof candidate.seconds === "number") {
      return new Timestamp(candidate.seconds, candidate.nanoseconds ?? 0).toDate();
    }
  }
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

export const useLatestStrategy = () => {
  const firestore = useFirestore();

  const strategiesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, "strategies"),
      orderBy("createdAt", "desc"),
      limit(1)
    );
  }, [firestore]);

  const { data, isLoading, error } = useCollection<StrategyDocument>(
    strategiesQuery
  );

  const strategy = useMemo<StrategyDocument | null>(() => {
    if (!data || data.length === 0) return null;
    const [raw] = data;
    const parsed = StrategyDocumentSchema.safeParse({
      ...raw,
      createdAt: convertTimestamp((raw as any).createdAt),
      updatedAt: convertTimestamp((raw as any).updatedAt),
    });
    if (!parsed.success) {
      console.error("Failed to parse strategy document", parsed.error);
      return null;
    }
    return parsed.data;
  }, [data]);

  const docRef = useMemoFirebase(() => {
    if (!firestore || !strategy) return null;
    return doc(firestore, "strategies", strategy.id);
  }, [firestore, strategy?.id]);

  const updateNotes = useCallback(
    async (notes: string) => {
      if (!firestore || !docRef) return;

      const parsed = StrategicNoteUpdateSchema.parse({ notes });
      const batch = writeBatch(firestore);
      batch.update(docRef, {
        notes: parsed.notes,
        updatedAt: serverTimestamp(),
      });

      try {
        await batch.commit();
      } catch (error) {
        errorEmitter.emit(
          "permission-error",
          new FirestorePermissionError({
            path: docRef.path,
            operation: "update",
            requestResourceData: { notes: parsed.notes },
          })
        );
        throw error;
      }
    },
    [firestore, docRef]
  );

  return { strategy, isLoading, error, updateNotes } as const;
};

export const useLatestReport = () => {
  const firestore = useFirestore();

  const reportsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, "reports"),
      orderBy("createdAt", "desc"),
      limit(1)
    );
  }, [firestore]);

  const { data, isLoading, error } = useCollection<DebriefReportDocument>(
    reportsQuery
  );

  const report = useMemo<DebriefReportDocument | null>(() => {
    if (!data || data.length === 0) return null;
    const [raw] = data;
    const parsed = DebriefReportDocumentSchema.safeParse({
      ...raw,
      createdAt: convertTimestamp((raw as any).createdAt),
      updatedAt: convertTimestamp((raw as any).updatedAt),
    });
    if (!parsed.success) {
      console.error("Failed to parse report document", parsed.error);
      return null;
    }
    return parsed.data;
  }, [data]);

  return { report, isLoading, error } as const;
};

