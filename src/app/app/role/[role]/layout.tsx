"use client";

import { ShellLayout } from "@/components/layout/shell-layout";

interface RoleLayoutProps {
  children: React.ReactNode;
  params: { role: string };
}

export default function RoleLayout({ children, params }: RoleLayoutProps) {
  return <ShellLayout role={params.role}>{children}</ShellLayout>;
}
