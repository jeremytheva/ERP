
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

const baseMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/action-items", label: "Action Items", icon: ListTodo },
  { href: "/settings", label: "Settings", icon: Settings },
];

const salesMenuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/action-items", label: "Action Items", icon: ListTodo },
  { href: "/scenario-planning", label: "Scenario Planning", icon: Boxes },
  { href: "/strategic-advisor", label: "Strategic Advisor", icon: Lightbulb },
  { href: "/settings", label: "Settings", icon: Settings },
];

const procurementMenuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/action-items", label: "Action Items", icon: ListTodo },
    { href: "/settings", label: "Settings", icon: Settings },
];
const productionMenuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/action-items", label: "Action Items", icon: ListTodo },
    { href: "/settings", label: "Settings", icon: Settings },
];
const logisticsMenuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/action-items", label: "Action Items", icon: ListTodo },
    { href: "/settings", label: "Settings", icon: Settings },
];

const teamLeaderMenuItems = [
  { href: "/scenario-planning", label: "Scenario Planning", icon: Boxes },
  { href: "/strategic-advisor", label: "Strategic Advisor", icon: Lightbulb },
  { href: "/debriefing", label: "Round Debriefing", icon: BookText },
  { href: "/settings", label: "Settings", icon: Settings },
];

const roleMenus: Record<Role, typeof baseMenuItems> = {
    "Sales": salesMenuItems,
    "Procurement": procurementMenuItems,
    "Production": productionMenuItems,
    "Logistics": logisticsMenuItems,
    "Team Leader": teamLeaderMenuItems, // Team leader base is different
};

export function MainSidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const { teamLeader } = useTeamSettings();

  const visibleMenuItems = useMemo(() => {
    if (!profile) return [];
    
    let menu = roleMenus[profile.id as Role] || baseMenuItems;

    if (profile.id === teamLeader) {
      const combined = [...menu, ...teamLeaderMenuItems];
      // Remove duplicates by href, ensuring Team Leader items take precedence if defined in both
      const uniqueMenuItems = Array.from(new Map(combined.map(item => [item.href, item])).values());
      menu = uniqueMenuItems;
    }
    
    // Sort menu items to a consistent order
    const desiredOrder = ["/dashboard", "/action-items", "/scenario-planning", "/strategic-advisor", "/debriefing", "/settings"];
    menu.sort((a, b) => desiredOrder.indexOf(a.href) - desiredOrder.indexOf(b.href));

    return menu;
  }, [profile, teamLeader]);


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
