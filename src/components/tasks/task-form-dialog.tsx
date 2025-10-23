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
  role: z.enum(["Procurement", "Production", "Logistics", "Sales", "Team Leader"]),
  transactionCode: z.string().min(1, "Transaction code is required"),
  priority: z.enum(["Critical", "High", "Medium", "Low"]),
  estimatedTime: z.coerce.number().min(0),
  roundRecurrence: z.enum(["Once", "RoundStart", "Continuous"]),
  startRound: z.coerce.number().min(1).optional(),
  dependencyIDs: z.preprocess(
    (val) => (typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
    z.array(z.string())
  ),
  completionType: z.enum(["Manual-Tick", "Data-Confirmed", "System-Validated"]),
  taskType: z.enum(["ERPsim Input Data", "ERPsim Gather Data", "Standard"]),
  completed: z.boolean(),
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
      role: "Sales",
      transactionCode: "",
      priority: "Medium",
      estimatedTime: 5,
      roundRecurrence: "RoundStart",
      startRound: 1,
      dependencyIDs: [],
      completionType: "Manual-Tick",
      taskType: "Standard",
      completed: false,
    },
  });

  useEffect(() => {
    if (task) {
      form.reset({
        ...task,
        dependencyIDs: task.dependencyIDs || [],
      });
    } else {
      form.reset({
        id: `T${new Date().getTime()}`,
        title: "",
        description: "",
        role: "Sales",
        transactionCode: "",
        priority: "Medium",
        estimatedTime: 5,
        roundRecurrence: "RoundStart",
        startRound: 1,
        dependencyIDs: [],
        completionType: "Manual-Tick",
        taskType: "Standard",
        completed: false,
      });
    }
  }, [task, form, isOpen]);

  const onSubmit = (values: TaskFormValues) => {
    // This is a bit of a hack to merge back dataFields if they exist
    const finalTask: Task = {
        ...(task || {}),
        ...values,
        dataFields: task?.dataFields || undefined
    };
    onSave(finalTask);
    onOpenChange(false);
  };
  
  // Create a string from the array for the input field
  const dependencyIDsString = Array.isArray(form.getValues("dependencyIDs")) ? form.getValues("dependencyIDs").join(', ') : '';


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
                                        <SelectItem value="Sales">Sales</SelectItem>
                                        <SelectItem value="Procurement">Procurement</SelectItem>
                                        <SelectItem value="Production">Production</SelectItem>
                                        <SelectItem value="Logistics">Logistics</SelectItem>
                                        <SelectItem value="Team Leader">Team Leader</SelectItem>
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
                            name="priority"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Priority</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Critical">Critical</SelectItem>
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
                                        <SelectItem value="Once">Once</SelectItem>
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
                                <Input placeholder="e.g. T1, T5" {...field} value={dependencyIDsString} onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()))} />
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
                                        <SelectItem value="System-Validated">System Validated</SelectItem>
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
