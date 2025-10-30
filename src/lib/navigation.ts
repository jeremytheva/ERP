import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BarChart2,
  ShoppingCart,
  Factory,
  Truck,
  LineChart,
  FileText,
  Database,
  Lightbulb,
  Users,
} from "lucide-react";

import type { RoleComponentKey } from "@/lib/firebase/firestore-schema";

export interface RoleNavigationItem {
  key: RoleComponentKey;
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const ROLE_NAVIGATION_ITEMS: Record<RoleComponentKey, RoleNavigationItem> = {
  dashboard: {
    key: "dashboard",
    href: "/dashboard",
    label: "Dashboard",
    description: "High-level KPIs and timers for the current round.",
    icon: LayoutDashboard,
  },
  keyMetrics: {
    key: "keyMetrics",
    href: "/key-metrics",
    label: "Key Metrics",
    description: "Detailed performance metrics with historical trends.",
    icon: BarChart2,
  },
  procurement: {
    key: "procurement",
    href: "/procurement",
    label: "Sourcing & Ordering",
    description: "Manage purchasing tasks, supplier mix, and sustainability.",
    icon: ShoppingCart,
  },
  production: {
    key: "production",
    href: "/production",
    label: "Production Planning",
    description: "Plan production runs, sequencing, and shop-floor execution.",
    icon: Factory,
  },
  logistics: {
    key: "logistics",
    href: "/logistics",
    label: "Liquidity & Transfers",
    description: "Handle cash movements, deliveries, and warehouse flow.",
    icon: Truck,
  },
  sales: {
    key: "sales",
    href: "/sales",
    label: "Market Analysis (ZMARKET)",
    description: "Monitor demand signals, competitor pricing, and promotions.",
    icon: LineChart,
  },
  scenarioPlanning: {
    key: "scenarioPlanning",
    href: "/scenario-planning",
    label: "Scenario Planning",
    description: "Run what-if analyses on pricing, marketing, and demand.",
    icon: Lightbulb,
  },
  debriefing: {
    key: "debriefing",
    href: "/debriefing",
    label: "Debriefing",
    description: "Forecast demand and capture cross-team investment decisions.",
    icon: FileText,
  },
  liveInventory: {
    key: "liveInventory",
    href: "/live-inventory",
    label: "Inventory / Stock Status",
    description: "Track live inventory, RM movements, and fulfillment.",
    icon: FileText,
  },
  masterData: {
    key: "masterData",
    href: "/master-data",
    label: "Reference & Master Data",
    description: "Access ERP constants, data fields, and reference tables.",
    icon: Database,
  },
  strategicAdvisor: {
    key: "strategicAdvisor",
    href: "/strategic-advisor",
    label: "Strategic Advisor",
    description: "Synthesize KPIs, AI recommendations, and leadership tasks.",
    icon: Lightbulb,
  },
  competitorLog: {
    key: "competitorLog",
    href: "/competitor-log",
    label: "Competitor Log",
    description: "Curate competitor observations and AI-driven insights.",
    icon: Users,
  },
};

export const getRoleNavigationItems = (componentKeys: RoleComponentKey[]) =>
  componentKeys
    .map((key) => ROLE_NAVIGATION_ITEMS[key])
    .filter((item): item is RoleNavigationItem => Boolean(item));
