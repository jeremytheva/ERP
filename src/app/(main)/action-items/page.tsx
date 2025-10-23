import { ActionItemsManager } from "@/components/action-items-manager";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ListTodo } from "lucide-react";

export default function ActionItemsPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <ListTodo className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">My Action Items</CardTitle>
              <CardDescription>
                Your personal to-do list. Track tasks, mark them as complete, and stay organized.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ActionItemsManager />
        </CardContent>
      </Card>
    </div>
  );
}
