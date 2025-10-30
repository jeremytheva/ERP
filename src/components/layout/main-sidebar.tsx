

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
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bot, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTeamSettings } from "@/hooks/use-team-settings";
import { useMemo } from "react";
import { getRoleNavigationItems } from "@/lib/navigation";
import {
  ROLE_DEFINITIONS,
  TEAM_LEADER_DEFINITION,
  isRoleSlug,
} from "@/lib/firebase/firestore-schema";


export function MainSidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const { teamLeader } = useTeamSettings();

  const isTeamLeader = profile?.id && profile.id === teamLeader;

  const menuItems = useMemo(() => {
    if (isTeamLeader) {
      return getRoleNavigationItems(TEAM_LEADER_DEFINITION.permittedComponents);
    }

    if (profile?.id && isRoleSlug(profile.id)) {
      return getRoleNavigationItems(ROLE_DEFINITIONS[profile.id].permittedComponents);
    }

    return [];
  }, [profile, isTeamLeader]);

  const homeHref = useMemo(() => {
    if (isTeamLeader) {
      return TEAM_LEADER_DEFINITION.defaultPath;
    }

    if (profile?.id && isRoleSlug(profile.id)) {
      return ROLE_DEFINITIONS[profile.id].defaultPath;
    }

    return "/dashboard";
  }, [profile, isTeamLeader]);

  const isActive = (href: string) => {
    if (pathname === href) {
      return true;
    }

    if (isTeamLeader && href !== "/dashboard" && pathname.startsWith(href)) {
      return true;
    }

    return false;
  };

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 text-primary" asChild>
                <Link href={homeHref}>
                    <Bot size={24}/>
                </Link>
            </Button>
            <span className="font-semibold text-lg font-headline">ERPsim</span>
         </div>
        <SidebarTrigger className="hidden md:flex" />
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-2">
        <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            {menuItems.map(({ href, label, icon: Icon }) => {
              return (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(href)}
                    tooltip={{ children: label, side: "right", align: "center" }}
                    className="justify-start"
                  >
                    <Link href={href}>
                      <Icon />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
        </SidebarGroup>
        
        <SidebarSeparator />
        
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith("/settings")}
            tooltip={{ children: "Settings", side: "right", align: "center" }}
            className="justify-start"
          >
            <Link href="/settings">
              <Settings />
              <span>Settings</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        
      </SidebarMenu>
      <SidebarFooter className="p-2">
      </SidebarFooter>
    </Sidebar>
  );
}
