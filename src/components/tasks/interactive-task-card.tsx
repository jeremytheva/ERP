
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
import type { Task, TaskDataField, TaskPriority, GameState } from "@/types";
import { Clock, Code, ChevronDown, CheckCircle, Circle, AlertTriangle, Info, SkipForward, Sparkles, Loader2 } from "lucide-react";
import { Separator } from "../ui/separator";
import { Card } from "../ui/card";
import { suggestOptimizedTaskInputsAction } from "@/lib/actions";
import { useGameState } from "@/hooks/use-game-data";
import { useToast } from "@/hooks/use-toast";

interface InteractiveTaskCardProps {
  task: Task;
  allTasks: Task[];
  isActive: boolean;
  isCurrent: boolean;
  onToggle: () => void;
  onUpdate: (task: Task) => void;
  onFindNext: (taskId: string) => void;
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


export const InteractiveTaskCard = React.forwardRef<HTMLDivElement, InteractiveTaskCardProps>(
    ({ task, allTasks, isActive, isCurrent, onToggle, onUpdate, onFindNext }, ref) => {
    const { gameState } = useGameState();
    const { toast } = useToast();
    const [isAiLoading, setIsAiLoading] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);

    const isCompleted = task.completed;
    const dependencies = task.dependencyIDs?.map(depId => allTasks.find(t => t.id === depId)).filter(Boolean) as Task[] | undefined;
    const areDependenciesMet = !dependencies || dependencies.every(dep => dep.completed);

    const hasAiRationale = task.dataFields?.some(df => df.aiRationale);
    const currentRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;

    const statusBadge = React.useMemo(() => {
        if (isCompleted) {
            return {
                label: "Completed",
                className: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
                title: "Task has been completed."
            };
        }

        if (!areDependenciesMet) {
            return {
                label: "Blocked",
                className: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
                title: "Waiting on prerequisite tasks to be finished."
            };
        }

        if (isCurrent) {
            return {
                label: "Current",
                className: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100",
                title: "This is the next prioritized task."
            };
        }

        const timeframeLabels: Record<string, string> = {
            StartPhase: "Start Phase",
            MidPhase: "Mid Phase",
            EndPhase: "End Phase",
        };

        const waitingContext: string[] = [];

        if (task.timeframeConstraint && task.timeframeConstraint !== "None") {
            const timeframeText = timeframeLabels[task.timeframeConstraint];
            if (timeframeText) {
                waitingContext.push(timeframeText);
            }
        }

        if (task.roundRecurrence === "RoundStart") {
            waitingContext.push("Round Start");
        } else if (task.roundRecurrence === "Once" && task.startRound && task.startRound > currentRound) {
            waitingContext.push(`Round ${task.startRound}`);
        }

        const contextLabel = waitingContext.length > 0 ? `Waiting • ${waitingContext.join(" • ")}` : "Waiting";
        const title = waitingContext.length > 0
            ? `Scheduled for ${waitingContext.join(", ")}.`
            : "Ready once time allows.";

        return {
            label: contextLabel,
            className: "bg-muted text-muted-foreground border-transparent",
            title,
        };
    }, [areDependenciesMet, currentRound, isCompleted, isCurrent, task.roundRecurrence, task.startRound, task.timeframeConstraint]);

    const form = useForm({
        resolver: task.dataFields ? zodResolver(generateFormSchema(task.dataFields)) : undefined,
        defaultValues: task.dataFields?.reduce((acc, field) => {
            acc[field.fieldName] = field.value ?? field.suggestedValue ?? '';
            return acc;
        }, {} as Record<string, any>)
    });

    const { isDirty } = form.formState;

    const hasDataFields = Boolean(task.dataFields && task.dataFields.length > 0);

    const buildUpdatedDataFields = React.useCallback(async () => {
        if (!hasDataFields || !task.dataFields) {
            return { ok: true as const, dataFields: undefined };
        }

        let submittedValues: Record<string, any> | null = null;

        await form.handleSubmit(
            values => {
                submittedValues = values;
            },
            () => {
                submittedValues = null;
            }
        )();

        if (!submittedValues) {
            return { ok: false as const };
        }

        const updatedDataFields = task.dataFields.map(field => ({
            ...field,
            value: submittedValues?.[field.fieldName] ?? null,
        }));

        form.reset(submittedValues);

        return { ok: true as const, dataFields: updatedDataFields };
    }, [form, hasDataFields, task.dataFields]);

    React.useEffect(() => {
        if (isActive && task.dataFields && task.dataFields.length > 0 && !hasAiRationale && !isAiLoading) {
            const getAiSuggestions = async () => {
                setIsAiLoading(true);
                const result = await suggestOptimizedTaskInputsAction({ task, gameState });
                setIsAiLoading(false);

                if (result.success && result.data) {
                    const updatedTaskWithAISuggestions = result.data.updatedTask;
                    onUpdate(updatedTaskWithAISuggestions);
                    toast({
                        title: "AI Suggestions Loaded",
                        description: "Input fields have been pre-filled with AI suggestions.",
                    });
                } else {
                    toast({
                        variant: "destructive",
                        title: "AI Suggestion Failed",
                        description: result.error,
                    });
                }
            };
            getAiSuggestions();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isActive, task.id]);


    React.useEffect(() => {
        if (task.dataFields) {
            const defaultValues = task.dataFields.reduce((acc, field) => {
                acc[field.fieldName] = field.value ?? field.suggestedValue ?? '';
                return acc;
            }, {} as Record<string, any>);
            form.reset(defaultValues);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [task, form.reset]);

    const handleSaveDataFields = React.useCallback(async () => {
        if (!hasDataFields) {
            return;
        }

        setIsSaving(true);
        const result = await buildUpdatedDataFields();
        setIsSaving(false);

        if (!result.ok || !result.dataFields) {
            toast({
                variant: "destructive",
                title: "Unable to save changes",
                description: "Please resolve any validation issues before saving.",
            });
            return;
        }

        onUpdate({ ...task, dataFields: result.dataFields });
        toast({
            title: "Baseline inputs updated",
            description: "Your adjusted values have been saved for this task.",
        });
    }, [buildUpdatedDataFields, hasDataFields, onUpdate, task, toast]);

    const handleMarkComplete = async (completed: boolean) => {
        if (completed && hasDataFields) {
            const result = await buildUpdatedDataFields();

            if (!result.ok || !result.dataFields) {
                toast({
                    variant: "destructive",
                    title: "Cannot mark complete",
                    description: "Fix validation errors before marking this task as complete.",
                });
                return;
            }

            onUpdate({ ...task, completed, dataFields: result.dataFields });
            return;
        }

        if (!completed && hasDataFields && task.dataFields) {
            const values = form.getValues();
            const updatedDataFields = task.dataFields.map(field => ({
                ...field,
                value: values[field.fieldName] ?? null,
            }));

            onUpdate({ ...task, completed, dataFields: updatedDataFields });
            return;
        }

        onUpdate({ ...task, completed });
    };

  return (
    <div ref={ref} className="relative">
      {isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
            Current Task
          </div>
        </div>
      )}
      <Card
        className={cn(
          "transition-all",
          isCompleted ? "bg-card/50" : "bg-card",
          isActive && "ring-2 ring-primary"
        )}
      >
        <Collapsible open={isActive} onOpenChange={onToggle}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center gap-4 p-4 cursor-pointer">
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMarkComplete(!task.completed);
                }}
              >
                {completionIcon(task)}
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    "font-semibold",
                    isCompleted && "line-through text-muted-foreground"
                  )}
                >
                  {task.title}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                  <div
                    className="flex items-center gap-1.5"
                    title="Transaction Code"
                  >
                    <Code className="h-3.5 w-3.5" />
                    <code>{task.transactionCode}</code>
                  </div>
                  <div
                    className="flex items-center gap-1.5"
                    title="Estimated Time"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>{task.estimatedTime} min</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2">
                {statusBadge && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "whitespace-nowrap",
                      statusBadge.className
                    )}
                    title={statusBadge.title}
                  >
                    {statusBadge.label}
                  </Badge>
                )}
                <Badge
                  variant={priorityVariant[task.priority]}
                  className="whitespace-nowrap"
                >
                  {task.priority}
                </Badge>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-transform",
                    isActive && "rotate-180"
                  )}
                />
              </div>
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
                      <h4 className="font-semibold text-amber-100">
                        Dependencies Not Met
                      </h4>
                      <p>
                        This task is blocked until the following tasks are
                        completed:
                      </p>
                      <ul className="mt-2 list-disc pl-5">
                        {dependencies
                          .filter((d) => !d.completed)
                          .map((dep) => (
                            <li key={dep.id}>{dep.title}</li>
                          ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {isAiLoading && (
                 <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading AI suggestions...</span>
                 </div>
              )}
              
              {task.dataFields && !isAiLoading && (
                <Form {...form}>
                  <form className="space-y-4">
                    {task.dataFields.map((field) => (
                      <Card
                        key={field.fieldName}
                        className="bg-secondary/50 p-4"
                      >
                        <FormField
                          control={form.control}
                          name={field.fieldName}
                          render={({ field: formField }) => (
                            <FormItem>
                              <FormLabel>
                                {field.fieldName.replace(/_/g, " ")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type={
                                    field.dataType === "Currency" ||
                                    field.dataType === "Integer"
                                      ? "number"
                                      : "text"
                                  }
                                  {...formField}
                                  className="bg-background"
                                  step={
                                    field.dataType === "Currency"
                                      ? "0.01"
                                      : "1"
                                  }
                                />
                              </FormControl>
                              {field.suggestedValue !== undefined && field.suggestedValue !== null && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Baseline suggestion: <span className="font-medium">{String(field.suggestedValue)}</span>
                                </p>
                              )}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {field.aiRationale && (
                          <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
                            <Info className="h-4 w-4 shrink-0 mt-0.5" />
                            <p>
                              <span className="font-semibold">
                                AI Rationale:
                              </span>{" "}
                              {field.aiRationale}
                            </p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </form>
                </Form>
              )}

              <div className="flex justify-end items-center gap-2">
                 <div className="flex justify-end gap-2">
                    {hasDataFields && (
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleSaveDataFields}
                            disabled={isSaving || !isDirty}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    )}
                    {isCompleted ? (
                    <Button
                        variant="outline"
                        onClick={() => onFindNext(task.id)}
                    >
                        <SkipForward className="mr-2 h-4 w-4" />
                        Next Task
                    </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            onClick={() => onFindNext(task.id)}
                        >
                            Skip to Next
                        </Button>
                    )}
                    <Button
                    onClick={() => handleMarkComplete(!isCompleted)}
                    disabled={!areDependenciesMet}
                    >
                    {isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
                    </Button>
                 </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
});

InteractiveTaskCard.displayName = 'InteractiveTaskCard';

    