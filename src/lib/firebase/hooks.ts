"use client";

import * as React from "react";
import { collection, onSnapshot, orderBy, query, QueryConstraint } from "firebase/firestore";

import { useFirestore } from "@/firebase";
import type {
  ActionItemDocument,
  AiInsightDocument,
  CompanyMetricSnapshot,
} from "../../../docs/firestore-schema";
import { firestoreContracts } from "../../../docs/firestore-schema";
import { resolveContractPath } from "./utils";

interface FirestoreState<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
}

function useFirestoreCollection<T extends { id: string }>(
  companyId: string | undefined,
  contract: string,
  constraints: QueryConstraint[] = [],
): FirestoreState<T> {
  const firestore = useFirestore();
  const [state, setState] = React.useState<FirestoreState<T>>({
    data: [],
    loading: true,
    error: null,
  });

  React.useEffect(() => {
    if (!firestore || !companyId) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    const path = resolveContractPath(contract, companyId);
    const collectionRef = collection(firestore, path);
    const collectionQuery = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;

    const unsubscribe = onSnapshot(
      collectionQuery,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<T, "id">) })) as T[];
        setState({ data: items, loading: false, error: null });
      },
      (error) => {
        setState({ data: [], loading: false, error });
      },
    );

    return () => unsubscribe();
  }, [companyId, constraints, firestore, contract]);

  return state;
}

export function useCompanyMetrics(companyId: string | undefined) {
  const constraints = React.useMemo(() => [orderBy("round", "asc")], []);
  return useFirestoreCollection<CompanyMetricSnapshot>(
    companyId,
    firestoreContracts.metrics,
    constraints,
  );
}

export function useActionItems(companyId: string | undefined) {
  const constraints = React.useMemo(() => [orderBy("createdAt", "desc")], []);
  return useFirestoreCollection<ActionItemDocument>(
    companyId,
    firestoreContracts.actionItems,
    constraints,
  );
}

export function useAiInsights(companyId: string | undefined) {
  const constraints = React.useMemo(() => [orderBy("createdAt", "desc")], []);
  return useFirestoreCollection<AiInsightDocument>(
    companyId,
    firestoreContracts.aiInsights,
    constraints,
  );
}
