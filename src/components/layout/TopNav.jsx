import { useLocation, useNavigate } from "react-router-dom";
import Button from "../ui/Button";

export default function TopNav({ me, onLogout }) {
    const nav = useNavigate();
    const location = useLocation();

    return (
        <div className="sticky top-0 z-20 px-4 pt-4">
            <div className="ds-glass ds-panel mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-[20px] bg-slate-950 text-sm font-black text-white shadow-lg shadow-orange-500/20">
                        F
                    </div>
                    <div>
                        <p className="ds-kicker">FitLog</p>
                        <p className="ds-title text-lg font-bold">운동 대시보드</p>
                    </div>
                </div>

                <div className="hidden items-center gap-2 rounded-full border border-white/40 bg-white/35 p-1.5 shadow-inner shadow-white/40 md:flex">
                    <button
                        onClick={() => nav("/dashboard")}
                        className={`ds-nav-pill ${location.pathname === "/dashboard" ? "ds-nav-pill-active" : ""}`}
                    >
                        대시보드
                    </button>

                    <button
                        onClick={() => nav("/stats")}
                        className={`ds-nav-pill ${location.pathname === "/stats" ? "ds-nav-pill-active" : ""}`}
                    >
                        통계
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {me?.email && (
                        <div className="hidden text-right sm:block">
                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">계정</p>
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
