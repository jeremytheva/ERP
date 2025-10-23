
import { TeamSettings } from "@/components/settings/team-settings";
import { RoleTasks } from "@/components/settings/role-tasks";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, ListChecks } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Tabs defaultValue="team-config">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="team-config">
            <Settings className="mr-2" />
            Team Configuration
          </TabsTrigger>
          <TabsTrigger value="role-tasks">
            <ListChecks className="mr-2" />
            Role Tasks
          </TabsTrigger>
        </TabsList>
        <TabsContent value="team-config">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Team Settings</CardTitle>
              <CardDescription>
                Configure your team structure and assign a Team Leader. The Team Leader will have additional responsibilities and tasks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamSettings />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="role-tasks">
           <Card>
            <CardHeader>
              <CardTitle className="font-headline text-3xl">Role Tasks</CardTitle>
              <CardDescription>
                A breakdown of the standard tasks for each role per round. The assigned Team Leader inherits additional leadership tasks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoleTasks />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
