import {Navigate, Outlet, Route, Routes} from "react-router-dom";
import LoginPage from "../pages/LoginPage.jsx";
import SignupPage from "../pages/SignupPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";

function ProtectedRoute() {
    const token = localStorage.getItem("accessToken");
    if (!token || token === "[object Object]") {
        localStorage.removeItem("accessToken");
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
}

function PublicRoute({ children }) {
    const token = localStorage.getItem("accessToken");
    if (token && token !== "[object Object]") return <Navigate to="/dashboard" replace />;
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
