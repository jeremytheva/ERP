
"use client";

import { useTeamSettings } from "@/hooks/use-team-settings";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { USER_PROFILES } from "@/lib/mock-data";

export function TeamSettings() {
  const { teamLeader, setTeamLeader } = useTeamSettings();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Assign Team Leader</h3>
        <p className="text-sm text-muted-foreground">
          The Team Leader will have additional responsibilities and tasks.
        </p>
      </div>
      <RadioGroup
        value={teamLeader || ""}
        onValueChange={setTeamLeader}
        className="space-y-2"
      >
        {USER_PROFILES.map((profile) => (
          <div key={profile.id} className="flex items-center space-x-2">
            <RadioGroupItem value={profile.id} id={profile.id} />
            <Label htmlFor={profile.id}>{profile.name}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
