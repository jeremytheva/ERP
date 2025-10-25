
"use client";

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
import { ScrollArea } from "../ui/scroll-area";
import type { KpiHistoryEntry } from "@/types";

const formSchema = z.object({
  cashBalance: z.coerce.number(),
  netIncome: z.coerce.number(),
  grossRevenue: z.coerce.number(),
  cogs: z.coerce.number(),
  warehouseCosts: z.coerce.number(),
  marketShare: z.coerce.number().min(0).max(1),
  averageSellingPrice: z.coerce.number(),
  competitorAvgPrice: z.coerce.number(),
  cumulativeCO2eEmissions: z.coerce.number(),
  sustainabilityInvestment: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

interface NewRoundDataDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Omit<KpiHistoryEntry, 'round'>) => void;
  latestRound: number;
}

export function NewRoundDataDialog({ isOpen, onOpenChange, onSave, latestRound }: NewRoundDataDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cashBalance: 0,
      netIncome: 0,
      grossRevenue: 0,
      cogs: 0,
      warehouseCosts: 0,
      marketShare: 0,
      averageSellingPrice: 0,
      competitorAvgPrice: 0,
      cumulativeCO2eEmissions: 0,
      sustainabilityInvestment: 0,
    },
  });

  const onSubmit = (values: FormValues) => {
    // We need to provide all fields for a KpiHistoryEntry, so we add placeholders for those not in the form
    const fullData: Omit<KpiHistoryEntry, 'round'> = {
      ...values,
      companyValuation: 0, // Not in form, placeholder
      inventoryValue: 0, // Not in form, placeholder
      grossMargin: 0, // Not in form, placeholder
      inventoryTurnover: 0, // Not in form, placeholder
      capacityUtilization: 0, // Not in form, placeholder
      averagePriceGap: 0, // Not in form, placeholder
      onTimeDeliveryRate: 0, // Not in form, placeholder
    };
    onSave(fullData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Data for Round {latestRound + 1}</DialogTitle>
          <DialogDescription>
            Enter the data from SAP reports. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4 py-4">
                <FormField control={form.control} name="cashBalance" render={({ field }) => (
                    <FormItem><FormLabel>Cash Balance (€)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="netIncome" render={({ field }) => (
                    <FormItem><FormLabel>Net Income / Profit (€)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="grossRevenue" render={({ field }) => (
                    <FormItem><FormLabel>Gross Revenue (€)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="cogs" render={({ field }) => (
                    <FormItem><FormLabel>Cost of Goods Sold (COGS) (€)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="warehouseCosts" render={({ field }) => (
                    <FormItem><FormLabel>Warehouse Costs (€)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="marketShare" render={({ field }) => (
                    <FormItem><FormLabel>Market Share (%)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 0.25 for 25%" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="averageSellingPrice" render={({ field }) => (
                    <FormItem><FormLabel>Average Selling Price (€)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="competitorAvgPrice" render={({ field }) => (
                    <FormItem><FormLabel>Competitor Avg. Price (€)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="cumulativeCO2eEmissions" render={({ field }) => (
                    <FormItem><FormLabel>Cumulative CO₂e Emissions (kg)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="sustainabilityInvestment" render={({ field }) => (
                    <FormItem><FormLabel>Sustainability Investment (€)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">Save Round Data</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
