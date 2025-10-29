"use client";

import { useMemo } from "react";
interface RoleSelectorProps {
  roles: string[];
  selectedRoles: string[];
  onChange: (roles: string[]) => void;
}

export function RoleSelector({ roles, selectedRoles, onChange }: RoleSelectorProps) {
  const uniqueRoles = useMemo(() => Array.from(new Set(roles)), [roles]);
  const teamLeaderSelected = selectedRoles.includes("Team Leader");

  const handleToggle = (role: string) => {
    if (role === "Team Leader") {
      if (teamLeaderSelected) {
        onChange([]);
      } else {
        onChange(uniqueRoles);
      }
      return;
    }

    const withoutTeamLeader = selectedRoles.filter((item) => item !== "Team Leader");
    const isActive = withoutTeamLeader.includes(role);

    let nextRoles: string[];
    if (isActive) {
      nextRoles = withoutTeamLeader.filter((item) => item !== role);
    } else {
      nextRoles = [...withoutTeamLeader, role];
    }

    onChange(nextRoles);
  };

  const isRoleChecked = (role: string) => {
    if (role === "Team Leader") {
      return teamLeaderSelected || selectedRoles.length === uniqueRoles.length;
    }

    if (teamLeaderSelected) {
      return true;
    }

    return selectedRoles.includes(role);
  };

  return (
    <section className="rounded-xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur">
      <header className="mb-4">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Step 1</p>
        <h2 className="font-headline text-2xl">Choose your active roles</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Team Leader automatically views every role. Select multiple roles to focus the task queue.
        </p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {uniqueRoles.map((role) => {
          const checked = isRoleChecked(role);
          return (
            <label
              key={role}
              className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition hover:border-primary/80 hover:bg-primary/5 ${
                checked ? "border-primary bg-primary/10" : "border-border"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleToggle(role)}
                  className="h-4 w-4 accent-primary"
                />
                <span className="font-medium">{role}</span>
              </div>
              {role === "Team Leader" ? (
                <span className="text-xs text-muted-foreground">Toggle every role at once.</span>
              ) : (
                <span className="text-xs text-muted-foreground">Focus on {role} workflows.</span>
              )}
            </label>
          );
        })}
      </div>
    </section>
  );
}
