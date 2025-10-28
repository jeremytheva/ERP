import { render, screen } from "@testing-library/react";
import { RoleDashboardLayout } from "../role-dashboard-layout";
import type { RoleDashboardData } from "../types";
import { TrendingUp, DollarSign } from "lucide-react";

describe("RoleDashboardLayout", () => {
  const mockData: RoleDashboardData = {
    kpis: [
      {
        id: "marketShare",
        label: "Market Share",
        value: 0.45,
        format: "percent",
        icon: TrendingUp,
      },
      {
        id: "grossRevenue",
        label: "Gross Revenue",
        value: 1250000,
        format: "currency",
        icon: DollarSign,
      },
    ],
    trend: {
      title: "Performance Trend",
      description: "Test trend description",
      series: [
        {
          id: "marketShare",
          label: "Market Share",
          format: "percent",
          data: [
            { round: 1, value: 0.4 },
            { round: 2, value: 0.5 },
          ],
        },
      ],
    },
    peerComparison: {
      title: "Peer Benchmark",
      description: "How we compare",
      metricLabel: "Revenue",
      format: "currency",
      data: [
        { name: "You", value: 1250000 },
        { name: "Peer", value: 1100000 },
      ],
    },
    table: {
      title: "Recent Rounds",
      caption: "Sample data",
      columns: [
        { key: "round", label: "Round" },
        { key: "value", label: "Value", format: "currency" },
      ],
      rows: [
        { round: 1, value: 1000000 },
        { round: 2, value: 1250000 },
      ],
    },
    updatedAtLabel: "just now",
  };

  it("renders KPIs, charts, and tables", () => {
    render(
      <RoleDashboardLayout
        title="Sales Dashboard"
        subtitle="Testing layout"
        data={mockData}
      />
    );

    expect(screen.getByText("Sales Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Testing layout")).toBeInTheDocument();
    expect(screen.getByText("Market Share")).toBeInTheDocument();
    expect(screen.getByText("Performance Trend")).toBeInTheDocument();
    expect(screen.getByText("Peer Benchmark")).toBeInTheDocument();
    expect(screen.getByText("Recent Rounds")).toBeInTheDocument();
    expect(screen.getByText(/just now/i)).toBeInTheDocument();
  });
});
