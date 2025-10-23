
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, AreaChart, Target, CheckSquare } from "lucide-react";

export default function TeamLeaderPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Crown className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="font-headline text-3xl">Team Leader View</CardTitle>
              <CardDescription>
                High-level strategy, data oversight, and final process governance.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="financial-review">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="financial-review">
                <AreaChart className="mr-2 h-4 w-4" />
                Financial Review
              </TabsTrigger>
              <TabsTrigger value="strategy-review">
                 <Target className="mr-2 h-4 w-4" />
                Strategy Review
              </TabsTrigger>
              <TabsTrigger value="final-checklist">
                <CheckSquare className="mr-2 h-4 w-4" />
                Final Checklist
              </TabsTrigger>
            </TabsList>
            <TabsContent value="financial-review" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Round Start Financial Review</CardTitle>
                        <CardDescription>Extract and log final Cash Balance and Net Income into the Key Metrics tab.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Content for this section to be built. This is for manual data entry from F.01 / ZFF7B to populate the dashboard.</p>
                    </CardContent>
                </Card>
            </TabsContent>
             <TabsContent value="strategy-review" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Performance & Strategy Review</CardTitle>
                        <CardDescription>Review high-level sales data from ZVC2 to set goals for the next round.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Content for this section to be built. Log strategic notes and target growth.</p>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="final-checklist" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Round Tasks Final Checklist</CardTitle>
                        <CardDescription>Governance section to confirm all critical tasks are complete before the round ends.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Content for this section to be built. This will pull from the Roles & Responsibilities tab for a final sign-off.</p>
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
