
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Task, TaskDataField, TaskPriority } from "@/types";
import { Clock, Code, ChevronDown, CheckCircle, Circle, AlertTriangle, Info } from "lucide-react";
import { Separator } from "../ui/separator";
import { Card } from "../ui/card";

interface InteractiveTaskCardProps {
  task: Task;
  allTasks: Task[];
  isActive: boolean;
  onToggle: () => void;
  onUpdate: (task: Task) => void;
}

const priorityVariant: { [key in TaskPriority]: "destructive" | "default" | "secondary" | "outline" } = {
  Critical: "destructive",
  High: "default",
  Medium: "secondary",
  Low: "outline",
};

const completionIcon = (task: Task) => {
    if (task.completionType === "Data-Confirmed") {
        const allFieldsFilled = task.dataFields?.every(df => 
            df.value !== undefined && df.value !== null && df.value !== ''
        );
        return allFieldsFilled ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5 text-muted-foreground" />;
    }
    return task.completed ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5 text-muted-foreground" />;
};


export function InteractiveTaskCard({ task, allTasks, isActive, onToggle, onUpdate }: InteractiveTaskCardProps) {
    const isCompleted = task.completed;
    const dependencies = task.dependencyIDs?.map(depId => allTasks.find(t => t.id === depId)).filter(Boolean) as Task[] | undefined;
    const areDependenciesMet = !dependencies || dependencies.every(dep => dep.completed);

    const generateFormSchema = (dataFields: TaskDataField[]) => {
        const schemaShape: { [key: string]: z.ZodType<any, any> } = {};
        dataFields.forEach(field => {
            switch (field.dataType) {
                case "Currency":
                case "Integer":
                    schemaShape[field.fieldName] = z.coerce.number().min(0, "Value must be positive.");
                    break;
                case "String":
                    schemaShape[field.fieldName] = z.string().min(1, "This field is required.");
                    break;
                default:
                    schemaShape[field.fieldName] = z.any();
            }
        });
        return z.object(schemaShape);
    };

    const form = useForm({
        resolver: task.dataFields ? zodResolver(generateFormSchema(task.dataFields)) : undefined,
        defaultValues: task.dataFields?.reduce((acc, field) => {
            acc[field.fieldName] = field.value ?? field.suggestedValue ?? '';
            return acc;
        }, {} as Record<string, any>)
    });

    const handleMarkComplete = (completed: boolean) => {
        let updatedDataFields = task.dataFields;

        if (task.dataFields) {
             form.trigger().then(isValid => {
                if (isValid) {
                    const values = form.getValues();
                    updatedDataFields = task.dataFields?.map(df => ({...df, value: values[df.fieldName]}));
                    onUpdate({ ...task, completed, dataFields: updatedDataFields });
                } else if (!completed) {
                    // Allow marking as incomplete even if form is invalid
                    onUpdate({ ...task, completed });
                }
             });
        } else {
            onUpdate({ ...task, completed });
        }
    };


  return (
    <Card className={cn(
        "transition-all",
        isCompleted ? "bg-card/50" : "bg-card",
        isActive && "ring-2 ring-primary"
    )}>
        <Collapsible open={isActive} onOpenChange={onToggle}>
            <CollapsibleTrigger asChild>
                 <div className="flex items-center gap-4 p-4 cursor-pointer">
                    <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMarkComplete(!task.completed)}}>
                        {completionIcon(task)}
                    </div>
                    <div className="flex-1">
                        <p className={cn("font-semibold", isCompleted && "line-through text-muted-foreground")}>
                            {task.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                             <div className="flex items-center gap-1.5" title="Transaction Code">
                                <Code className="h-3.5 w-3.5" />
                                <code>{task.transactionCode}</code>
                            </div>
                            <div className="flex items-center gap-1.5" title="Estimated Time">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{task.estimatedTime} min</span>
                            </div>
                        </div>
                    </div>
                    <Badge variant={priorityVariant[task.priority]} className="hidden sm:inline-flex">{task.priority}</Badge>
                    <ChevronDown className={cn("h-5 w-5 transition-transform", isActive && "rotate-180")} />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <Separator />
                <div className="p-6 space-y-6">
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                    
                    {!areDependenciesMet && dependencies && (
                         <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4 text-sm text-amber-200">
                             <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-amber-100">Dependencies Not Met</h4>
                                    <p>This task is blocked until the following tasks are completed:</p>
                                    <ul className="mt-2 list-disc pl-5">
                                        {dependencies.filter(d => !d.completed).map(dep => <li key={dep.id}>{dep.title}</li>)}
                                    </ul>
                                </div>
                             </div>
                         </div>
                    )}
                    
                    {task.dataFields && (
                        <Form {...form}>
                            <form className="space-y-4">
                                {task.dataFields.map(field => (
                                     <Card key={field.fieldName} className="bg-secondary/50 p-4">
                                        <FormField
                                            control={form.control}
                                            name={field.fieldName}
                                            render={({ field: formField }) => (
                                                <FormItem>
                                                    <FormLabel>{field.fieldName.replace(/_/g, ' ')}</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            type={field.dataType === "Currency" || field.dataType === "Integer" ? "number" : "text"}
                                                            {...formField}
                                                            className="bg-background"
                                                            step={field.dataType === "Currency" ? "0.01" : "1"}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {field.aiRationale && (
                                             <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                                                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                                                <p>
                                                    <span className="font-semibold">AI Rationale:</span> {field.aiRationale}
                                                </p>
                                            </div>
                                        )}
                                     </Card>
                                ))}
                            </form>
                        </Form>
                    )}

                    <div className="flex justify-end">
                        <Button onClick={() => handleMarkComplete(!isCompleted)} disabled={!areDependenciesMet}>
                            {isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
                        </Button>
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    </Card>
  );
}
