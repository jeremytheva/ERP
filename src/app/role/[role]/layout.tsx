import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { ShellLayout } from "@/components/shell-layout";
import { getRoleMetadata } from "@/lib/role-metadata";

interface RoleLayoutProps {
  children: ReactNode;
  params: { role: string };
}

export default function RoleLayout({ children, params }: RoleLayoutProps) {
  const metadata = getRoleMetadata(params.role);

  if (!metadata) {
    notFound();
  }

  return (
    <ShellLayout
      title={metadata.title}
      description={metadata.description}
      navItems={metadata.navItems}
    >
      {children}
    </ShellLayout>
  );
}
