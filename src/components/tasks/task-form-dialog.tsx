"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Task } from "@/types";
import { ScrollArea } from "../ui/scroll-area";

const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description is required"),
  role: z.enum(["Team Leader", "Sales", "Production", "Procurement", "Logistics"]),
  transactionCode: z.string().optional(),
  priority: z.enum(["High", "Medium", "Low"]),
  estimatedTime: z.coerce.number().min(0),
  roundRecurrence: z.enum(["RoundStart", "Continuous"]),
  round: z.coerce.number().min(1),
  startRound: z.coerce.number().min(1),
  dependencyIDs: z.preprocess(
    (val) => (typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : Array.isArray(val) ? val : []),
    z.array(z.string())
  ),
  completionType: z.enum(["Manual-Tick", "Data-Confirmed", "Ongoing"]),
  taskType: z.enum(["ERPsim Input Data", "ERPsim Gather Data", "Standard"]),
  completed: z.boolean(),
  version: z.coerce.number().min(1).default(2),
  impact: z.enum(["Revenue", "Cost", "Sustainability", "Capacity", "Risk"]).optional(),
  visibility: z.enum(["Always", "OnAlert"]).optional(),
  alertKey: z.enum(["mrpIssues", "cashLow", "dcStockout", "rmShortage", "co2OverTarget", "backlog"]).optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: Task) => void;
  task: Task | null;
}

export function TaskFormDialog({ isOpen, onOpenChange, onSave, task }: TaskFormDialogProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      id: "",
      title: "",
      description: "",
      role: "Team Leader",
      transactionCode: "",
      priority: "Medium",
      estimatedTime: 5,
      roundRecurrence: "RoundStart",
      round: 1,
      startRound: 1,
      dependencyIDs: [],
      completionType: "Manual-Tick",
      taskType: "Standard",
      completed: false,
      version: 2,
      visibility: "Always",
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        ...task,
        version: task.version ?? 2,
        round: task.round ?? task.startRound ?? 1,
        transactionCode: task.transactionCode || "",
        dependencyIDs: task.dependencyIDs || [],
        visibility: task.visibility ?? "Always",
        alertKey: task.visibility === "OnAlert" ? task.alertKey : undefined,
      });
    } else {
      form.reset({
        id: `T${new Date().getTime()}`,
        title: "",
        description: "",
        role: "Team Leader",
        transactionCode: "",
        priority: "Medium",
        estimatedTime: 5,
        roundRecurrence: "RoundStart",
        round: 1,
        startRound: 1,
        dependencyIDs: [],
        completionType: "Manual-Tick",
        taskType: "Standard",
        completed: false,
        version: 2,
        visibility: "Always",
        impact: undefined,
        alertKey: undefined,
      });
    }
  }, [task, form, isOpen]);

  const onSubmit = (values: TaskFormValues) => {
    const visibility = values.visibility ?? "Always";
    const finalTask: Task = {
        ...(task || {}),
        ...values,
        version: values.version ?? task?.version ?? 2,
        transactionCode: values.transactionCode ? values.transactionCode : undefined,
        visibility,
        alertKey: visibility === "OnAlert" ? values.alertKey : undefined,
        dependencyIDs: Array.isArray(values.dependencyIDs) ? values.dependencyIDs : [],
        dataFields: task?.dataFields || undefined
    };
    onSave(finalTask);
    onOpenChange(false);
  };

  const watchedVisibility = form.watch("visibility");
  const dependencyIDsValue = form.watch("dependencyIDs");
  const dependencyIDsString = Array.isArray(dependencyIDsValue) ? dependencyIDsValue.join(', ') : '';


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            Fill in the details for the task below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="h-[60vh] pr-6">
                <div className="space-y-4">
                    <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                <SelectItem value="Team Leader">Team Leader</SelectItem>
                                <SelectItem value="Sales">Sales</SelectItem>
                                <SelectItem value="Production">Production</SelectItem>
                                <SelectItem value="Procurement">Procurement</SelectItem>
                                <SelectItem value="Logistics">Logistics</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="transactionCode"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Transaction Code</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="impact"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Impact</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select impact" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Revenue">Revenue</SelectItem>
                                        <SelectItem value="Cost">Cost</SelectItem>
                                        <SelectItem value="Sustainability">Sustainability</SelectItem>
                                        <SelectItem value="Capacity">Capacity</SelectItem>
                                        <SelectItem value="Risk">Risk</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="visibility"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Visibility</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value ?? "Always"}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Always">Always</SelectItem>
                                        <SelectItem value="OnAlert">On Alert</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {watchedVisibility === "OnAlert" && (
                            <FormField
                                control={form.control}
                                name="alertKey"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Alert Key</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select alert" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="cashLow">Cash Low</SelectItem>
                                            <SelectItem value="rmShortage">RM Shortage</SelectItem>
                                            <SelectItem value="mrpIssues">MRP Issues</SelectItem>
                                            <SelectItem value="dcStockout">DC Stockout</SelectItem>
                                            <SelectItem value="co2OverTarget">CO₂ Over Target</SelectItem>
                                            <SelectItem value="backlog">Backlog</SelectItem>
                                        </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="priority"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Priority</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="High">High</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Low">Low</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="estimatedTime"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Estimated Time (min)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="roundRecurrence"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Recurrence</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="RoundStart">Round Start</SelectItem>
                                        <SelectItem value="Continuous">Continuous</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="round"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Round</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="startRound"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Start Round</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="dependencyIDs"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Dependency IDs</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. T1.2, T5.2" {...field} value={dependencyIDsString} onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="completionType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Completion Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Manual-Tick">Manual Tick</SelectItem>
                                        <SelectItem value="Data-Confirmed">Data Confirmed</SelectItem>
                                        <SelectItem value="Ongoing">Ongoing</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="taskType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Task Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Standard">Standard</SelectItem>
                                        <SelectItem value="ERPsim Input Data">ERPsim Input Data</SelectItem>
                                        <SelectItem value="ERPsim Gather Data">ERPsim Gather Data</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </ScrollArea>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
