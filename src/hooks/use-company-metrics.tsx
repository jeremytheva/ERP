"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot, FirestoreError } from "firebase/firestore";
import { useAuth as useAppContextAuth } from "./use-auth";
import {
  useFirestore,
  useMemoFirebase,
  errorEmitter,
  FirestorePermissionError,
} from "@/firebase";
import type { CompanyMetrics, RoleMetrics, KpiHistoryEntry } from "@/types";

const METRICS_ID = "default_company";

const createHistoryEntry = (
  round: number,
  overrides: Partial<KpiHistoryEntry>
): KpiHistoryEntry => ({
  round,
  companyValuation: 0,
  netIncome: 0,
  inventoryValue: 0,
  cashBalance: 0,
  grossMargin: 0,
  marketShare: 0,
  averageSellingPrice: 0,
  inventoryTurnover: 0,
  capacityUtilization: 0,
  averagePriceGap: 0,
  warehouseCosts: 0,
  onTimeDeliveryRate: 0,
  cumulativeCO2eEmissions: 0,
  competitorAvgPrice: 0,
  grossRevenue: 0,
  cogs: 0,
  sustainabilityInvestment: 0,
  ...overrides,
});

const DEFAULT_ROLE_METRICS: Record<string, RoleMetrics> = {
  sales: {
    trend: [
      createHistoryEntry(1, {
        marketShare: 0.19,
        averageSellingPrice: 46,
        competitorAvgPrice: 43,
        grossRevenue: 1450000,
        cashBalance: 420000,
      }),
      createHistoryEntry(2, {
        marketShare: 0.22,
        averageSellingPrice: 47,
        competitorAvgPrice: 43.5,
        grossRevenue: 1625000,
        cashBalance: 455000,
      }),
      createHistoryEntry(3, {
        marketShare: 0.24,
        averageSellingPrice: 48,
        competitorAvgPrice: 44,
        grossRevenue: 1750000,
        cashBalance: 489000,
      }),
    ],
    peerComparison: [
      { name: "Team Atlas", companyValuation: 51000000 },
      { name: "Team Nova", companyValuation: 47500000 },
      { name: "Team Apex", companyValuation: 49800000 },
    ],
    tables: [
      {
        title: "Top Distribution Channels",
        description: "Revenue concentration by distribution channel.",
        columns: ["Channel", "Revenue", "Growth"],
        rows: [
          { Channel: "DC11", Revenue: "$450k", Growth: "+5%" },
          { Channel: "DC12", Revenue: "$395k", Growth: "+3%" },
          { Channel: "DC14", Revenue: "$360k", Growth: "+6%" },
        ],
      },
    ],
  },
  procurement: {
    trend: [
      createHistoryEntry(1, {
        cogs: 610000,
        warehouseCosts: 118000,
        cumulativeCO2eEmissions: 12200,
        cashBalance: 420000,
      }),
      createHistoryEntry(2, {
        cogs: 598000,
        warehouseCosts: 115000,
        cumulativeCO2eEmissions: 11850,
        cashBalance: 438000,
      }),
      createHistoryEntry(3, {
        cogs: 582000,
        warehouseCosts: 112500,
        cumulativeCO2eEmissions: 11500,
        cashBalance: 461000,
      }),
    ],
    peerComparison: [
      { name: "Team Atlas", companyValuation: 50500000 },
      { name: "Team Nova", companyValuation: 46800000 },
      { name: "Team Apex", companyValuation: 49500000 },
    ],
    tables: [
      {
        title: "Supplier Lead Times",
        description: "Average lead time and reliability for priority vendors.",
        columns: ["Vendor", "Lead Time", "Reliability"],
        rows: [
          { Vendor: "V01", "Lead Time": "2.5 days", Reliability: "98%" },
          { Vendor: "V02", "Lead Time": "3.0 days", Reliability: "95%" },
          { Vendor: "V03", "Lead Time": "4.5 days", Reliability: "93%" },
        ],
      },
    ],
  },
  production: {
    trend: [
      createHistoryEntry(1, {
        capacityUtilization: 0.62,
        inventoryTurnover: 2.7,
        warehouseCosts: 118000,
        inventoryValue: 305000,
      }),
      createHistoryEntry(2, {
        capacityUtilization: 0.68,
        inventoryTurnover: 2.9,
        warehouseCosts: 116000,
        inventoryValue: 298000,
      }),
      createHistoryEntry(3, {
        capacityUtilization: 0.73,
        inventoryTurnover: 3.1,
        warehouseCosts: 114500,
        inventoryValue: 289000,
      }),
    ],
    peerComparison: [
      { name: "Team Atlas", companyValuation: 51200000 },
      { name: "Team Nova", companyValuation: 47000000 },
      { name: "Team Apex", companyValuation: 50100000 },
    ],
    tables: [
      {
        title: "Bottleneck Analysis",
        description: "Critical work centers and current utilization.",
        columns: ["Work Center", "Utilization", "Queue"],
        rows: [
          { "Work Center": "WC-110", Utilization: "88%", Queue: "12 orders" },
          { "Work Center": "WC-220", Utilization: "74%", Queue: "6 orders" },
          { "Work Center": "WC-330", Utilization: "69%", Queue: "4 orders" },
        ],
      },
    ],
  },
  logistics: {
    trend: [
      createHistoryEntry(1, {
        cashBalance: 420000,
        warehouseCosts: 118000,
        onTimeDeliveryRate: 0.89,
      }),
      createHistoryEntry(2, {
        cashBalance: 448000,
        warehouseCosts: 115500,
        onTimeDeliveryRate: 0.91,
      }),
      createHistoryEntry(3, {
        cashBalance: 472500,
        warehouseCosts: 113000,
        onTimeDeliveryRate: 0.93,
      }),
    ],
    peerComparison: [
      { name: "Team Atlas", companyValuation: 50800000 },
      { name: "Team Nova", companyValuation: 46900000 },
      { name: "Team Apex", companyValuation: 49750000 },
    ],
    tables: [
      {
        title: "DC Performance Snapshot",
        description: "Inventory levels and fill rates by distribution center.",
        columns: ["DC", "Inventory Days", "Fill Rate"],
        rows: [
          { DC: "DC11", "Inventory Days": "12", "Fill Rate": "96%" },
          { DC: "DC12", "Inventory Days": "9", "Fill Rate": "93%" },
          { DC: "DC14", "Inventory Days": "14", "Fill Rate": "91%" },
        ],
      },
    ],
  },
  lead: {
    trend: [
      createHistoryEntry(1, {
        cashBalance: 420000,
        netIncome: 215000,
        marketShare: 0.19,
        averagePriceGap: 1.8,
        inventoryTurnover: 2.7,
        warehouseCosts: 118000,
        cumulativeCO2eEmissions: 12200,
      }),
      createHistoryEntry(2, {
        cashBalance: 452000,
        netIncome: 238000,
        marketShare: 0.21,
        averagePriceGap: 1.6,
        inventoryTurnover: 2.9,
        warehouseCosts: 116000,
        cumulativeCO2eEmissions: 11900,
      }),
      createHistoryEntry(3, {
        cashBalance: 489000,
        netIncome: 255000,
        marketShare: 0.23,
        averagePriceGap: 1.4,
        inventoryTurnover: 3.1,
        warehouseCosts: 113500,
        cumulativeCO2eEmissions: 11500,
      }),
    ],
    peerComparison: [
      { name: "Team Atlas", companyValuation: 52000000 },
      { name: "Team Nova", companyValuation: 47200000 },
      { name: "Team Apex", companyValuation: 50300000 },
    ],
    tables: [
      {
        title: "Cash Flow Summary",
        description: "Key liquidity drivers consolidated from all roles.",
        columns: ["Metric", "Current", "Trend"],
        rows: [
          { Metric: "Operating Cash Flow", Current: "$245k", Trend: "Stable" },
          { Metric: "Inventory Investment", Current: "$298k", Trend: "-3%" },
          { Metric: "Marketing Spend", Current: "$80k", Trend: "+6%" },
        ],
      },
      {
        title: "Strategic Alerts",
        description: "Cross-functional signals requiring leadership review.",
        columns: ["Alert", "Owner", "Status"],
        rows: [
          { Alert: "RM Buffer below target", Owner: "Procurement", Status: "Monitor" },
          { Alert: "DC14 fill rate", Owner: "Logistics", Status: "Action" },
          { Alert: "Gross margin lag", Owner: "Sales", Status: "Analysis" },
        ],
      },
    ],
  },
};

const DEFAULT_COMPANY_METRICS: CompanyMetrics = {
  id: METRICS_ID,
  roles: DEFAULT_ROLE_METRICS,
};

export function useCompanyMetrics() {
  const { user } = useAppContextAuth();
  const firestore = useFirestore();
  const [metrics, setMetrics] = useState<CompanyMetrics>(DEFAULT_COMPANY_METRICS);
  const [isLoading, setIsLoading] = useState(true);

  const metricsDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "companyMetrics", METRICS_ID);
  }, [user, firestore]);

  useEffect(() => {
    if (!metricsDocRef) {
      setMetrics(DEFAULT_COMPANY_METRICS);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = onSnapshot(
      metricsDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as CompanyMetrics;
          setMetrics((prev) => ({
            ...prev,
            ...data,
            roles: {
              ...DEFAULT_COMPANY_METRICS.roles,
              ...prev.roles,
              ...data.roles,
            },
          }));
        } else {
          setMetrics(DEFAULT_COMPANY_METRICS);
        }
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        if (metricsDocRef) {
          const contextualError = new FirestorePermissionError({
            path: metricsDocRef.path,
            operation: "get",
          });
          errorEmitter.emit("permission-error", contextualError);
        }
        setMetrics(DEFAULT_COMPANY_METRICS);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [metricsDocRef]);

  return { metrics, isLoading };
}
