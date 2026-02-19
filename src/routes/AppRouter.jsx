import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";

import LoginPage from "../pages/LoginPage.jsx";
import SignupPage from "../pages/SignupPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import { meApi } from "../api/auth";

function ProtectedRoute() {
    const token = localStorage.getItem("accessToken");

    const [checking, setChecking] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        (async () => {
            // 토큰 자체가 없으면 바로 종료(리다이렉트는 아래에서)
            if (!token) {
                setAuthorized(false);
                setChecking(false);
                return;
            }

            try {
                // 서버에 검증 요청 (토큰 유효하면 200)
                await meApi();
                setAuthorized(true);
                // eslint-disable-next-line no-unused-vars
            } catch (e) {
                // 만료/무효면 정리
                localStorage.removeItem("accessToken");
                localStorage.removeItem("me");
                setAuthorized(false);
            } finally {
                setChecking(false);
            }
        })();
    }, [token]);

    if (!token) return <Navigate to="/login" replace />;

    // 검증 중에는 잠깐 로딩 화면
    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="rounded-2xl border bg-white px-6 py-4 text-sm text-slate-700">
                    로그인 확인 중...
                </div>
            </div>
        );
    }

    if (!authorized) return <Navigate to="/login" replace />;

    return <Outlet />;
}

// 로그인 상태면 /login 접근 막기
function PublicRoute({ children }) {
    const token = localStorage.getItem("accessToken");
    if (token) return <Navigate to="/dashboard" replace />;
    return children;
}

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

            {/* ✅ 보호 영역 */}
            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
