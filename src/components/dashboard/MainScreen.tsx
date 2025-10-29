"use client";

import { useEffect, useMemo, useState } from "react";
import { RoleSelector } from "@/components/RoleSelector";
import { TaskList } from "@/components/TaskList";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useGameState } from "@/hooks/use-game-data";
import { useTeamSettings } from "@/hooks/use-team-settings";
import { useToast } from "@/hooks/use-toast";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const ROLE_STORAGE_KEY = "dashboard.selectedRoles";
const ALL_ROLES: Role[] = ["Team Leader", "Sales", "Production", "Procurement", "Logistics"];

const formatTimer = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
};

export function MainScreen() {
  const { profile } = useAuth();
  const { teamLeader } = useTeamSettings();
  const {
    gameState,
    timeLeft,
    isPaused,
    isBreakActive,
    confirmAndAdvance,
    togglePause,
    resetTimer,
    setRound,
    addKpiHistoryEntry,
  } = useGameState();
  const { toast } = useToast();

  const isTeamLeader = profile?.id === teamLeader;
  const latestRound = gameState.kpiHistory[gameState.kpiHistory.length - 1]?.round || 1;

  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [roundInput, setRoundInput] = useState<string>(latestRound.toString());
  const [isJumpingRound, setIsJumpingRound] = useState(false);
  const [isSubmittingKpi, setIsSubmittingKpi] = useState(false);
  const [kpiDraft, setKpiDraft] = useState({
    netIncome: "",
    cashBalance: "",
    inventoryValue: "",
    grossMargin: "",
  });

  useEffect(() => {
    const storedRoles = typeof window !== "undefined" ? localStorage.getItem(ROLE_STORAGE_KEY) : null;
    if (storedRoles) {
      try {
        const parsed = JSON.parse(storedRoles) as Role[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedRoles(parsed.filter(role => ALL_ROLES.includes(role)));
          return;
        }
      } catch (error) {
        console.warn("Unable to parse stored roles", error);
      }
    }

    if (profile?.name && ALL_ROLES.includes(profile.name as Role)) {
      const baseRoles: Role[] = [profile.name as Role];
      if (isTeamLeader && !baseRoles.includes("Team Leader")) {
        baseRoles.push("Team Leader");
      }
      setSelectedRoles(baseRoles);
    } else {
      setSelectedRoles(["Team Leader"]);
    }
  }, [profile?.name, isTeamLeader]);

  useEffect(() => {
    setRoundInput(latestRound.toString());
    setKpiDraft({
      netIncome: gameState.netIncome.toString(),
      cashBalance: gameState.cashBalance.toString(),
      inventoryValue: gameState.inventoryValue.toString(),
      grossMargin: (gameState.grossMargin * 100).toFixed(1),
    });
  }, [latestRound, gameState.netIncome, gameState.cashBalance, gameState.inventoryValue, gameState.grossMargin]);

  const handleRoleSave = (roles: Role[]) => {
    setSelectedRoles(roles);
    if (typeof window !== "undefined") {
      localStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(roles));
    }
    toast({
      title: "Role filters updated",
      description: `Showing ${roles.length} ${roles.length === 1 ? "role" : "roles"} on the board.`,
    });
  };

  const handleRoundSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isTeamLeader) return;
    const nextRound = Number.parseInt(roundInput, 10);
    if (Number.isNaN(nextRound) || nextRound < 1) {
      toast({
        variant: "destructive",
        title: "Invalid round",
        description: "Enter a round number of 1 or higher.",
      });
      return;
    }

    setIsJumpingRound(true);
    try {
      await setRound(nextRound);
      toast({
        title: `Moved to round ${nextRound}`,
        description: "Historical KPIs updated to reflect the selected round.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Unable to change round",
        description: "Check your permissions or try again shortly.",
      });
    } finally {
      setIsJumpingRound(false);
    }
  };

  const handleKpiInputChange = (key: keyof typeof kpiDraft, value: string) => {
    setKpiDraft(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmitKpis = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isTeamLeader) return;

    setIsSubmittingKpi(true);
    try {
      const parsedNetIncome = Number.parseFloat(kpiDraft.netIncome || `${gameState.netIncome}`);
      const parsedCash = Number.parseFloat(kpiDraft.cashBalance || `${gameState.cashBalance}`);
      const parsedInventory = Number.parseFloat(kpiDraft.inventoryValue || `${gameState.inventoryValue}`);
      const parsedGrossMargin = Number.parseFloat(kpiDraft.grossMargin || `${gameState.grossMargin * 100}`);

      const normalisedGrossMargin = Number.isNaN(parsedGrossMargin)
        ? gameState.grossMargin
        : parsedGrossMargin > 1
          ? parsedGrossMargin / 100
          : parsedGrossMargin;

      await addKpiHistoryEntry({
        companyValuation: gameState.companyValuation,
        netIncome: Number.isNaN(parsedNetIncome) ? gameState.netIncome : parsedNetIncome,
        inventoryValue: Number.isNaN(parsedInventory) ? gameState.inventoryValue : parsedInventory,
        cashBalance: Number.isNaN(parsedCash) ? gameState.cashBalance : parsedCash,
        grossMargin: normalisedGrossMargin,
        marketShare: gameState.marketShare,
        averageSellingPrice: gameState.averageSellingPrice,
        inventoryTurnover: gameState.inventoryTurnover,
        capacityUtilization: gameState.capacityUtilization,
        averagePriceGap: gameState.averagePriceGap,
        warehouseCosts: gameState.warehouseCosts,
        onTimeDeliveryRate: gameState.onTimeDeliveryRate,
        cumulativeCO2eEmissions: gameState.cumulativeCO2eEmissions,
        competitorAvgPrice: gameState.competitorAvgPrice,
        grossRevenue: gameState.grossRevenue,
        cogs: gameState.cogs,
        sustainabilityInvestment: gameState.sustainabilityInvestment,
      });

      toast({
        title: "KPI snapshot saved",
        description: "Round history updated with the submitted figures.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Unable to save KPI snapshot",
        description: "Please review the values and try again.",
      });
    } finally {
      setIsSubmittingKpi(false);
    }
  };

  const alerts = useMemo(() => {
    const items: { id: string; title: string; description: string; variant: "warning" | "positive" }[] = [];
    if (gameState.cashBalance < 200000) {
      items.push({
        id: "cash",
        title: "Cash alert",
        description: "Cash runway has dipped below €200k. Align on contingency actions.",
        variant: "warning",
      });
    }
    if (gameState.cumulativeCO2eEmissions > 150000) {
      items.push({
        id: "co2",
        title: "Sustainability risk",
        description: "Cumulative CO₂e is trending above plan. Consider boosting ZFB50 investment.",
        variant: "warning",
      });
    }
    if (gameState.netIncome > 0 && gameState.grossMargin >= 0.2) {
      items.push({
        id: "profit",
        title: "Strong profitability",
        description: "Net income and margin targets are on track this round.",
        variant: "positive",
      });
    }
    return items;
  }, [gameState.cashBalance, gameState.cumulativeCO2eEmissions, gameState.netIncome, gameState.grossMargin]);

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr] xl:grid-cols-[360px_1fr]">
      <div className="space-y-6">
        <RoleSelector
          defaultValue={selectedRoles}
          onSave={handleRoleSave}
          onChange={roles => setSelectedRoles(roles)}
        />

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Round controls</CardTitle>
                <CardDescription>Manage pacing and jump to a specific round.</CardDescription>
              </div>
              <Badge variant={isBreakActive ? "secondary" : "outline"} className="gap-1">
                <Activity className="h-3.5 w-3.5" />
                {isBreakActive ? "Break" : "In round"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Current round</p>
                <p className="text-2xl font-semibold">Round {latestRound}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase text-muted-foreground">Timer</p>
                <p className="text-2xl font-mono font-semibold">{formatTimer(timeLeft)}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" onClick={togglePause} disabled={!isTeamLeader} variant="secondary">
                {isPaused ? (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                )}
              </Button>
              <Button type="button" variant="ghost" onClick={resetTimer} disabled={!isTeamLeader}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button type="button" onClick={confirmAndAdvance} disabled={!isTeamLeader}>
                <ArrowRight className="mr-2 h-4 w-4" />
                {isBreakActive ? "Start round" : "Complete round"}
              </Button>
            </div>
            <Separator />
            <form className="space-y-3" onSubmit={handleRoundSubmit}>
              <Label htmlFor="round-input" className="text-sm font-medium">
                Jump to round
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="round-input"
                  type="number"
                  min={1}
                  value={roundInput}
                  onChange={event => setRoundInput(event.target.value)}
                  disabled={!isTeamLeader || isJumpingRound}
                />
                <Button type="submit" disabled={!isTeamLeader || isJumpingRound}>
                  Go
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Quick KPI capture</CardTitle>
                <CardDescription>Log a snapshot that becomes the baseline for the next round.</CardDescription>
              </div>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmitKpis}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="netIncome">Net income (€)</Label>
                  <Input
                    id="netIncome"
                    type="number"
                    value={kpiDraft.netIncome}
                    onChange={event => handleKpiInputChange("netIncome", event.target.value)}
                    disabled={!isTeamLeader || isSubmittingKpi}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cashBalance">Cash balance (€)</Label>
                  <Input
                    id="cashBalance"
                    type="number"
                    value={kpiDraft.cashBalance}
                    onChange={event => handleKpiInputChange("cashBalance", event.target.value)}
                    disabled={!isTeamLeader || isSubmittingKpi}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inventoryValue">Inventory value (€)</Label>
                  <Input
                    id="inventoryValue"
                    type="number"
                    value={kpiDraft.inventoryValue}
                    onChange={event => handleKpiInputChange("inventoryValue", event.target.value)}
                    disabled={!isTeamLeader || isSubmittingKpi}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grossMargin">Gross margin (%)</Label>
                  <Input
                    id="grossMargin"
                    type="number"
                    step="0.1"
                    value={kpiDraft.grossMargin}
                    onChange={event => handleKpiInputChange("grossMargin", event.target.value)}
                    disabled={!isTeamLeader || isSubmittingKpi}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={!isTeamLeader || isSubmittingKpi}>
                Save KPI snapshot
              </Button>
            </form>
          </CardContent>
        </Card>

        {alerts.length > 0 && (
          <div className="space-y-3">
            {alerts.map(alert => (
              <Alert
                key={alert.id}
                variant={alert.variant === "warning" ? "destructive" : "default"}
                className={cn(
                  alert.variant === "positive" &&
                    "border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200"
                )}
              >
                {alert.variant === "warning" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>{alert.description}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </div>

      <div>
        <TaskList selectedRoles={selectedRoles} />
      </div>
    </div>
  );
}
