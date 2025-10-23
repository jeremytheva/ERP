import { TaskManager } from "@/components/tasks/task-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <ClipboardCheck className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">Task Management</CardTitle>
              <CardDescription>
                View, add, and edit tasks for each role, organized by game round.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TaskManager />
        </CardContent>
      </Card>
    </div>
  );
}
