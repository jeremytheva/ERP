
"use client";

import { useTeamSettings } from "@/hooks/use-team-settings";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { USER_PROFILES } from "@/lib/mock-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export function TeamSettings() {
  const { teamLeader, setTeamLeader } = useTeamSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Team Leader</CardTitle>
        <CardDescription>
          The Team Leader will have additional responsibilities and tasks.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
