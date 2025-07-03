export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  weight: number | string;
  equipment: string;
  equipmentGrab?: boolean;
  equipmentReturn?: boolean;
  equipmentReturnString?: string;
  instructions?: string;
};

export type WorkoutRoutine = {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
  cardio?: {
    name: string;
    duration: string;
  };
};

export const workouts: Record<string, WorkoutRoutine> = {
  a: {
    id: "a",
    name: "Workout A",
    description: "Back & Biceps",
    exercises: [
      {
        name: "Lat Pull Down",
        sets: 6,
        reps: "10",
        weight: 20,
        equipment: "Lat pull down machine.",
        instructions: "Sit upright, avoid leaning back too much, focus on back muscles, pull to chest, control return.",
      },
      {
        name: "Bicep V-Handle Pull Down",
        sets: 6,
        reps: "12",
        weight: 20,
        equipment: "Cable machine with V-handle.",
        instructions: "Pull to chest, squeeze shoulder blades, control return.",
      },
      {
        name: "Preacher Bicep Curl",
        sets: 6,
        reps: "12",
        weight: 5,
        equipment: "2 10 lbs dumbbells.",
        equipmentGrab: true,
        instructions: "Curl slowly -> pause -> control return.",
      },
      {
        name: "Preacher Dumbbell Hammer Curl",
        sets: 6,
        reps: "12",
        weight: 10,
        equipment: "Dumbbells and preacher curl bench.",
        instructions: "Palms face in, curl slowly -> pause -> control return.",
      },
      {
        name: "Standing Dumbbell Alternating Bicep Curl",
        sets: 4,
        reps: "20",
        weight: 10,
        equipment: "Dumbbells.",
      },
      {
        name: "Standing Dumbbell Alternating Hammer Curl",
        sets: 4,
        reps: "20",
        weight: 10,
        equipment: "Dumbbells.",
      },
      {
        name: "Standing Dumbbell Simultaneous Forearm Twist",
        sets: 4,
        reps: "20",
        weight: 10,
        equipment: "Dumbbells.",
        equipmentReturn: true,
      },
      {
        name: "Seated Crunch Machine",
        sets: 2,
        reps: "1; 2; 1",
        weight: "55 lbs; 70 lbs; 85 lbs",
        equipment: "Seated crunch machine.",
      },
    ],
    cardio: {
      name: "30-min Treadmill",
      duration: "",
    },
  },
  b: {
    id: "b",
    name: "Workout B",
    description: "Triceps & Abs",
    exercises: [
      {
        name: "Tricep Rope Push Down",
        sets: 8,
        reps: "12",
        weight: 5,
        equipment: "Cable machine with rope.",
        instructions: "Elbows fixed, spread at bottom, control return.",
      },
      {
        name: "Dumbbell Single Arm Overhead Tricep Extension",
        sets: 6,
        reps: "12",
        weight: 5,
        equipment: "1 5 lbs dumbbell and be seated at a bench.",
        equipmentGrab: true,
        instructions: "Keep elbow close.",
        equipmentReturn: true,
        equipmentReturnString: "1 5 lbs dumbbell."
      },
      {
        name: "Standing Dumbbell Simultaneous Forearm Twist",
        sets: 4,
        reps: "20",
        weight: 10,
        equipment: "2 10 lbs dumbbells.",
        equipmentGrab: true,
        equipmentReturn: true,
        equipmentReturnString: "1 10 lbs dumbbell."
      },
      {
        name: "Standing Dumbbell Single Arm Side Bend",
        sets: 6,
        reps: "15",
        weight: 10,
        equipment: "10lb dumbbell.",
      },
      {
        name: "Standing Russian Twist",
        sets: 6,
        reps: "10",
        weight: 10,
        equipment: "1 10 lbs dumbbell.",
        instructions: "Lock lower body, twist 90 degrees sideways -> return -> twist 90 degrees to another side -> return.",
        equipmentReturn: true,
      },
      {
        name: "Seated Crunch Machine",
        sets: 3,
        reps: "1; 2; 1",
        weight: "55 lbs; 70 lbs; 85 lbs",
        equipment: "Seated crunch machine.",
      },
    ],
    cardio: {
      name: "30-min Treadmill",
      duration: "",
    },
  },
  c: {
    id: "c",
    name: "Workout C",
    description: "Legs, Abs & Triceps",
    exercises: [
      {
        name: "Leg Extension",
        sets: 6,
        reps: "15",
        weight: 15,
        equipment: "Leg extension machine.",
      },
      {
        name: "Abductor",
        sets: 6,
        reps: "15",
        weight: 50,
        equipment: "Abductor machine.",
      },
      {
        name: "Adductor",
        sets: 6,
        reps: "15",
        weight: 50,
        equipment: "Adductor machine.",
      },
      {
        name: "Standing Plate Single Arm Side Bend",
        sets: 6,
        reps: "15",
        weight: 10,
        equipment: "10lb plate.",
        equipmentGrab: true,
        equipmentReturn: true,
      },
      {
        name: "Seated Crunch Machine",
        sets: 3,
        reps: "1; 2; 1",
        weight: "55 lbs; 70 lbs; 85 lbs",
        equipment: "Seated crunch machine.",
      },
      {
        name: "Tricep Rope Push Down",
        sets: 8,
        reps: "12",
        weight: 5,
        equipment: "Cable machine with rope.",
        instructions: "Elbows fixed, spread at bottom, control return.",
      },
    ],
    cardio: {
      name: "30-min Treadmill",
      duration: "",
    },
  },
};
