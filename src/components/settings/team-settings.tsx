
"use client";

import { useTeamSettings } from "@/hooks/use-team-settings";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUserProfiles } from "@/hooks/use-user-profiles";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { USER_PROFILES } from "@/hooks/use-user-profiles";

export function TeamSettings() {
  const {
    teamLeader,
    setTeamLeader,
    aiSuggestionsEnabled,
    setAiSuggestionsEnabled,
  } = useTeamSettings();
  const { profiles } = useUserProfiles();

  const availableRoles = profiles.length > 0 ? profiles : USER_PROFILES;


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign Team Leader</CardTitle>
          <CardDescription>
            The Team Leader will have additional responsibilities and tasks. This can be any role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={teamLeader || ""}
            onValueChange={setTeamLeader}
            className="space-y-2"
          >
            {availableRoles.map((profile) => (
              <div key={profile.id} className="flex items-center space-x-2">
                <RadioGroupItem value={profile.id} id={profile.id} />
                <Label htmlFor={profile.id}>{profile.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Suggestions</CardTitle>
          <CardDescription>
            Allow the app to automatically request AI suggestions when you open a task with configurable fields.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Disable this if you prefer to fill in task inputs manually or when AI credentials are unavailable.
              </p>
            </div>
            <Switch
              id="ai-suggestions-enabled"
              checked={aiSuggestionsEnabled}
              onCheckedChange={setAiSuggestionsEnabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
