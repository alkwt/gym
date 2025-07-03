
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { WorkoutRoutine } from "@/lib/workouts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, PlusCircle, Trash2, Pencil } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getAllWorkouts, deleteWorkout, saveWorkoutOrder } from "@/services/workoutService";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";


export function WorkoutSelector() {
  const [lastWorkout, setLastWorkout] = useState<string | null>(null);
  const [allRoutines, setAllRoutines] = useState<WorkoutRoutine[] | null>(null);
  const [routineToDelete, setRoutineToDelete] = useState<WorkoutRoutine | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const dragItem = useRef<string | null>(null);
  const dragOverItem = useRef<string | null>(null);

  useEffect(() => {
    const savedWorkout = localStorage.getItem("lastWorkout");
    if (savedWorkout) {
      setLastWorkout(savedWorkout);
    }

    async function loadWorkouts() {
      const routines = await getAllWorkouts();
      setAllRoutines(routines);
    }
    loadWorkouts();
  }, []);

  const handleSelectWorkout = (id: string) => {
    localStorage.setItem("lastWorkout", id);
    router.push(`/workout/${id}`);
  };

  const handleCreateWorkout = () => {
    router.push('/workout/new');
  };

  const handleEditWorkout = (id: string) => {
    router.push(`/workout/edit/${id}`);
  };
  
  const handleDeleteWorkout = async () => {
    if (!routineToDelete || !allRoutines) return;

    try {
        await deleteWorkout(routineToDelete.id);
        
        const updatedAllRoutines = allRoutines.filter(r => r.id !== routineToDelete.id);
        setAllRoutines(updatedAllRoutines);
        await saveWorkoutOrder(updatedAllRoutines.map(r => r.id));
    } catch (error) {
        console.error("Failed to delete workout:", error);
        toast({
            title: "Delete Failed",
            description: "Could not delete workout.",
            variant: "destructive",
        });
    } finally {
        setRoutineToDelete(null);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    dragItem.current = id;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    dragOverItem.current = id;
  };

  const handleDragEnd = async () => {
    if (!dragItem.current || !dragOverItem.current || dragItem.current === dragOverItem.current || !allRoutines) {
        dragItem.current = null;
        dragOverItem.current = null;
        return;
    }

    const currentAllRoutines = [...allRoutines];

    const dragItemIndex = currentAllRoutines.findIndex(r => r.id === dragItem.current);
    const dragOverItemIndex = currentAllRoutines.findIndex(r => r.id === dragOverItem.current);

    if (dragItemIndex === -1 || dragOverItemIndex === -1) return;

    const newRoutines = [...currentAllRoutines];
    const [draggedItem] = newRoutines.splice(dragItemIndex, 1);
    newRoutines.splice(dragOverItemIndex, 0, draggedItem);

    setAllRoutines(newRoutines);

    try {
        await saveWorkoutOrder(newRoutines.map(r => r.id));
    } catch (error) {
        console.error("Failed to save workout order:", error);
        setAllRoutines(currentAllRoutines);
        toast({
            title: "Reorder Failed",
            description: "Could not save the new workout order.",
            variant: "destructive",
        });
    } finally {
        dragItem.current = null;
        dragOverItem.current = null;
    }
  };

  if (allRoutines === null) {
      return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
              {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-6 w-6" />
                        </div>
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-10 w-full" />
                      </CardContent>
                  </Card>
              ))}
          </div>
      )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {allRoutines.map((routine) => (
          <Card
            key={routine.id}
            draggable
            onDragStart={(e) => handleDragStart(e, routine.id)}
            onDragEnter={(e) => handleDragEnter(e, routine.id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className="flex flex-col justify-between hover:border-primary transition-all duration-300 cursor-move"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="font-headline">{routine.name}</CardTitle>
                 <div className="flex items-center gap-2">
                    {lastWorkout === routine.id && (
                      <Badge variant="outline" className="border-accent text-accent whitespace-nowrap">Last Workout</Badge>
                    )}
                     <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleEditWorkout(routine.id); }}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); setRoutineToDelete(routine); }}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                    </Button>
                 </div>
              </div>
              <CardDescription>{routine.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleSelectWorkout(routine.id)}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Start Workout <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
        <Card
            className="flex flex-col justify-between hover:border-primary transition-all duration-300"
          >
            <CardHeader>
              <CardTitle className="font-headline">Create New Workout</CardTitle>
              <CardDescription>Build your own custom routine.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCreateWorkout}
                className="w-full"
                variant="outline"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Routine
              </Button>
            </CardContent>
          </Card>
      </div>
      <AlertDialog open={!!routineToDelete} onOpenChange={(open) => !open && setRoutineToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the workout routine "{routineToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRoutineToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWorkout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
