
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";

export default function KeyMetricsPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
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
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p>Content for Key Metrics to be built here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
