import { Dumbbell } from "lucide-react";
import { WorkoutSelector } from "@/components/workout/WorkoutSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center text-center mb-12">
        <div className="bg-primary rounded-full p-4 mb-4">
          <Dumbbell className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="text-5xl font-bold font-headline text-primary-foreground tracking-tight">
          GymFlow
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Select your workout for today.
        </p>
      </div>
      <WorkoutSelector />
    </main>
  );
}
