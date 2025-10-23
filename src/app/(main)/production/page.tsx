
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Factory } from "lucide-react";

export default function ProductionPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Factory className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">Production</CardTitle>
              <CardDescription>
                Capacity, efficiency, BOM, and production release management.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p>Content for Production to be built here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
