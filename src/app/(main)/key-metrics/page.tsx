
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { NewRoundDataDialog } from "@/components/key-metrics/new-round-data-dialog";
import { useGameState } from "@/hooks/use-game-data";
import type { KpiHistoryEntry } from "@/types";

export default function KeyMetricsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { gameState, addKpiHistoryEntry } = useGameState();

  const handleSaveRoundData = async (data: Omit<KpiHistoryEntry, 'round'>) => {
    await addKpiHistoryEntry(data);
    setIsDialogOpen(false);
  };

  const formatValue = (key: keyof KpiHistoryEntry, value: any) => {
    if (typeof value !== 'number') return value;

    const currencyFields = ['cashBalance', 'netIncome', 'grossRevenue', 'cogs', 'warehouseCosts', 'averageSellingPrice', 'competitorAvgPrice', 'sustainabilityInvestment'];
    const percentFields = ['marketShare'];

    if (currencyFields.includes(key as string)) {
       return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
    }
    if (percentFields.includes(key as string)) {
        return new Intl.NumberFormat('de-DE', { style: 'percent', minimumFractionDigits: 1 }).format(value);
    }
    return value.toLocaleString('de-DE');
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <BarChart2 className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">Key Metrics</CardTitle>
              <CardDescription>
                Central data repository for raw, per-round data extracted from SAP reports.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Round Data Input</CardTitle>
                        <CardDescription>
                            Manually enter the final numbers from SAP reports (F.01, ZMARKET, ZFF7B) here.
                        </CardDescription>
                    </div>
                    <Button onClick={() => setIsDialogOpen(true)}>Add New Round Data</Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Round</TableHead>
                                <TableHead>Cash Balance</TableHead>
                                <TableHead>Net Income</TableHead>
                                <TableHead>Market Share</TableHead>
                                <TableHead>Competitor Avg. Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {gameState.kpiHistory.length > 0 ? (
                                gameState.kpiHistory.slice().reverse().map((entry) => (
                                    <TableRow key={entry.round}>
                                        <TableCell className="font-semibold">{entry.round}</TableCell>
                                        <TableCell>{formatValue('cashBalance', entry.cashBalance)}</TableCell>
                                        <TableCell>{formatValue('netIncome', entry.netIncome)}</TableCell>
                                        <TableCell>{formatValue('marketShare', entry.marketShare)}</TableCell>
                                        <TableCell>{formatValue('competitorAvgPrice', entry.competitorAvgPrice)}</TableCell>
                                    </TableRow>
                                ))
                             ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No data entered yet. Click "Add New Round Data" to begin.
                                    </TableCell>
                                </TableRow>
                             )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </CardContent>
      </Card>
      <NewRoundDataDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveRoundData}
        latestRound={gameState.kpiHistory.length}
      />
    </div>
  );
}
