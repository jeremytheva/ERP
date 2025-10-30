"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Markdown from "react-markdown";
import { Loader2, Wand2, Notebook, Target, DollarSign, PiggyBank, Factory } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useGameState } from "@/hooks/use-game-data";
import { useCompetitorLog } from "@/hooks/use-competitor-log";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_GAME_ID } from "@/lib/logic/constants";
import { runSalesScenarioAction } from "@/lib/logic/server-actions";
import type { SalesScenarioResult } from "@/lib/zod-schemas";
import { KpiCard } from "../dashboard/kpi-card";
import { Separator } from "../ui/separator";

const formSchema = z.object({
  name: z.string().min(3, "Provide a scenario name"),
  description: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
  marketingSpend: z.number().min(10000).max(1000000),
  productionVolume: z.number().min(1000).max(200000),
});

export function ScenarioForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SalesScenarioResult | null>(null);
  const { gameState } = useGameState();
  const { logEntries } = useCompetitorLog();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "Base Marketing Push",
      description: "Adjust marketing spend and production to capture incremental demand.",
      notes: "",
      marketingSpend: 100000,
      productionVolume: 50000,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setResults(null);

    try {
      const result = await runSalesScenarioAction({
        gameId: DEFAULT_GAME_ID,
        authorId: user?.uid ?? profile?.id ?? "anonymous",
        scenario: {
          name: values.name,
          description: values.description,
          marketingSpend: values.marketingSpend,
          productionVolume: values.productionVolume,
        },
        gameState,
        competitorLog: logEntries.slice(0, 8).map((entry) => ({
          id: entry.id,
          text: entry.text,
          author: entry.author,
          createdAt:
            entry.createdAt instanceof Date
              ? entry.createdAt.toISOString()
              : entry.createdAt ?? null,
        })),
        initialNotes: values.notes?.trim() ? values.notes.trim() : undefined,
      });

      setResults(result);
      document.dispatchEvent(
        new CustomEvent("sales-scenario:created", {
          detail: result.optimisticStrategy,
        })
      );
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Simulation Failed",
        description: "We were unable to run the scenario. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scenario Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Aggressive Advertising" {...field} />
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
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Input placeholder="Short description" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide a brief summary of the scenario assumptions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="marketingSpend"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marketing Spend</FormLabel>
                <FormControl>
                  <Slider
                    min={10000}
                    max={1000000}
                    step={10000}
                    onValueChange={(value) => field.onChange(value[0])}
                    value={[field.value]}
                  />
                </FormControl>
                <FormDescription>
                  Current Spend: {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(field.value)}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="productionVolume"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Production Volume</FormLabel>
                <FormControl>
                  <Slider
                    min={1000}
                    max={200000}
                    step={1000}
                    onValueChange={(value) => field.onChange(value[0])}
                    value={[field.value]}
                  />
                </FormControl>
                <FormDescription>
                  Current Volume: {new Intl.NumberFormat("en-US").format(field.value)} units
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Notebook className="h-4 w-4" /> Analyst Notes
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Capture any insights or context you want to keep with this scenario."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  These notes are saved with the scenario and can be refined later.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Run Sales Scenario
          </Button>
        </form>
      </Form>

      {results && (
        <>
          <Separator />
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold font-headline">Predicted Outcomes</h3>
              <p className="text-sm text-muted-foreground">
                Scenario "{results.scenario.name}" has been stored in the strategy backlog for your team.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KpiCard title="Company Valuation" value={results.predictions.predictedCompanyValuation} icon={Target} format="currency" />
              <KpiCard title="Net Income" value={results.predictions.predictedNetIncome} icon={DollarSign} format="currency" />
              <KpiCard title="Inventory Value" value={results.predictions.predictedInventoryValue} icon={PiggyBank} format="currency" />
              <KpiCard title="Total Emissions" value={results.predictions.predictedTotalEmissions} icon={Factory} format="number" unit="t CO₂e" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-semibold font-headline">Advisor Guidance</h4>
              <article className="prose prose-sm dark:prose-invert max-w-none">
                <Markdown>{results.recommendations}</Markdown>
              </article>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
