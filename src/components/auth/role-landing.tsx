"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { RoleNavigationItem } from "@/lib/navigation";

interface RoleLandingProps {
  title: string;
  description: string;
  navItems: RoleNavigationItem[];
}

export const RoleLanding = ({ title, description, navItems }: RoleLandingProps) => {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <p className="text-sm text-muted-foreground">
            Select a workspace below to jump directly into the tools and dashboards curated for this role.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {navItems.map(({ key, href, label, description: itemDescription, icon: Icon }) => (
          <Card key={key} className="flex flex-col">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">{label}</CardTitle>
                <CardDescription>{itemDescription}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              <Button asChild className="w-full">
                <Link href={href}>Open {label}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
