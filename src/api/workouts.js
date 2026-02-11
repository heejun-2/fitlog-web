import { http } from "./http";

/**
 * 날짜별 운동 기록 조회
 * GET /api/workouts?date=YYYY-MM-DD
 */
export async function getWorkoutsByDate(date) {
    const res = await http.get("/api/workouts", {
        params: { date },
    });
    return res.data;
}
