
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart2, List } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function KeyMetricsPage() {
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
                    <Button>Add New Round Data</Button>
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
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-muted-foreground">
                                    No data entered yet. Click "Add New Round Data" to begin.
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </CardContent>
      </Card>
    </div>
  );
}
