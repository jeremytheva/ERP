"use server";

import { collection, getDocs, orderBy, query, type QueryConstraint } from "firebase/firestore";

import { initializeFirebase } from "@/firebase";
import type {
  ActionItemDocument,
  AiInsightDocument,
  CompanyMetricSnapshot,
} from "../../../docs/firestore-schema";
import { firestoreContracts } from "../../../docs/firestore-schema";
import { resolveContractPath } from "./utils";

async function fetchCollection<T>(path: string, constraints: QueryConstraint[]) {
  const { firestore } = initializeFirebase();
  const collectionRef = collection(firestore, path);
  const collectionQuery = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
  const snapshot = await getDocs(collectionQuery);

  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<T, "id">) })) as T[];
}

export async function fetchCompanyMetrics(companyId: string) {
  const path = resolveContractPath(firestoreContracts.metrics, companyId);
  return fetchCollection<CompanyMetricSnapshot>(path, [orderBy("round", "asc")]);
}

export async function fetchCompanyActionItems(companyId: string) {
  const path = resolveContractPath(firestoreContracts.actionItems, companyId);
  return fetchCollection<ActionItemDocument>(path, [orderBy("createdAt", "desc")]);
}

export async function fetchCompanyAiInsights(companyId: string) {
  const path = resolveContractPath(firestoreContracts.aiInsights, companyId);
  return fetchCollection<AiInsightDocument>(path, [orderBy("createdAt", "desc")]);
}
