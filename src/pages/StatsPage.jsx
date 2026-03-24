import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import { getDashboard } from "../api/dashboard";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import TopNav from "../components/layout/TopNav";
import VolumeByCategoryChart from "../components/stats/VolumeByCategoryChart";
import WeeklyTrendChart from "../components/stats/WeeklyTrendChart";
import ExercisePrChart from "../components/stats/ExercisePrChart";

export default function StatsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [weekStart, setWeekStart] = useState(getThisWeekMonday());

    useEffect(() => {
        let mounted = true;

        (async () => {
            setLoading(true);
            try {
                const res = await getDashboard(weekStart);
                if (mounted) {
                    setData(res);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        })();

        return () => {
            mounted = false;
        };
    }, [weekStart]);

    const me = (() => {
        try {
            return JSON.parse(localStorage.getItem("me") || "null");
        } catch {
            return null;
        }
    })();

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("me");
        window.location.href = "/login";
    };

    if (loading) {
        return (
            <div className="ds-app-shell">
                <TopNav me={me} onLogout={logout} />
                <div className="ds-page-wrap">
                    <Card className="p-6 text-sm text-slate-600">통계 데이터를 불러오는 중입니다.</Card>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="ds-app-shell">
                <TopNav me={me} onLogout={logout} />
                <div className="ds-page-wrap">
                    <Card className="p-6 text-sm text-slate-600">표시할 통계 데이터가 없습니다.</Card>
                </div>
            </div>
        );
    }

    const { weeklyStats, exercisePrs, recentWorkouts } = data;

    return (
        <div className="ds-app-shell">
            <TopNav me={me} onLogout={logout} />

            <div className="ds-page-wrap space-y-6">
                <section className="ds-glass ds-panel p-5 sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="ds-kicker">Stats Center</p>
                            <h1 className="ds-title mt-3 text-3xl font-bold">주간 퍼포먼스 분석</h1>
                            <p className="mt-2 text-sm text-slate-600">
                                선택한 주차의 운동 빈도, 총 볼륨, 개인 기록을 한 번에 확인합니다.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <div className="w-full sm:w-64">
                                <Input
                                    label="주 시작일"
                                    type="date"
                                    value={weekStart}
                                    onChange={(e) => setWeekStart(e.target.value)}
                                />
                                {!isMonday(weekStart) && (
                                    <p className="mt-2 text-xs text-rose-600">
                                        월요일 날짜를 선택하면 주간 기준이 정확해집니다.
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={() => setWeekStart(shiftWeek(weekStart, -7))}>
                                    이전 주
                                </Button>
                                <Button variant="ghost" onClick={() => setWeekStart(getThisWeekMonday())}>
                                    이번 주
                                </Button>
                                <Button variant="ghost" onClick={() => setWeekStart(shiftWeek(weekStart, 7))}>
                                    다음 주
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <KpiCard label="운동한 날" value={`${weeklyStats.workoutDays}일`} sub={`${weeklyStats.weekStart} ~ ${weeklyStats.weekEnd}`} />
                    <KpiCard label="운동 횟수" value={`${weeklyStats.workoutCount}회`} />
                    <KpiCard label="총 세트" value={`${weeklyStats.setCount}세트`} />
                    <KpiCard label="총 볼륨" value={`${Number(weeklyStats.totalVolume).toLocaleString()}kg`} />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="ds-kicker">Weekly Trend</p>
                                <h2 className="ds-title mt-2 text-2xl font-bold">주간 볼륨 추이</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {weeklyStats.weekStart} ~ {weeklyStats.weekEnd}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <WeeklyTrendChart data={data.dailyVolume} />
                        </div>
                    </Card>

                    <Card className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="ds-kicker">Distribution</p>
                                <h2 className="ds-title mt-2 text-2xl font-bold">부위별 볼륨</h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {weeklyStats.weekStart} ~ {weeklyStats.weekEnd}
                                </p>
                            </div>
                            <span className="ds-badge">단위 kg</span>
                        </div>
                        <div className="mt-4">
                            <VolumeByCategoryChart data={weeklyStats.volumeByCategory} />
                        </div>
                    </Card>
                </div>

                <Card className="p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="ds-kicker">Breakdown</p>
                            <h2 className="ds-title mt-2 text-2xl font-bold">카테고리 상세 볼륨</h2>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                        {weeklyStats.volumeByCategory.map((c) => (
                            <div key={c.category} className="ds-panel-soft flex items-center justify-between px-4 py-4">
                                <span className="font-medium text-slate-700">{c.category}</span>
                                <span className="text-sm font-semibold text-slate-950">{c.volume.toLocaleString()}kg</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="p-5">
                        <div>
                            <p className="ds-kicker">Personal Record</p>
                            <h2 className="ds-title mt-2 text-2xl font-bold">개인 기록</h2>
                            <p className="mt-1 text-sm text-slate-500">종목별 최고 중량 기준</p>
                        </div>
                        <div className="mt-4">
                            <ExercisePrChart data={exercisePrs} />
                        </div>
                    </Card>

                    <Card className="p-5">
                        <div>
                            <p className="ds-kicker">Recent</p>
                            <h2 className="ds-title mt-2 text-2xl font-bold">최근 운동</h2>
                        </div>

                        <div className="mt-4 space-y-3">
                            {recentWorkouts.map((w) => (
                                <div key={w.workoutId} className="ds-panel-soft p-4">
                                    <div className="flex items-center justify-between gap-3 text-sm">
                                        <span className="font-semibold text-slate-900">{w.workoutDate}</span>
                                        <span className="text-slate-600">{w.totalVolume}kg</span>
                                    </div>

                                    {w.memo && (
                                        <p className="mt-2 text-sm text-slate-600">{w.memo}</p>
                                    )}

                                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        {w.setCount} sets
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function getThisWeekMonday() {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    return monday.toISOString().slice(0, 10);
}

function isMonday(dateStr) {
    return new Date(dateStr).getDay() === 1;
}

function shiftWeek(dateStr, days) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}

function KpiCard({ label, value, sub }) {
    return (
        <Card className="p-5">
            <p className="ds-kicker">{label}</p>
            <div className="mt-3 flex items-end justify-between gap-3">
                <p className="ds-title text-3xl font-bold">{value}</p>
                {sub && <p className="text-xs font-semibold text-slate-500">{sub}</p>}
            </div>
        </Card>
    );
}
