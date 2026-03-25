import { useLocation, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useTheme } from "../../theme/ThemeProvider.jsx";

function SunIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2.5v2.5M12 19v2.5M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2.5 12H5M19 12h2.5M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
        </svg>
    );
}

function MoonIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <path d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8a8.5 8.5 0 1 0 11.3 11.3Z" />
        </svg>
    );
}

export default function TopNav({ me, onLogout }) {
    const nav = useNavigate();
    const location = useLocation();
    const { isDark, toggleTheme } = useTheme();

    return (
        <div className="sticky top-0 z-20 px-4 pt-3">
            <div className="ds-glass ds-panel mx-auto flex w-full max-w-[1212px] items-center justify-between gap-3 px-4 py-2.5 sm:px-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-[16px] bg-slate-950 text-xs font-black text-white shadow-lg shadow-orange-500/20">
                        F
                    </div>
                    <div className="leading-tight">
                        <p className="ds-kicker">FitLog</p>
                        <p className="ds-title text-base font-bold">운동 대시보드</p>
                    </div>
                </div>

                <div className="ds-nav-group hidden md:flex">
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

                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        className="ds-theme-toggle"
                        onClick={toggleTheme}
                        aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
                        title={isDark ? "라이트 모드" : "다크 모드"}
                    >
                        <span className={`ds-theme-toggle-item ${!isDark ? "is-active" : ""}`}>
                            <SunIcon />
                        </span>
                        <span className={`ds-theme-toggle-item ${isDark ? "is-active" : ""}`}>
                            <MoonIcon />
                        </span>
                    </button>

                    {me?.email && (
                        <div className="hidden text-right sm:block">
                            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">계정</p>
                            <p className="text-sm font-semibold leading-tight text-slate-900">{me.email}</p>
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
