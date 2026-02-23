import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import { getDashboard } from "../api/dashboard";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import TopNav from "../components/layout/TopNav";
import VolumeByCategoryChart from "../components/stats/VolumeByCategoryChart";

export default function StatsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [weekStart, setWeekStart] = useState(getThisWeekMonday());


    useEffect(() => {
        (async () => {
            try {
                const res = await getDashboard(weekStart);
                setData(res);
            } finally {
                setLoading(false);
            }
        })();
    }, [weekStart]);


    if (loading) return <div className="p-6">로딩중...</div>;
    if (!data) return <div className="p-6">데이터 없음</div>;

    const { weeklyStats, exercisePrs, recentWorkouts } = data;

    const me = (() => {
        try { return JSON.parse(localStorage.getItem("me") || "null"); }
        catch { return null; }
    })();

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("me");
        window.location.href = "/login";
    };


    return (
        <div className="min-h-screen bg-slate-50">
            <TopNav me={me} onLogout={logout} />

            <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
                <Card className="p-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                    <div className="w-full sm:w-64">
                        <Input
                            label="주 시작일 (월요일)"
                            type="date"
                            value={weekStart}
                            onChange={(e) => setWeekStart(e.target.value)}
                        />
                        {!isMonday(weekStart) && (
                            <p className="mt-1 text-xs text-rose-600">
                                월요일 날짜를 선택해줘.
                            </p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => setWeekStart(shiftWeek(weekStart, -7))}>
                            지난 주
                        </Button>
                        <Button variant="ghost" onClick={() => setWeekStart(getThisWeekMonday())}>
                            이번 주
                        </Button>
                        <Button variant="ghost" onClick={() => setWeekStart(shiftWeek(weekStart, +7))}>
                            다음 주
                        </Button>
                    </div>
                </Card>

                {/* 주간 요약 */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard label="운동일" value={`${weeklyStats.workoutDays}일`} sub={`${weeklyStats.weekStart} ~ ${weeklyStats.weekEnd}`} />
                    <KpiCard label="운동횟수" value={`${weeklyStats.workoutCount}회`} />
                    <KpiCard label="총 세트" value={`${weeklyStats.setCount}`} />
                    <KpiCard label="총 볼륨" value={`${Number(weeklyStats.totalVolume).toLocaleString()}kg`} />
                </div>


                <Card className="p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">부위별 볼륨</h2>
                            <p className="text-sm text-slate-500">
                                {weeklyStats.weekStart} ~ {weeklyStats.weekEnd}
                            </p>
                        </div>
                        <span className="text-xs font-semibold text-slate-500">
                          단위: kg
                        </span>
                    </div>

                    <div className="mt-4">
                        <VolumeByCategoryChart data={weeklyStats.volumeByCategory} />
                    </div>
                </Card>


                {/* 카테고리별 볼륨 */}
                <Card className="p-5">
                    <h2 className="font-bold mb-3">부위별 볼륨</h2>

                    <div className="space-y-2">
                        {weeklyStats.volumeByCategory.map((c) => (
                            <div key={c.category} className="flex justify-between">
                                <span>{c.category}</span>
                                <span>{c.volume.toLocaleString()}kg</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* PR */}
                <Card className="p-5">
                    <h2 className="font-bold mb-3">🏆 개인 기록(PR)</h2>

                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b">
                            <th className="text-left py-2">운동</th>
                            <th className="text-right">최고 중량</th>
                        </tr>
                        </thead>
                        <tbody>
                        {exercisePrs.map((p) => (
                            <tr key={p.exerciseId} className="border-b">
                                <td className="py-2">{p.exerciseName}</td>
                                <td className="text-right font-semibold">
                                    {p.bestWeight}kg
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </Card>

                {/* 최근 운동 */}
                <Card className="p-5">
                    <h2 className="font-bold mb-3">최근 운동</h2>

                    <div className="space-y-3">
                        {recentWorkouts.map((w) => (
                            <div key={w.workoutId} className="border rounded-lg p-3">
                                <div className="flex justify-between text-sm">
                                    <span>{w.workoutDate}</span>
                                    <span>{w.totalVolume}kg</span>
                                </div>

                                {w.memo && (
                                    <p className="text-slate-600 text-sm mt-1">{w.memo}</p>
                                )}

                                <p className="text-xs text-slate-500 mt-1">
                                    {w.setCount}세트
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ title, value }) {
    return (
        <Card className="p-4 text-center">
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
        </Card>
    );
}

function getThisWeekMonday() {
    const now = new Date();
    const day = now.getDay(); // 0(일) ~ 6(토)

    // JS는 일요일이 0이라 계산 필요
    const diff = day === 0 ? -6 : 1 - day;

    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);

    return monday.toISOString().slice(0, 10); // "YYYY-MM-DD"
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
            <p className="text-sm text-slate-500">{label}</p>
            <div className="mt-2 flex items-end justify-between gap-3">
                <p className="text-3xl font-bold text-slate-900">{value}</p>
                {sub && <p className="text-xs font-semibold text-slate-500">{sub}</p>}
            </div>
        </Card>
    );
}
