import type { ReactNode } from "react";
import { ShellLayout } from "@/components/layout/shell-layout";
import { fetchRoleMetadata } from "@/lib/firebase";

interface RoleLayoutProps {
  children: ReactNode;
  params: { roleId: string };
}

export default async function RoleLayout({ children, params }: RoleLayoutProps) {
  const roleMetadata = await fetchRoleMetadata(params.roleId);

  return (
    <ShellLayout
      roleMetadata={
        roleMetadata ?? {
          id: params.roleId,
          name: params.roleId.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
        }
      }
    >
      {children}
    </ShellLayout>
  );
}
