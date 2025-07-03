export type PresetExercise = {
  name: string;
  instructions: string;
};

export const presetExercises: PresetExercise[] = [
  {
    name: "Lat Pull Down",
    instructions: "Sit upright, avoid leaning back too much, focus on back muscles, pull to chest, control return",
  },
  {
    name: "Bicep V-Handle Pull Down",
    instructions: "Pull to chest, squeeze shoulder blades, control return",
  },
  {
    name: "Preacher Bicep Curl",
    instructions: "Curl slowly -> pause -> control return",
  },
  {
    name: "Preacher Dumbbell Hammer Curl",
    instructions: "Palms face in, curl slowly -> pause -> control return",
  },
  {
    name: "Standing Dumbbell Alternating Bicep Curl",
    instructions: "",
  },
  {
    name: "Standing Dumbbell Alternating Hammer Curl",
    instructions: "",
  },
  {
    name: "Standing Dumbbell Simultaneous Forearm Twist",
    instructions: "",
  },
  { name: "Seated Crunch Machine", instructions: "" },
  { name: "Treadmill", instructions: "" },
  {
    name: "Tricep Rope Push Down",
    instructions: "Elbows fixed, spread at bottom, control return",
  },
  {
    name: "Dumbbell Single Arm Overhead Tricep Extension",
    instructions: "Keep elbow close",
  },
  { name: "Standing Dumbbell Single Arm Side Bend", instructions: "" },
  {
    name: "Standing Russian Twist",
    instructions: "Lock lower body, twist 90 degrees sideways -> return -> twist 90 degrees to another side -> return",
  },
  { name: "Leg Extension", instructions: "" },
  { name: "Abductor", instructions: "" },
  { name: "Adductor", instructions: "" },
];
