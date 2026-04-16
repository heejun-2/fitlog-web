import { http } from "./http";

export async function signup(payload) {
    const response = await http.post("/api/users/signup", payload);
    return response.data;
}

export async function loginApi(email, password) {
    const response = await http.post("/api/auth/login", { email, password });
    return response.data;
}

export async function refreshTokenApi(refreshToken) {
    const response = await http.post("/api/auth/refresh", { refreshToken });
    return response.data;
}

export async function meApi() {
    const response = await http.get("/api/auth/me");
    return response.data;
}
