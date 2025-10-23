
"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ALL_TASKS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority } from "@/types";
import { Clock, Code, Link as LinkIcon, User } from "lucide-react";

type Role = "Procurement" | "Production" | "Logistics" | "Sales" | "Team Leader";

const ROLES: Role[] = ["Procurement", "Production", "Logistics", "Sales", "Team Leader"];

const priorityVariant: { [key in TaskPriority]: "destructive" | "default" | "secondary" | "outline" } = {
  Critical: "destructive",
  High: "default",
  Medium: "secondary",
  Low: "outline"
};

export function RoleTasks() {
  const tasksByRole = ROLES.reduce((acc, role) => {
    acc[role] = ALL_TASKS.filter((task) => task.role === role);
    return acc;
  }, {} as Record<Role, Task[]>);

  return (
    <Accordion type="multiple" defaultValue={["Sales", "Team Leader"]}>
      {ROLES.map((role) => (
        <AccordionItem value={role} key={role}>
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            {role}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {tasksByRole[role].length > 0 ? (
                tasksByRole[role].map((task) => (
                  <div key={task.id} className="p-4 rounded-lg border bg-card/50 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">{task.title}</h4>
                      <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5" title="Transaction Code">
                        <Code className="h-3.5 w-3.5" />
                        <code>{task.transactionCode}</code>
                      </div>
                      <div className="flex items-center gap-1.5" title="Estimated Time">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{task.estimatedTime} min</span>
                      </div>
                      {task.dependencyIDs.length > 0 && (
                        <div className="flex items-center gap-1.5" title="Dependencies">
                          <LinkIcon className="h-3.5 w-3.5" />
                          <span>Depends on {task.dependencyIDs.join(", ")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No tasks defined for this role.</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
