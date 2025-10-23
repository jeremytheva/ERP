
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Truck } from "lucide-react";

export default function LogisticsPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Truck className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">Logistics</CardTitle>
              <CardDescription>
                Finished goods transfer, cash flow monitoring, and contingency planning.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p>Content for Logistics to be built here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
