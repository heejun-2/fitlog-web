import { http } from "./http";

/**
 * 회원가입
 * @param {{email:string, password:string, nickname:string}} payload
 */
export async function signup(payload) {
    const res = await http.post("/api/users/signup", payload);
    return res.data;
}

export async function loginApi(email, password) {
    // 백엔드: POST /api/auth/login
    const res = await http.post("/api/auth/login", { email, password });
    // 응답 예: { accessToken: "..." }
    return res.data;
}

export async function meApi() {
    // 백엔드: GET /api/auth/me
    const res = await http.get("/api/auth/me");
    return res.data;
}
