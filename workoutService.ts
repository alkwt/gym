
import type { WorkoutRoutine } from '@/lib/workouts';
import { type PresetExercise, presetExercises as defaultPresetExercises } from '@/lib/preset-exercises';
import { workouts as presetWorkouts } from '@/lib/workouts';

// Helper functions for Local Storage
const getFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') {
        return defaultValue;
    }
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
        return defaultValue;
    }
};

const saveToLocalStorage = <T,>(key: string, value: T): void => {
    if (typeof window === 'undefined') {
        console.warn(`Tried to save to localStorage key "${key}" on the server.`);
        return;
    }
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
    }
};

// Keys
const CUSTOM_WORKOUTS_KEY = 'gymflow_customWorkouts';
const DELETED_PRESET_IDS_KEY = 'gymflow_deletedPresetIds';
const WORKOUT_ORDER_KEY = 'gymflow_workoutOrder';
const CUSTOM_PRESET_EXERCISES_KEY = 'gymflow_customPresetExercises';


export async function getAllPresetExercises(): Promise<PresetExercise[]> {
    const customPresets = getFromLocalStorage<PresetExercise[]>(CUSTOM_PRESET_EXERCISES_KEY, []);
    const combined = [...customPresets, ...defaultPresetExercises];
    const uniquePresets = Array.from(new Map(combined.map(p => [p.name, p])).values());
    
    return uniquePresets.sort((a,b) => a.name.localeCompare(b.name));
}

export async function addPresetExercise(exercise: PresetExercise): Promise<void> {
    const customPresets = getFromLocalStorage<PresetExercise[]>(CUSTOM_PRESET_EXERCISES_KEY, []);
    if (!customPresets.some(p => p.name === exercise.name)) {
        const newPresets = [...customPresets, exercise];
        saveToLocalStorage(CUSTOM_PRESET_EXERCISES_KEY, newPresets);
    }
}

export async function getAllWorkouts(): Promise<WorkoutRoutine[]> {
    const customWorkouts = getFromLocalStorage<WorkoutRoutine[]>(CUSTOM_WORKOUTS_KEY, []);
    const deletedPresetIds = getFromLocalStorage<string[]>(DELETED_PRESET_IDS_KEY, []);
    const workoutOrder = getFromLocalStorage<string[]>(WORKOUT_ORDER_KEY, []);

    const visiblePresetWorkouts = Object.values(presetWorkouts)
        .filter(workout => !deletedPresetIds.includes(workout.id));
    
    const allRoutines = [...visiblePresetWorkouts, ...customWorkouts];
    
    if (workoutOrder.length > 0) {
        const routineMap = new Map(allRoutines.map(r => [r.id, r]));
        const sortedRoutines = workoutOrder
            .map(id => routineMap.get(id))
            .filter((r): r is WorkoutRoutine => !!r);
        
        const unsortedRoutines = allRoutines.filter(r => !workoutOrder.includes(r.id));
        return [...sortedRoutines, ...unsortedRoutines];
    }
    
    return allRoutines;
}

export async function getWorkout(id: string): Promise<WorkoutRoutine | null> {
    const customWorkouts = getFromLocalStorage<WorkoutRoutine[]>(CUSTOM_WORKOUTS_KEY, []);
    const customWorkout = customWorkouts.find(w => w.id === id);
    if (customWorkout) {
        return customWorkout;
    }

    const deletedPresetIds = getFromLocalStorage<string[]>(DELETED_PRESET_IDS_KEY, []);
    if (presetWorkouts[id] && !deletedPresetIds.includes(id)) {
        return presetWorkouts[id];
    }
    
    return null;
}

export async function createWorkout(workout: WorkoutRoutine): Promise<void> {
    const customWorkouts = getFromLocalStorage<WorkoutRoutine[]>(CUSTOM_WORKOUTS_KEY, []);
    const newWorkouts = [...customWorkouts, workout];
    saveToLocalStorage(CUSTOM_WORKOUTS_KEY, newWorkouts);

    const workoutOrder = getFromLocalStorage<string[]>(WORKOUT_ORDER_KEY, []);
    saveToLocalStorage(WORKOUT_ORDER_KEY, [...workoutOrder, workout.id]);
}

export async function updateWorkout(workout: WorkoutRoutine): Promise<void> {
    let customWorkouts = getFromLocalStorage<WorkoutRoutine[]>(CUSTOM_WORKOUTS_KEY, []);
    const index = customWorkouts.findIndex(w => w.id === workout.id);

    if (index > -1) {
        // It's already a custom workout, so just update it in place.
        customWorkouts[index] = workout;
    } else {
        // This handles "editing" a preset workout for the first time.
        // It becomes a custom workout, and we need to hide the original preset.
        customWorkouts.push(workout);
        
        if (presetWorkouts[workout.id]) {
            const deletedPresetIds = getFromLocalStorage<string[]>(DELETED_PRESET_IDS_KEY, []);
            if (!deletedPresetIds.includes(workout.id)) {
                saveToLocalStorage(DELETED_PRESET_IDS_KEY, [...deletedPresetIds, workout.id]);
            }
        }
    }
    saveToLocalStorage(CUSTOM_WORKOUTS_KEY, customWorkouts);
}

export async function deleteWorkout(id: string): Promise<void> {
    // If the ID corresponds to an original preset, mark it as "deleted".
    // This handles deleting original presets and ensures edited presets don't reappear.
    if (presetWorkouts[id]) {
        const deletedPresetIds = getFromLocalStorage<string[]>(DELETED_PRESET_IDS_KEY, []);
        if (!deletedPresetIds.includes(id)) {
            saveToLocalStorage(DELETED_PRESET_IDS_KEY, [...deletedPresetIds, id]);
        }
    }
    
    // Remove from the custom workouts list (if it exists there).
    // This handles both custom-created workouts and edited presets.
    const customWorkouts = getFromLocalStorage<WorkoutRoutine[]>(CUSTOM_WORKOUTS_KEY, []);
    const newWorkouts = customWorkouts.filter(w => w.id !== id);
    saveToLocalStorage(CUSTOM_WORKOUTS_KEY, newWorkouts);

    // Finally, remove it from the explicit order list.
    const workoutOrder = getFromLocalStorage<string[]>(WORKOUT_ORDER_KEY, []);
    const newOrder = workoutOrder.filter(orderId => orderId !== id);
    saveToLocalStorage(WORKOUT_ORDER_KEY, newOrder);
}

export async function saveWorkoutOrder(ids: string[]): Promise<void> {
    saveToLocalStorage(WORKOUT_ORDER_KEY, ids);
}
