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
  FormDescription
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { useGameState } from "@/hooks/use-game-data";
import { simulateScenarioAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import type { SimulateScenarioOutput } from "@/ai/flows/simulate-scenario-outcomes";
import { Loader2, Wand2 } from "lucide-react";
import { KpiCard } from "../dashboard/kpi-card";
import { Target, DollarSign, PiggyBank, Factory } from "lucide-react";
import { Separator } from "../ui/separator";

const formSchema = z.object({
  marketingSpend: z.number().min(10000).max(1000000),
  productionVolume: z.number().min(1000).max(200000),
});

export function ScenarioForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SimulateScenarioOutput | null>(null);
  const { gameState } = useGameState();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marketingSpend: 100000,
      productionVolume: 50000,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>>) => {
    setIsLoading(true);
    setResults(null);
    const result = await simulateScenarioAction({
      ...values,
      currentGameState: JSON.stringify(gameState),
    });
    setIsLoading(false);

    if (result.success && result.data) {
      setResults(result.data);
    } else {
      toast({
        variant: "destructive",
        title: "Simulation Failed",
        description: result.error,
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

      {results && (
        <>
            <Separator />
            <div className="space-y-4">
                <h3 className="text-xl font-semibold font-headline">Predicted Outcomes</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <KpiCard title="Company Valuation" value={results.predictedCompanyValuation} icon={Target} format="currency" />
                    <KpiCard title="Net Income" value={results.predictedNetIncome} icon={DollarSign} format="currency" />
                    <KpiCard title="Inventory Value" value={results.predictedInventoryValue} icon={PiggyBank} format="currency" />
                    <KpiCard title="Total Emissions" value={results.predictedTotalEmissions} icon={Factory} format="number" unit="t CO₂e" />
                </div>
            </div>
        </>
      )}
    </div>
  );
}
