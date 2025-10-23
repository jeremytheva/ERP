
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
import { Bot, LayoutDashboard, Boxes, Lightbulb, BookText, ListTodo, Users, Settings, ClipboardCheck } from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scenario-planning", label: "Scenario Planning", icon: Boxes },
  { href: "/strategic-advisor", label: "Strategic Advisor", icon: Lightbulb },
  { href: "/debriefing", label: "Round Debriefing", icon: BookText },
  { href: "/tasks", label: "Tasks", icon: ClipboardCheck },
  { href: "/action-items", label: "Action Items", icon: ListTodo },
  { href: "/competitor-log", label: "Competitor Log", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MainSidebar() {
  const pathname = usePathname();

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
        {menuItems.map(({ href, label, icon: Icon }) => (
          <SidebarMenuItem key={href}>
            <Link href={href} passHref>
              <SidebarMenuButton
                as="a"
                isActive={pathname === href}
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
