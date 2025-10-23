
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function LiveInventoryPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">Live Inventory Tracker (LIT)</CardTitle>
              <CardDescription>
                Source of truth for stock. Centralized record of inventory and transactions.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p>Content for Live Inventory Tracker to be built here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
