
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bot, LayoutDashboard, Boxes, Lightbulb, BookText, ListTodo, Users, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTeamSettings } from "@/hooks/use-team-settings";
import { useMemo } from "react";
import type { Role } from "@/types";

const allMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Sales", "Procurement", "Production", "Logistics", "Team Leader"] },
  { href: "/action-items", label: "Action Items", icon: ListTodo, roles: ["Sales", "Procurement", "Production", "Logistics", "Team Leader"] },
  { href: "/competitor-log", label: "Competitor Log", icon: Users, roles: ["Sales", "Procurement", "Production", "Logistics", "Team Leader"] },
  { href: "/scenario-planning", label: "Scenario Planning", icon: Boxes, roles: ["Sales", "Team Leader"] },
  { href: "/strategic-advisor", label: "Strategic Advisor", icon: Lightbulb, roles: ["Sales", "Team Leader"] },
  { href: "/debriefing", label: "Round Debriefing", icon: BookText, roles: ["Team Leader"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["Team Leader"] },
];

export function MainSidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const { teamLeader } = useTeamSettings();

  const userRoles = useMemo(() => {
    if (!profile) return [];
    const roles: Role[] = [profile.id as Role];
    if (profile.id === teamLeader) {
      roles.push("Team Leader");
    }
    return roles;
  }, [profile, teamLeader]);

  const visibleMenuItems = useMemo(() => {
    return allMenuItems.filter(item => 
      item.roles.some(role => userRoles.includes(role))
    );
  }, [userRoles]);


  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-primary" asChild>
                <Link href="/dashboard">
                    <Bot size={24}/>
                </Link>
            </Button>
            <span className="font-semibold text-lg font-headline">ERPsim</span>
         </div>
        <SidebarTrigger className="hidden md:flex" />
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-2">
        {visibleMenuItems.map(({ href, label, icon: Icon }) => (
          <SidebarMenuItem key={href}>
            <Link href={href} passHref>
              <SidebarMenuButton
                as="a"
                isActive={pathname.startsWith(href)}
                tooltip={{ children: label, side: "right", align:"center" }}
                className="justify-start"
              >
                <Icon />
                <span>{label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter className="p-2">
      </SidebarFooter>
    </Sidebar>
  );
}
