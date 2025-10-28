
import { TeamSettings } from "@/components/settings/team-settings";
import { TaskManager } from "@/components/tasks/task-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, ClipboardCheck } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
       <Tabs defaultValue="team">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="team">
            <Settings className="mr-2 h-4 w-4" />
            Team Settings
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Task Management
            </TabsTrigger>
        </TabsList>
        <TabsContent value="team" className="mt-6">
            <TeamSettings />
        </TabsContent>
        <TabsContent value="tasks" className="mt-6">
            <TaskManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
