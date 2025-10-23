
import { TeamSettings } from "@/components/settings/team-settings";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Settings className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">Team Settings</CardTitle>
              <CardDescription>
                Configure your team structure and assign roles.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TeamSettings />
        </CardContent>
      </Card>
    </div>
  );
}
