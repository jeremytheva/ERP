"use client";

import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoundControlProps {
  currentRound: number;
  maxRound: number;
  onRoundChange: (round: number) => void;
}

export function RoundControl({ currentRound, maxRound, onRoundChange }: RoundControlProps) {
  const handleNext = () => {
    if (currentRound < maxRound) {
      onRoundChange(currentRound + 1);
    }
  };

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur">
      <header className="flex flex-col gap-1">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Step 2</p>
        <h2 className="font-headline text-2xl">Align on the current round</h2>
        <p className="text-sm text-muted-foreground">
          The task list automatically re-filters as you advance through the eight ERPsim rounds.
        </p>
      </header>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">Round</span>
          <select
            value={currentRound}
            onChange={(event) => onRoundChange(Number(event.target.value))}
            className="rounded-md border border-border bg-background px-3 py-2 text-base shadow-sm focus:border-primary focus:outline-none"
          >
            {Array.from({ length: maxRound }).map((_, index) => {
              const round = index + 1;
              return (
                <option key={round} value={round}>
                  Round {round}
                </option>
              );
            })}
          </select>
        </label>
        <Button
          type="button"
          variant="default"
          size="lg"
          onClick={handleNext}
          disabled={currentRound >= maxRound}
        >
          Next Round
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
