import { http } from "./http";

export async function listWorkoutTemplates() {
    const res = await http.get("/api/workout-templates");
    return res.data ?? [];
}

export async function createWorkoutTemplate(payload) {
    const res = await http.post("/api/workout-templates", payload);
    return res.data;
}

export async function deleteWorkoutTemplate(templateId) {
    const res = await http.delete(`/api/workout-templates/${templateId}`);
    return res.data;
}
