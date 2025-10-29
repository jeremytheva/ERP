"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { KpiValues } from "./types";

interface DataEntryPanelProps {
  fields: string[];
  kpiValues: KpiValues;
  onUpdateValue: (field: string, value: number | undefined) => void;
  onClearAll: () => void;
}

export function DataEntryPanel({ fields, kpiValues, onUpdateValue, onClearAll }: DataEntryPanelProps) {
  return (
    <section className="flex h-full flex-col gap-4 rounded-xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur">
      <header className="flex flex-col gap-1">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Step 3</p>
        <h2 className="font-headline text-2xl">Update live KPIs</h2>
        <p className="text-sm text-muted-foreground">
          Enter the latest ERPsim values. Task goals recalculate instantly as you type.
        </p>
      </header>

      {fields.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          Select a role and round to see which metrics matter here.
        </div>
      ) : (
        <>
          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => {
              const value = Number.isFinite(kpiValues[field]) ? kpiValues[field] : undefined;
              return (
                <label key={field} className="flex flex-col gap-2 rounded-lg border border-border/40 bg-background/60 p-3 shadow-sm">
                  <span className="text-sm font-medium capitalize tracking-wide text-muted-foreground">{field.replace(/_/g, " ")}</span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={value ?? ""}
                    onChange={(event) => {
                      const raw = event.target.value;
                      if (raw === "") {
                        onUpdateValue(field, undefined);
                        return;
                      }
                      const numeric = Number(raw);
                      if (Number.isNaN(numeric)) {
                        return;
                      }
                      onUpdateValue(field, numeric);
                    }}
                    className="w-full"
                    placeholder="Enter value"
                  />
                </label>
              );
            })}
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="ghost" onClick={onClearAll} className="text-sm">
              Clear KPI inputs
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
