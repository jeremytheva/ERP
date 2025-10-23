import { StrategicAdvisor } from "@/components/ai/strategic-advisor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export default function StrategicAdvisorPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-full border">
                <Lightbulb className="h-8 w-8 text-primary" />
            </div>
            <div>
                <CardTitle className="font-headline text-3xl">AI Strategic Advisor</CardTitle>
                <CardDescription>
                Get actionable recommendations from our AI advisor based on your current game state and team strategy.
                </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <StrategicAdvisor />
        </CardContent>
      </Card>
    </div>
  );
}
