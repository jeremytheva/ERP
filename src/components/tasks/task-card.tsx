"use client";

import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority, Role } from "@/types";
import { Clock, Code, Link as LinkIcon, FilePenLine } from "lucide-react";

interface TaskCardProps {
  role: Role;
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const priorityVariant: Record<TaskPriority, "default" | "secondary" | "outline"> = {
  High: "default",
  Medium: "secondary",
  Low: "outline",
};

export function TaskCard({ role, tasks, onEditTask }: TaskCardProps) {
  return (
    <AccordionItem value={role}>
      <AccordionTrigger className="text-base font-semibold hover:no-underline">
        {role} ({tasks.length})
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <div key={task.id} className="p-4 rounded-lg border bg-card/50 space-y-3 group relative">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold">{task.title}</h4>
                  <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{task.description}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  {task.transactionCode && (
                    <div className="flex items-center gap-1.5" title="Transaction Code">
                      <Code className="h-3.5 w-3.5" />
                      <code>{task.transactionCode}</code>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5" title="Estimated Time">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{task.estimatedTime} min</span>
                  </div>
                  {task.dependencyIDs && task.dependencyIDs.length > 0 && (
                    <div className="flex items-center gap-1.5" title="Dependencies">
                      <LinkIcon className="h-3.5 w-3.5" />
                      <span>Depends on {task.dependencyIDs.join(", ")}</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100"
                  onClick={() => onEditTask(task)}
                >
                  <FilePenLine className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No tasks defined for this role in this round.
            </p>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
