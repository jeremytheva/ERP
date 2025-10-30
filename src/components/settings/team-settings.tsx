
"use client";

import { useTeamSettings, TEAM_LEADER_ROLE_ID } from "@/hooks/use-team-settings";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserProfiles } from "@/hooks/use-user-profiles";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { USER_PROFILES } from "@/hooks/use-user-profiles";
import { useMemo } from "react";

export function TeamSettings() {
  const { visibleRoleIds, setRoleVisibility } = useTeamSettings();
  const { profiles } = useUserProfiles();

  const availableRoles = useMemo(() => {
    const baseRoles = (profiles.length > 0 ? profiles : USER_PROFILES).map(({ id, name }) => ({ id, name }));
    return [
      ...baseRoles,
      { id: TEAM_LEADER_ROLE_ID, name: "Team Leader" },
    ];
  }, [profiles]);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Visible Roles</CardTitle>
        <CardDescription>
          Choose which roles should surface their insights and tasks on the main workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {availableRoles.map((role) => {
            const isChecked = visibleRoleIds.includes(role.id);

            return (
              <div key={role.id} className="flex items-center space-x-3">
                <Checkbox
                  id={role.id}
                  checked={isChecked}
                  onCheckedChange={(checked) => setRoleVisibility(role.id, checked === true)}
                />
                <Label htmlFor={role.id} className="leading-tight">
                  {role.name}
                </Label>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
