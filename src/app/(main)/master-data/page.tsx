
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Database } from "lucide-react";

export default function MasterDataPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Database className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">Reference & Master Data</CardTitle>
              <CardDescription>
                Static reference for fixed parameters like Bill of Materials (BOM), costs, and vendor details.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            <p>Content for Master Data to be built here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
