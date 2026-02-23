import { useLocation, useNavigate } from "react-router-dom";
import Button from "../ui/Button";

export default function TopNav({ me, onLogout }) {
    const nav = useNavigate();
    const location = useLocation();

    return (
        <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                {/* 왼쪽: 로고 */}
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
                        F
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-900">FitLog</p>
                    </div>
                </div>

                {/* 가운데: 탭 */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => nav("/dashboard")}
                        className={`pb-1 text-sm font-semibold transition ${
                            location.pathname === "/dashboard"
                                ? "border-b-2 border-slate-900 text-slate-900"
                                : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                        Dashboard
                    </button>

                    <button
                        onClick={() => nav("/stats")}
                        className={`pb-1 text-sm font-semibold transition ${
                            location.pathname === "/stats"
                                ? "border-b-2 border-slate-900 text-slate-900"
                                : "text-slate-500 hover:text-slate-900"
                        }`}
                    >
                        Stats
                    </button>
                </div>

                {/* 오른쪽: 유저 + 로그아웃 */}
                <div className="flex items-center gap-3">
                    {me?.email && (
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-semibold text-slate-900">{me.email}</p>
                        </div>
                    )}
                    <Button variant="ghost" onClick={onLogout}>
                        로그아웃
                    </Button>
                </div>
            </div>
        </div>
    );
}
