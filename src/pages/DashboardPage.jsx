import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import {http} from "../api/http"; // 너가 만든 axios 인스턴스

export default function DashboardPage() {
    const [me] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("me") || "null");
        } catch {
            return null;
        }
    });

    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("me");
        window.location.href = "/login";
    };


    const fetchWorkouts = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            // 네가 말한 엔드포인트 형태: /api/workouts?date=...
            const res = await http.get(`/api/workouts`, { params: { date } });
            setItems(res.data ?? []);
            // eslint-disable-next-line no-unused-vars
        } catch (e) {
            if (e?.response?.status === 401) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("me");
                window.location.href = "/login";
                return;
            }
            setErrorMsg("조회 실패. 서버가 켜져있는지 / 토큰이 유효한지 확인해줘.");
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkouts();
    }, [date]);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top bar */}
            <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
                            F
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">FitLog</p>
                            <p className="text-xs text-slate-500">Dashboard</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {me?.email && (
                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-semibold text-slate-900">{me.email}</p>
                                <p className="text-xs text-slate-500">userId: {me.userId}</p>
                            </div>
                        )}
                        <Button variant="ghost" onClick={logout}>
                            로그아웃
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Query */}
                    <Card className="p-6 md:col-span-1">
                        <h2 className="text-lg font-bold text-slate-900">날짜별 운동 기록</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            날짜를 선택하고 기록을 조회해.
                        </p>

                        <div className="mt-4 space-y-3">
                            <Input
                                label="날짜"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                            <Button className="w-full" onClick={fetchWorkouts} disabled={loading}>
                                {loading ? "조회 중..." : "조회"}
                            </Button>

                            {errorMsg && (
                                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                    {errorMsg}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* List */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-end justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">결과</h2>
                                <p className="text-sm text-slate-600">
                                    {items.length}개 기록
                                </p>
                            </div>
                        </div>

                        {items.length === 0 ? (
                            <Card className="p-6">
                                <p className="text-sm text-slate-600">
                                    해당 날짜에 기록이 없어. 다른 날짜로 조회해봐.
                                </p>
                            </Card>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {items.map((w, idx) => (
                                    <Card key={w.id ?? idx} className="p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm text-slate-500">날짜</p>
                                                <p className="font-semibold text-slate-900">
                                                    {w.date ?? date}
                                                </p>
                                            </div>
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        Workout
                      </span>
                                        </div>

                                        {w.memo && (
                                            <div className="mt-3 text-sm text-slate-700">
                                                <span className="font-semibold">메모:</span> {w.memo}
                                            </div>
                                        )}

                                        <div className="mt-4">
                                            <p className="text-sm font-semibold text-slate-900">세트</p>
                                            <ul className="mt-2 space-y-1 text-sm text-slate-700 list-disc pl-5">
                                                {(w.sets ?? []).map((s, i) => (
                                                    <li key={s.id ?? i}>
                                                        {s.exerciseName} / {s.weight}kg × {s.reps}회
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
