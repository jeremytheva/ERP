"use server";

import type {
  DocumentData,
  Query,
} from "firebase-admin/firestore";

import { initializeFirebaseAdmin } from "./server";
import type {
  ActionItemDocument,
  AiInsightDocument,
  CompanyMetricSnapshot,
} from "../../../docs/firestore-schema";
import { firestoreContracts } from "../../../docs/firestore-schema";
import { resolveContractPath } from "./utils";

type QueryBuilder = (query: Query<DocumentData>) => Query<DocumentData>;

async function fetchCollection<T>(path: string, builders: QueryBuilder[] = []) {
  const { firestore } = initializeFirebaseAdmin();
  const collectionRef = firestore.collection(path);
  const collectionQuery = builders.reduce<Query<DocumentData>>(
    (currentQuery, builder) => builder(currentQuery),
    collectionRef,
  );
  const snapshot = await collectionQuery.get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<T, "id">) })) as T[];
}

export async function fetchCompanyMetrics(companyId: string) {
  const path = resolveContractPath(firestoreContracts.metrics, companyId);
  return fetchCollection<CompanyMetricSnapshot>(path, [
    (query) => query.orderBy("round", "asc"),
  ]);
}

export async function fetchCompanyActionItems(companyId: string) {
  const path = resolveContractPath(firestoreContracts.actionItems, companyId);
  return fetchCollection<ActionItemDocument>(path, [
    (query) => query.orderBy("createdAt", "desc"),
  ]);
}

export async function fetchCompanyAiInsights(companyId: string) {
  const path = resolveContractPath(firestoreContracts.aiInsights, companyId);
  return fetchCollection<AiInsightDocument>(path, [
    (query) => query.orderBy("createdAt", "desc"),
  ]);
}
