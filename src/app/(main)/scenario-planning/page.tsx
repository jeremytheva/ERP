import { ScenarioForm } from "@/components/ai/scenario-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ScenarioPlanningPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Scenario Planning Tool</CardTitle>
          <CardDescription>
            Simulate potential outcomes by adjusting key decision variables. The AI will predict the impact on your KPIs based on the current game state.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScenarioForm />
        </CardContent>
      </Card>
    </div>
  );
}
