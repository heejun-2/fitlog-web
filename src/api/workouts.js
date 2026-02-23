// src/api/workouts.js
import { http } from "./http";

export async function listWorkouts(date) {
    const res = await http.get("/api/workouts", { params: { date } });
    return res.data;
}

export async function createWorkout(payload) {
    const res = await http.post("/api/workouts", payload);
    return res.data;
}

export async function updateWorkout(workoutId, payload) {
    // payload: { workoutDate, memo, sets: [{exerciseId, weight, reps, setOrder}] }
    const res = await http.put(`/api/workouts/${workoutId}`, payload);
    return res.data;
}

export async function deleteWorkout(workoutId) {
    const res = await http.delete(`/api/workouts/${workoutId}`);
    return res.data;
}



