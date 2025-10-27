
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useGameState } from "@/hooks/use-game-data";
import { getStrategicRecommendationsAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Markdown from 'react-markdown';
import { useCompetitorLog } from "@/hooks/use-competitor-log";

export function StrategicAdvisor() {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string>("");
  const { gameState } = useGameState();
  const { logEntries } = useCompetitorLog();
  const { toast } = useToast();

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setRecommendations("");
    const result = await getStrategicRecommendationsAction({
      gameState: JSON.stringify(gameState),
      teamStrategy: gameState.teamStrategy,
      companyValuation: gameState.companyValuation,
      netIncome: gameState.netIncome,
      inventoryValue: gameState.inventoryValue,
      totalEmissions: gameState.cumulativeCO2eEmissions,
      competitorAnalysisLog: JSON.stringify(logEntries.slice(0, 5)),
    });
    setIsLoading(false);

    if (result.success && result.data) {
      setRecommendations(result.data.recommendations);
    } else {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: result.error,
      });
    }
  };

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={fetchRecommendations} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Regenerate Recommendations
        </Button>
      </div>

      {isLoading && !recommendations && (
         <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
         </div>
      )}

      {recommendations && (
        <Card className="bg-secondary/50">
          <CardContent className="p-6">
            <article className="prose prose-sm dark:prose-invert max-w-none">
              <Markdown>{recommendations}</Markdown>
            </article>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
