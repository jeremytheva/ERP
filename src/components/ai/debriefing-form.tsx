
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { generateRoundDebriefingAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "../ui/separator";
import Markdown from 'react-markdown';
import { useTasks } from "@/hooks/use-tasks";
import type { Task } from "@/types";

const formSchema = z.object({
  performanceData: z.string().min(10, { message: "Please provide some performance data." }),
  competitorAnalysis: z.string().min(10, { message: "Please provide some competitor analysis." }),
  actionItems: z.string().min(10, { message: "Please list some action items." }),
});

export function DebriefingForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string>("");
  const { toast } = useToast();
  // This is a placeholder, a real implementation would need a more robust way to create tasks
  const { addTask } = useTasks();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      performanceData: "",
      competitorAnalysis: "",
      actionItems: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setReport("");
    const result = await generateRoundDebriefingAction(values);
    setIsLoading(false);

    if (result.success && result.data) {
      setReport(result.data.summaryReport);
    } else {
      toast({
        variant: "destructive",
        title: "Debriefing Failed",
        description: result.error,
      });
    }
  };

  const handleAddActionItem = (itemText: string) => {
    // This is a simplified placeholder action
    const newTask: Task = {
        id: `T${new Date().getTime()}`,
        title: itemText,
        description: "Generated from debriefing report.",
        role: "Team Leader",
        transactionCode: "N/A",
        priority: "Medium",
        estimatedTime: 5,
        roundRecurrence: "Once",
        dependencyIDs: [],
        completionType: "Manual-Tick",
        taskType: "Standard",
        completed: false,
      };
      addTask(newTask);

    toast({
        title: "Action Item Added",
        description: `Task "${itemText}" has been added.`,
      });
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="performanceData"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Performance Data</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Sales increased by 15%, market share grew to 22%..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="competitorAnalysis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Competitor Analysis</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Team Alpha dropped prices, Team Bravo launched a new product..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="actionItems"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Key Action Items from this Round</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Need to adjust pricing, investigate new markets..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Generate Debriefing
          </Button>
        </form>
      </Form>

      {report && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Summary Report</CardTitle>
            </CardHeader>
            <CardContent>
                <article className="prose prose-sm dark:prose-invert max-w-none">
                    <Markdown 
                      components={{
                        li: ({node, ...props}) => {
                          const firstChild = node?.children?.[0];
                          const text =
                            firstChild &&
                            firstChild.type === 'text' &&
                            typeof firstChild.value === 'string'
                              ? firstChild.value
                              : '';
                          return (
                            <li {...props} className="group relative">
                              {props.children}
                              <Button variant="ghost" size="icon" className="absolute -right-8 top-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleAddActionItem(text)}>
                                <PlusCircle className="h-4 w-4 text-accent" />
                              </Button>
                            </li>
                          );
                        }
                      }}
                    >
                      {report}
                    </Markdown>
                </article>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
