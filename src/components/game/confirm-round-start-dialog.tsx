
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useGameState } from "@/hooks/use-game-data";
import { Coffee, Rocket } from "lucide-react";

export function ConfirmRoundStartDialog() {
  const { isAwaitingConfirmation, confirmAndAdvance, isBreakActive, gameState } = useGameState();
  const nextRoundNumber = (gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 0) + 1;
  const nextAction = isBreakActive ? "Start Round" : "Start Break";
  const title = isBreakActive ? `Start Next Round?` : "Start Break?";
  const description = isBreakActive 
    ? `You are about to start Round ${nextRoundNumber}. Are you ready to proceed?`
    : "The round has ended. It's time for a short break before the next round begins.";

  return (
    <AlertDialog open={isAwaitingConfirmation}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isBreakActive ? <Rocket className="h-5 w-5"/> : <Coffee className="h-5 w-5"/>}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={confirmAndAdvance}>
            {nextAction}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
