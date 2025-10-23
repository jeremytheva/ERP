import { CompetitorLog } from "@/components/competitor-log";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function CompetitorLogPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">Competitor Analysis Log</CardTitle>
              <CardDescription>
                A shared log for your team to add and review notes about competitors.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CompetitorLog />
        </CardContent>
      </Card>
    </div>
  );
}
