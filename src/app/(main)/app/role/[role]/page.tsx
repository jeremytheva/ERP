import { notFound } from "next/navigation";

import { RoleLanding } from "@/components/auth/role-landing";
import {
  ROLE_DEFINITIONS,
  TEAM_LEADER_DEFINITION,
  TEAM_LEADER_SLUG,
  isRoleSlug,
} from "@/lib/firebase/firestore-schema";
import { getRoleNavigationItems } from "@/lib/navigation";

interface RolePageProps {
  params: {
    role: string;
  };
}

const buildRoleLanding = (roleKey: string) => {
  if (isRoleSlug(roleKey)) {
    const definition = ROLE_DEFINITIONS[roleKey];
    return {
      title: `${definition.displayName} Workspace`,
      description: definition.description,
      navItems: getRoleNavigationItems(definition.permittedComponents),
    };
  }

  if (roleKey === TEAM_LEADER_SLUG) {
    return {
      title: `${TEAM_LEADER_DEFINITION.displayName} Workspace`,
      description: TEAM_LEADER_DEFINITION.description,
      navItems: getRoleNavigationItems(TEAM_LEADER_DEFINITION.permittedComponents),
    };
  }

  return null;
};

export default function RolePage({ params }: RolePageProps) {
  const landing = buildRoleLanding(params.role);

  if (!landing) {
    notFound();
  }

  return <RoleLanding {...landing} />;
}
