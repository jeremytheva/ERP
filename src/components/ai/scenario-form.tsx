"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Slider } from "@/components/ui/slider";
import { useGameState } from "@/hooks/use-game-data";
import { runSalesScenarioAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import type { SimulateScenarioOutput } from "@/ai/flows/simulate-scenario-outcomes";
import { Loader2, Wand2 } from "lucide-react";
import { KpiCard } from "../dashboard/kpi-card";
import { Target, DollarSign, PiggyBank, Factory } from "lucide-react";
import { Separator } from "../ui/separator";
import { useCompetitorLog } from "@/hooks/use-competitor-log";
import {
  StrategyRecordSchema,
  type StrategyRecord,
} from "@/lib/logic/strategic-schemas";
import {
  useFirestore,
  errorEmitter,
  FirestorePermissionError,
} from "@/firebase";
import { collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import Markdown from "react-markdown";

const formSchema = z.object({
  marketingSpend: z.number().min(10000).max(1000000),
  productionVolume: z.number().min(1000).max(200000),
});

export function ScenarioForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SimulateScenarioOutput | null>(null);
  const [recommendations, setRecommendations] = useState<string>("");
  const { gameState } = useGameState();
  const { toast } = useToast();
  const { logEntries } = useCompetitorLog();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marketingSpend: 100000,
      productionVolume: 50000,
    },
  });

  const persistStrategyRecord = async (record: StrategyRecord) => {
    if (!firestore) return;

    const strategiesCol = collection(firestore, "strategies");
    const strategyDocRef = doc(strategiesCol);
    const batch = writeBatch(firestore);
    batch.set(strategyDocRef, {
      ...record,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    try {
      await batch.commit();
    } catch (error) {
      errorEmitter.emit(
        "permission-error",
        new FirestorePermissionError({
          path: strategyDocRef.path,
          operation: "create",
          requestResourceData: record,
        })
      );
      throw error;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setResults(null);
    setRecommendations("");

    const competitorLogPayload = logEntries.slice(0, 10).map((entry) => {
      const rawDate = entry.createdAt as unknown;
      let createdAt: string | null = null;
      if (rawDate instanceof Date) {
        createdAt = rawDate.toISOString();
      } else if (
        rawDate &&
        typeof rawDate === "object" &&
        "toDate" in rawDate &&
        typeof (rawDate as { toDate: () => Date }).toDate === "function"
      ) {
        createdAt = (rawDate as { toDate: () => Date }).toDate().toISOString();
      } else if (rawDate) {
        const parsed = new Date(String(rawDate));
        createdAt = Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
      }

      return {
        id: entry.id,
        text: entry.text,
        author: entry.author,
        createdAt,
      };
    });

    const response = await runSalesScenarioAction({
      marketingSpend: values.marketingSpend,
      productionVolume: values.productionVolume,
      gameState,
      competitorLog: competitorLogPayload,
    });

    setIsLoading(false);

    if (!response.success || !response.data) {
      toast({
        variant: "destructive",
        title: "Simulation Failed",
        description: response.error,
      });
      return;
    }

    const parsedRecord = StrategyRecordSchema.parse(response.data);
    setResults(parsedRecord.predictions);
    setRecommendations(parsedRecord.recommendations);

    try {
      await persistStrategyRecord(parsedRecord);
      toast({
        title: "Scenario saved",
        description: "AI insights have been stored for the team.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Failed to save scenario",
        description: "The AI insights could not be stored in Firestore.",
      });
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                  Current Spend: {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(field.value)}
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
                  Current Volume: {new Intl.NumberFormat("en-US").format(
                    field.value
                  )} units
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
            Simulate Outcomes
          </Button>
        </form>
      </Form>

      {(results || recommendations) && (
        <>
          <Separator />
          {results && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold font-headline">
                Predicted Outcomes
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                  title="Company Valuation"
                  value={results.predictedCompanyValuation}
                  icon={Target}
                  format="currency"
                />
                <KpiCard
                  title="Net Income"
                  value={results.predictedNetIncome}
                  icon={DollarSign}
                  format="currency"
                />
                <KpiCard
                  title="Inventory Value"
                  value={results.predictedInventoryValue}
                  icon={PiggyBank}
                  format="currency"
                />
                <KpiCard
                  title="Total Emissions"
                  value={results.predictedTotalEmissions}
                  icon={Factory}
                  format="number"
                  unit="t CO₂e"
                />
              </div>
            </div>
          )}
          {recommendations && (
            <div className="space-y-3">
              <h3 className="text-xl font-semibold font-headline">
                AI Advisor Recommendations
              </h3>
              <article className="prose prose-sm dark:prose-invert max-w-none bg-secondary/30 rounded-lg p-4">
                <Markdown>{recommendations}</Markdown>
              </article>
            </div>
          )}
        </>
      )}
    </div>
  );
}

