
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export default function ProcurementPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">Procurement</CardTitle>
              <CardDescription>
                RM sourcing, inventory replenishment, and sustainability investment.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p>Content for Procurement to be built here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
