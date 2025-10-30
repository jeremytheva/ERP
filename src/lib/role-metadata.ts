import { ClipboardList, Factory, Package, ShoppingCart, Users } from "lucide-react";

import type { ShellNavItem } from "@/components/shell-layout";

export type RoleNavItem = ShellNavItem;

export interface RoleMetadata {
  id: string;
  title: string;
  description: string;
  navItems: RoleNavItem[];
}

export const ROLE_METADATA: Record<string, RoleMetadata> = {
  "team-leader": {
    id: "team-leader",
    title: "Team Leader",
    description: "Strategic overview, AI guidance, and cross-functional KPIs.",
    navItems: [
      { title: "Overview", href: "/role/team-leader", icon: Users },
      { title: "KPIs", href: "/role/team-leader/kpis", icon: ClipboardList },
      { title: "Action Items", href: "/role/team-leader/action-items", icon: Package },
    ],
  },
  sales: {
    id: "sales",
    title: "Sales Manager",
    description: "Monitor demand signals and adjust price and marketing levers.",
    navItems: [
      { title: "Overview", href: "/role/sales", icon: ShoppingCart },
      { title: "Pipeline", href: "/role/sales/pipeline", icon: ClipboardList },
      { title: "Insights", href: "/role/sales/insights", icon: Users },
    ],
  },
  procurement: {
    id: "procurement",
    title: "Procurement Manager",
    description: "Track supplier reliability, cost exposure, and purchase timing.",
    navItems: [
      { title: "Overview", href: "/role/procurement", icon: Package },
      { title: "Suppliers", href: "/role/procurement/suppliers", icon: ClipboardList },
      { title: "Risks", href: "/role/procurement/risks", icon: Users },
    ],
  },
  production: {
    id: "production",
    title: "Production Manager",
    description: "Balance capacity, cost, and sustainability KPIs for the shop floor.",
    navItems: [
      { title: "Overview", href: "/role/production", icon: Factory },
      { title: "Capacity", href: "/role/production/capacity", icon: ClipboardList },
      { title: "Quality", href: "/role/production/quality", icon: Users },
    ],
  },
  logistics: {
    id: "logistics",
    title: "Logistics Manager",
    description: "Coordinate distribution center health and fulfillment velocity.",
    navItems: [
      { title: "Overview", href: "/role/logistics", icon: Package },
      { title: "Network", href: "/role/logistics/network", icon: ClipboardList },
      { title: "SLA", href: "/role/logistics/sla", icon: Users },
    ],
  },
};

export function getRoleMetadata(role: string) {
  return ROLE_METADATA[role];
}
