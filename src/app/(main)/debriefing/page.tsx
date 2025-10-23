import { DebriefingForm } from "@/components/ai/debriefing-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebriefingPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">End-of-Round Debriefing</CardTitle>
          <CardDescription>
            Enter your performance data, competitor analysis, and action items to generate an AI-powered summary report for this round.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DebriefingForm />
        </CardContent>
      </Card>
    </div>
  );
}
