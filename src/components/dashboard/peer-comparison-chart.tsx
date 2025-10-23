"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList, Cell } from "recharts";
import type { PeerData } from "@/types";
import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";

interface PeerComparisonChartProps {
  peerData: PeerData[];
  currentUserValuation: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    compactDisplay: "short",
  }).format(value);

export function PeerComparisonChart({ peerData, currentUserValuation }: PeerComparisonChartProps) {
  const { profile } = useAuth();
  const userName = profile?.name || 'You';

  const chartData = useMemo(() => {
    const currentUserData = {
      name: userName,
      companyValuation: currentUserValuation,
      netIncome: 0, // Placeholder, not used in this chart
      totalEmissions: 0, // Placeholder, not used in this chart
    };
    const combined = [...peerData, currentUserData].sort(
      (a, b) => b.companyValuation - a.companyValuation
    );
    return combined;
  }, [peerData, currentUserValuation, userName]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Peer Comparison: Company Valuation</CardTitle>
        <CardDescription>Your performance against other teams.</CardDescription>
      </CardHeader>
      <CardContent className="pl-0">
        <ChartContainer config={{}} className="h-[250px] w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 10, right: 40 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={80}
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
            />
            <XAxis dataKey="companyValuation" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" formatter={(value) => formatCurrency(value as number)} />}
            />
            <Bar dataKey="companyValuation" radius={4}>
              {chartData.map((entry) => (
                <Cell 
                  key={`cell-${entry.name}`} 
                  fill={entry.name === userName ? 'hsl(var(--accent))' : 'hsl(var(--chart-2))'} 
                />
              ))}
              <LabelList
                dataKey="companyValuation"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) => formatCurrency(value)}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
