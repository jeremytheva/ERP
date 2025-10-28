"use client";

import { useMemo } from "react";
import {
  collection,
  orderBy,
  query,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  type WithId,
} from "@/firebase";
import {
  mapActionItem,
  mapAiInsight,
  mapCompanyMetric,
  type ActionItem,
  type AiInsight,
  type CompanyMetric,
} from "./types";
import type {
  ActionItemContract,
  AiInsightContract,
  CompanyMetricContract,
} from "../../../docs/firestore-schema";

export interface CompanyMetricsHookResult {
  metrics: CompanyMetric[];
  isLoading: boolean;
  error: Error | null;
}

export interface ActionItemsHookResult {
  items: ActionItem[];
  isLoading: boolean;
  error: Error | null;
}

export interface AiInsightsHookResult {
  insights: AiInsight[];
  isLoading: boolean;
  error: Error | null;
}

const COMPANY_METRICS_COLLECTION = "companyMetrics";
const ACTION_ITEMS_COLLECTION = "actionItems";
const AI_INSIGHTS_COLLECTION = "aiInsights";

export function useCompanyMetrics(gameId?: string | null): CompanyMetricsHookResult {
  const firestore = useFirestore();

  const metricsQuery = useMemoFirebase(() => {
    if (!firestore) {
      return null;
    }

    const constraints: QueryConstraint[] = [orderBy("updatedAt", "desc")];

    if (gameId) {
      constraints.push(where("gameId", "==", gameId));
    }

    return query(collection(firestore, COMPANY_METRICS_COLLECTION), ...constraints);
  }, [firestore, gameId]);

  const { data, isLoading, error } = useCollection<CompanyMetricContract>(metricsQuery);

  const metrics = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.map((doc: WithId<CompanyMetricContract>) => mapCompanyMetric(doc));
  }, [data]);

  return { metrics, isLoading, error };
}

export function useActionItems(roleId?: string | null, gameId?: string | null): ActionItemsHookResult {
  const firestore = useFirestore();

  const itemsQuery = useMemoFirebase(() => {
    if (!firestore) {
      return null;
    }

    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

    if (roleId) {
      constraints.push(where("ownerRoleId", "==", roleId));
    }

    if (gameId) {
      constraints.push(where("gameId", "==", gameId));
    }

    return query(collection(firestore, ACTION_ITEMS_COLLECTION), ...constraints);
  }, [firestore, roleId, gameId]);

  const { data, isLoading, error } = useCollection<ActionItemContract>(itemsQuery);

  const items = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.map((doc: WithId<ActionItemContract>) => mapActionItem(doc));
  }, [data]);

  return { items, isLoading, error };
}

export function useAiInsights(gameId?: string | null): AiInsightsHookResult {
  const firestore = useFirestore();

  const insightsQuery = useMemoFirebase(() => {
    if (!firestore) {
      return null;
    }

    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

    if (gameId) {
      constraints.push(where("gameId", "==", gameId));
    }

    return query(collection(firestore, AI_INSIGHTS_COLLECTION), ...constraints);
  }, [firestore, gameId]);

  const { data, isLoading, error } = useCollection<AiInsightContract>(insightsQuery);

  const insights = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.map((doc: WithId<AiInsightContract>) => mapAiInsight(doc));
  }, [data]);

  return { insights, isLoading, error };
}
