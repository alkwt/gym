
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { WorkoutRoutine } from "@/lib/workouts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ArrowRight, Check, Home, SkipForward, Timer, Footprints } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type WorkoutState = "REMINDER_START" | "WORKOUT" | "RESTING" | "REMINDER_END" | "CARDIO" | "COMPLETE";

const REST_DURATION = 60;

const CircleProgress = ({ timeLeft }: { timeLeft: number }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, (timeLeft / REST_DURATION) * 100);
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-32 h-32 sm:w-40 sm:h-40">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          stroke="hsl(var(--muted))"
          fill="transparent"
          strokeWidth="8"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          stroke="hsl(var(--accent))"
          fill="transparent"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx="60"
          cy="60"
          transform="rotate(-90 60 60)"
          className="transition-all duration-1000 linear"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
         <span className="text-4xl font-bold font-headline text-primary-foreground">
          {timeLeft}
        </span>
        <span className="text-sm text-muted-foreground">seconds</span>
      </div>
    </div>
  );
};


export function WorkoutTracker({ routine }: { routine: WorkoutRoutine }) {
  const router = useRouter();
  const [workoutState, setWorkoutState] = useState<WorkoutState>("REMINDER_START");
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timeLeft, setTimeLeft] = useState(REST_DURATION);
  const [restEndTime, setRestEndTime] = useState<number | null>(null);

  const currentExercise = routine.exercises[currentExerciseIndex];

  const advanceToNextExercise = useCallback(() => {
    localStorage.removeItem('gymflowRestData');
    const nextExerciseIndex = currentExerciseIndex + 1;
    if (nextExerciseIndex < routine.exercises.length) {
        setCurrentExerciseIndex(nextExerciseIndex);
        setCurrentSet(1);
        const nextExercise = routine.exercises[nextExerciseIndex];
        if (nextExercise.equipmentGrab) {
            setWorkoutState('REMINDER_START');
        } else {
            setWorkoutState('WORKOUT');
        }
    } else {
        if (routine.cardio) {
            setWorkoutState('CARDIO');
        } else {
            setWorkoutState('COMPLETE');
        }
    }
  }, [currentExerciseIndex, routine.exercises, routine.cardio]);

  const handleNext = useCallback(() => {
    if (workoutState === 'REMINDER_START') {
        setWorkoutState('WORKOUT');
    } else if (workoutState === 'REMINDER_END') {
        advanceToNextExercise();
    }
  }, [workoutState, advanceToNextExercise]);
  
  useEffect(() => {
    const restDataStr = localStorage.getItem('gymflowRestData');
    if (!restDataStr) {
      if (workoutState === 'REMINDER_START' && !currentExercise.equipmentGrab) {
          setWorkoutState('WORKOUT');
      }
      return;
    }

    try {
        const restData = JSON.parse(restDataStr);
        if (restData.routineId !== routine.id) {
            localStorage.removeItem('gymflowRestData');
            return;
        }

        const remaining = restData.endTime - Date.now();
        if (remaining > 0) {
            setCurrentExerciseIndex(restData.exerciseIndex);
            setCurrentSet(restData.set);
            setRestEndTime(restData.endTime);
            setWorkoutState('RESTING');
        } else {
            setCurrentExerciseIndex(restData.exerciseIndex);
            setCurrentSet(restData.set);
            setWorkoutState('WORKOUT');
            localStorage.removeItem('gymflowRestData');
        }
    } catch (e) {
        console.error("Failed to parse rest data", e);
        localStorage.removeItem('gymflowRestData');
    }
  }, [routine.id, currentExercise.equipmentGrab, workoutState]);


  useEffect(() => {
    if (workoutState !== 'RESTING' || !restEndTime) {
        return;
    }

    const updateTimer = () => {
        const remaining = Math.round((restEndTime - Date.now()) / 1000);

        if (remaining <= 0) {
            setTimeLeft(0);
            setWorkoutState('WORKOUT');
            setRestEndTime(null);
            localStorage.removeItem('gymflowRestData');
        } else {
            setTimeLeft(remaining);
        }
    };
    
    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    document.addEventListener('visibilitychange', updateTimer);

    return () => {
        clearInterval(timerId);
        document.removeEventListener('visibilitychange', updateTimer);
    };
  }, [workoutState, restEndTime]);

  const handleFinishSet = () => {
    if (currentSet < currentExercise.sets) {
      const nextSet = currentSet + 1;
      const endTime = Date.now() + REST_DURATION * 1000;
      
      setCurrentSet(nextSet);
      setRestEndTime(endTime);
      localStorage.setItem('gymflowRestData', JSON.stringify({
          endTime: endTime,
          routineId: routine.id,
          exerciseIndex: currentExerciseIndex,
          set: nextSet,
      }));
      setWorkoutState('RESTING');
    } else {
      localStorage.removeItem('gymflowRestData');
      if (currentExercise.equipmentReturn) {
        setWorkoutState('REMINDER_END');
      } else {
        advanceToNextExercise();
      }
    }
  };

  const handleSkipRest = () => {
    setWorkoutState('WORKOUT');
    setRestEndTime(null);
    localStorage.removeItem('gymflowRestData');
    setTimeLeft(REST_DURATION);
  };

  if (workoutState === 'COMPLETE') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <Check className="h-24 w-24 text-accent mb-4" />
        <h1 className="text-4xl font-bold font-headline mb-2">Workout Complete!</h1>
        <p className="text-muted-foreground mb-8">Great job finishing {routine.name}.</p>
        <Button onClick={() => router.push('/')}>
          <Home className="mr-2 h-4 w-4" />
          Back to Menu
        </Button>
      </div>
    );
  }

  if (workoutState === 'CARDIO') {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <Footprints className="h-24 w-24 text-accent mb-4" />
            <h1 className="text-4xl font-bold font-headline mb-2">Final: {routine.cardio!.name}</h1>
            {routine.cardio!.duration && <p className="text-lg mb-8">{routine.cardio!.duration}</p>}
            <Button onClick={() => setWorkoutState('COMPLETE')} size="lg">
                <Check className="mr-2 h-4 w-4" />
                End Workout
            </Button>
        </div>
    );
  }

  if (workoutState === 'RESTING') {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center animate-in fade-in-50">
            <Timer className="h-16 w-16 text-accent mb-4"/>
            <h1 className="text-4xl font-bold font-headline mb-4">Rest Time</h1>
            <p className="text-muted-foreground mb-8">
                Next up: {currentExercise.name} - Set {currentSet}
            </p>
            <CircleProgress timeLeft={timeLeft} />
            <Button onClick={handleSkipRest} variant="ghost" className="mt-8">
                Skip Rest <SkipForward className="ml-2 h-4 w-4" />
            </Button>
        </div>
    );
  }
  
  const totalExercises = routine.exercises.length;
  const progressPercentage = ((currentExerciseIndex) / totalExercises) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6">
        <Card className="w-full max-w-md mx-auto">
            <div className="p-6">
                <Progress value={progressPercentage} className="mb-2 h-2" />
                <p className="text-sm text-muted-foreground text-center">Exercise {currentExerciseIndex + 1} of {totalExercises}</p>
            </div>
            
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-headline">{currentExercise.name}</CardTitle>
                <CardDescription className="text-lg">Set {currentSet} of {currentExercise.sets}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                <div className="grid grid-cols-2 gap-4 text-center my-6 w-full">
                    <div>
                        <p className="text-sm text-muted-foreground">Reps</p>
                        <p className="text-2xl font-bold">{currentExercise.reps}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Weight</p>
                        <p className="text-2xl font-bold">
                            {typeof currentExercise.weight === 'string'
                                ? currentExercise.weight
                                : (currentExercise.weight > 0 ? `${currentExercise.weight} lbs` : 'Bodyweight')
                            }
                        </p>
                    </div>
                </div>
                {currentExercise.instructions && (
                  <p className="text-muted-foreground text-center mb-6 px-4">{currentExercise.instructions}</p>
                )}
                <Button onClick={handleFinishSet} size="lg" className="w-full h-14 text-lg bg-accent hover:bg-accent/90 text-accent-foreground rounded-full shadow-lg transition-transform transform hover:scale-105">
                    Finish Set
                    <Check className="ml-2 h-6 w-6" />
                </Button>
            </CardContent>
        </Card>
         <AlertDialog open={workoutState === 'REMINDER_START' || workoutState === 'REMINDER_END'}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="font-headline">
                    {workoutState === 'REMINDER_START' ? "Get Ready!" : "Equipment Return"}
                </AlertDialogTitle>
                <AlertDialogDescription>
                    {workoutState === 'REMINDER_START' 
                        ? `For the next exercise, you'll need: ${currentExercise.equipment}`
                        : `Please return the following equipment: ${currentExercise.equipmentReturnString || currentExercise.equipment}`
                    }
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={handleNext} className="bg-accent hover:bg-accent/90">
                    {workoutState === 'REMINDER_START' ? "Start Exercise" : "Next Exercise"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
