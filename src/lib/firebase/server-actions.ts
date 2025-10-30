"use server";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { initializeFirebase } from "@/firebase";
import {
  mapActionItem,
  mapAiInsight,
  mapCompanyMetric,
  resolveRoleMetadata,
  type ActionItem,
  type AiInsight,
  type CompanyMetric,
  type RoleMetadata,
} from "./types";
import type {
  ActionItemContract,
  AiInsightContract,
  CompanyMetricContract,
  RoleMetadataContract,
} from "../../../docs/firestore-schema";

const COMPANY_METRICS_COLLECTION = "companyMetrics";
const ACTION_ITEMS_COLLECTION = "actionItems";
const AI_INSIGHTS_COLLECTION = "aiInsights";
const USERS_COLLECTION = "users";

export async function fetchCompanyMetrics(gameId?: string): Promise<CompanyMetric[]> {
  const { firestore } = initializeFirebase();
  const constraints: QueryConstraint[] = [orderBy("updatedAt", "desc")];

  if (gameId) {
    constraints.push(where("gameId", "==", gameId));
  }

  const metricsSnapshot = await getDocs(
    query(collection(firestore, COMPANY_METRICS_COLLECTION), ...constraints)
  );

  return metricsSnapshot.docs.map((snapshot) => {
    const data = snapshot.data() as CompanyMetricContract;
    const id = data.id || snapshot.id;

    return mapCompanyMetric({ ...data, id });
  });
}

export async function fetchActionItems(
  roleId?: string,
  gameId?: string
): Promise<ActionItem[]> {
  const { firestore } = initializeFirebase();
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

  if (roleId) {
    constraints.push(where("ownerRoleId", "==", roleId));
  }

  if (gameId) {
    constraints.push(where("gameId", "==", gameId));
  }

  const actionItemsSnapshot = await getDocs(
    query(collection(firestore, ACTION_ITEMS_COLLECTION), ...constraints)
  );

  return actionItemsSnapshot.docs.map((snapshot) => {
    const data = snapshot.data() as ActionItemContract;
    const id = data.id || snapshot.id;

    return mapActionItem({ ...data, id });
  });
}

export async function fetchAiInsights(gameId?: string): Promise<AiInsight[]> {
  const { firestore } = initializeFirebase();
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

  if (gameId) {
    constraints.push(where("gameId", "==", gameId));
  }

  const insightsSnapshot = await getDocs(
    query(collection(firestore, AI_INSIGHTS_COLLECTION), ...constraints)
  );

  return insightsSnapshot.docs.map((snapshot) => {
    const data = snapshot.data() as AiInsightContract;
    const id = data.id || snapshot.id;

    return mapAiInsight({ ...data, id });
  });
}

export async function fetchRoleMetadata(roleId: string): Promise<RoleMetadata | null> {
  const { firestore } = initializeFirebase();

  const roleDoc = await getDoc(doc(firestore, USERS_COLLECTION, roleId));

  if (roleDoc.exists()) {
    return roleDoc.data() as RoleMetadataContract;
  }

  return resolveRoleMetadata(roleId);
}
