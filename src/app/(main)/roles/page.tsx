
"use client";

import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useTeamSettings } from "@/hooks/use-team-settings";
import { SalesManagerView } from "@/components/roles/sales-manager-view";
import { ProductionManagerView } from "@/components/roles/production-manager-view";
import { ProcurementManagerView } from "@/components/roles/procurement-manager-view";
import { LogisticsManagerView } from "@/components/roles/logistics-manager-view";
import type { Role } from "@/types";

export default function RolesPage() {
    const searchParams = useSearchParams();
    const { profile } = useAuth();
    const { teamLeader } = useTeamSettings();

    const isTeamLeader = profile?.id === teamLeader;
    const activeRole = profile?.name as Role;
    const activeSection = searchParams.get("section") || getDefaultSection(activeRole);

    function getDefaultSection(role: Role) {
        switch (role) {
            case "Sales": return "market-analysis";
            case "Production": return "planning-capacity";
            case "Procurement": return "inventory-check";
            case "Logistics": return "liquidity-check";
            default: return "";
        }
    }

    const renderRoleView = () => {
        switch (activeRole) {
            case "Sales":
                return <SalesManagerView activeSection={activeSection} />;
            case "Production":
                return <ProductionManagerView activeSection={activeSection} />;
            case "Procurement":
                return <ProcurementManagerView activeSection={activeSection} />;
            case "Logistics":
                return <LogisticsManagerView activeSection={activeSection} />;
            default:
                return <p>No view available for your role.</p>;
        }
    };

    return (
        <div className="container mx-auto py-8">
            {renderRoleView()}
        </div>
    );
}
