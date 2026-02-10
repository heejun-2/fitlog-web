import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import DashboardPage from "../pages/DashboardPage";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* 기본 진입은 로그인으로 */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* 일단 대시보드는 임시 화면 */}
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* 없는 경로는 로그인으로 */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
