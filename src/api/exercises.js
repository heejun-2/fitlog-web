import { http } from "./http";

export async function listExercises() {
    const res = await http.get("/api/exercises");
    return res.data; // [{ id, name, category }, ...]
}
