import { http } from "./http";

export async function getDashboard(weekStart) {
    const res = await http.get("/api/dashboard", {
        params: { weekStart }
    });
    return res.data;
}

