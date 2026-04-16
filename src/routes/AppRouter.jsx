import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginPage from "../pages/LoginPage.jsx";
import SignupPage from "../pages/SignupPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import StatsPage from "../pages/StatsPage.jsx";
import { meApi } from "../api/auth";
import { clearAuthSession, getAccessToken } from "../utils/authStorage";

function ProtectedRoute() {
    const token = getAccessToken();
    const [checking, setChecking] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        (async () => {
            if (!token) {
                setAuthorized(false);
                setChecking(false);
                return;
            }

            try {
                await meApi();
                setAuthorized(true);
            } catch {
                clearAuthSession();
                setAuthorized(false);
            } finally {
                setChecking(false);
            }
        })();
    }, [token]);

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (checking) {
        return (
            <div className="ds-app-shell flex min-h-screen items-center justify-center px-4">
                <div className="ds-glass ds-panel px-6 py-4 text-sm text-slate-700">
                    로그인 상태를 확인하는 중입니다.
                </div>
            </div>
        );
    }

    if (!authorized) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

function PublicRoute({ children }) {
    const token = getAccessToken();
    if (token) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
}

export default function AppRouter() {
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />
            <Route
                path="/signup"
                element={
                    <PublicRoute>
                        <SignupPage />
                    </PublicRoute>
                }
            />

            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/stats" element={<StatsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
