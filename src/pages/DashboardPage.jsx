import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { http } from "../api/http";
import { listExercises } from "../api/exercises";
import { createWorkout } from "../api/workouts";
import { deleteWorkout, updateWorkout } from "../api/workouts";
import { useNavigate, useLocation } from "react-router-dom";
import TopNav from "../components/layout/TopNav";


export default function DashboardPage() {
    // ✅ me는 그냥 표시(상태 갱신 X)
    const [me] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("me") || "null");
        } catch {
            return null;
        }
    });

    const today = new Date().toISOString().slice(0, 10);
    const nav = useNavigate();
    const location = useLocation();

    // ✅ B안: 조회 날짜 / 등록 날짜 분리
    const [queryDate, setQueryDate] = useState(today);      // 조회용
    const [workoutDate, setWorkoutDate] = useState(today);  // 등록용

    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");

    // ✅ 운동 목록(Select)
    const [exercises, setExercises] = useState([]); // [{id, name, category}]
    const [memo, setMemo] = useState("");
    const [sets, setSets] = useState([{ exerciseId: "", weight: "", reps: "" }]);
    const [creating, setCreating] = useState(false);

    const [editingId, setEditingId] = useState(null);
    const [editWorkoutDate, setEditWorkoutDate] = useState(today);
    const [editMemo, setEditMemo] = useState("");
    const [editSets, setEditSets] = useState([{ exerciseId: "", weight: "", reps: "" }]);

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("me");
        window.location.href = "/login";
    };

    // 날짜를 파라미터로 받을 수 있게 (옵션2 구현 핵심)
    const fetchWorkouts = async (d = queryDate) => {
        setLoading(true);
        setErrorMsg("");
        try {
            const res = await http.get("/api/workouts", { params: { date: d } });
            setItems(res.data ?? []);
        } catch (e) {
            if (e?.response?.status === 401) {
                logout();
                return;
            }
            setErrorMsg("조회 실패. 서버가 켜져있는지 / 토큰이 유효한지 확인해줘.");
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchExercises = async () => {
        try {
            const data = await listExercises();
            setExercises(data ?? []);
        } catch (e) {
            console.error(e);
            setExercises([]);
        }
    };

    useEffect(() => {
        fetchExercises();
        fetchWorkouts(today);
        // eslint-disable-next-line
    }, []);

    // 세트 행 조작
    const addSetRow = () =>
        setSets((prev) => [...prev, { exerciseId: "", weight: "", reps: "" }]);

    const removeSetRow = (idx) =>
        setSets((prev) => prev.filter((_, i) => i !== idx));

    const updateSetRow = (idx, key, value) => {
        setSets((prev) =>
            prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row))
        );
    };

    const addEditSet = () =>
        setEditSets((prev) => [...prev, { exerciseId: "", weight: "", reps: "" }]);

    const removeEditSet = (idx) =>
        setEditSets((prev) => prev.filter((_, i) => i !== idx));

    const updateEditSet = (idx, key, value) => {
        setEditSets((prev) => prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)));
    };

    const onCreateWorkout = async () => {
        setErrorMsg("");

        // DTO 맞춤: workoutDate, sets[].setOrder 필수
        // - exerciseId/weight/reps는 Integer/Long NotNull이라 숫자 변환 필수
        const cleanedSets = sets
            .map((s, idx) => ({
                exerciseId: Number(s.exerciseId),
                weight: Number(s.weight),
                reps: Number(s.reps),
                setOrder: idx + 1, // ✅ 필수
            }))
            .filter(
                (s) =>
                    Number.isFinite(s.exerciseId) &&
                    s.exerciseId > 0 &&
                    Number.isFinite(s.weight) &&
                    Number.isFinite(s.reps)
            );

        if (cleanedSets.length < 1) {
            setErrorMsg("세트 기록은 최소 1개 이상이어야 합니다. (운동/무게/횟수 입력)");
            return;
        }

        setCreating(true);
        try {
            await createWorkout({
                workoutDate: workoutDate, // ✅ 등록 날짜 사용
                memo: memo.trim() || null,
                sets: cleanedSets,
            });

            // 입력값 초기화
            setMemo("");
            setSets([{ exerciseId: "", weight: "", reps: "" }]);

            // 옵션2: 등록하면 그 날짜로 조회 날짜 자동 이동 + 즉시 조회
            setQueryDate(workoutDate);
            await fetchWorkouts(workoutDate);
        } catch (e) {
            if (e?.response?.status === 401) {
                logout();
                return;
            }
            setErrorMsg("등록 실패. 입력값을 확인해줘.");
        } finally {
            setCreating(false);
        }
    };

    // 수정
    const startEdit = (w, workoutId) => {
        setEditingId(workoutId);
        setEditWorkoutDate(w.workoutDate ?? w.date ?? queryDate);
        setEditMemo(w.memo ?? "");

        const normalized = (w.sets ?? [])
            .slice()
            .sort((a, b) => (a.setOrder ?? 0) - (b.setOrder ?? 0))
            .map((s) => ({
                exerciseId: s.exerciseId ?? "",
                weight: String(s.weight ?? ""),
                reps: String(s.reps ?? ""),
            }));

        setEditSets(normalized.length ? normalized : [{ exerciseId: "", weight: "", reps: "" }]);
    };

    const saveEdit = async () => {
        setErrorMsg("");

        const cleanedSets = editSets
            .map((s, idx) => ({
                exerciseId: Number(s.exerciseId),
                weight: Number(s.weight),
                reps: Number(s.reps),
                setOrder: idx + 1, // ✅ 필수
            }))
            .filter(
                (s) =>
                    Number.isFinite(s.exerciseId) &&
                    s.exerciseId > 0 &&
                    Number.isFinite(s.weight) &&
                    Number.isFinite(s.reps)
            );

        if (cleanedSets.length < 1) {
            setErrorMsg("세트 기록은 최소 1개 이상이어야 합니다.");
            return;
        }

        try {
            await updateWorkout(editingId, {
                workoutDate: editWorkoutDate,
                memo: editMemo.trim() || null,
                sets: cleanedSets,
            });

            setEditingId(null);

            // 수정한 날짜로 자동 이동 + 즉시 조회(옵션2 유지)
            setQueryDate(editWorkoutDate);
            await fetchWorkouts(editWorkoutDate);
        } catch (e) {
            if (e?.response?.status === 401) logout();
            else setErrorMsg("수정 실패");
        }
    };

    // 삭제
    const onDelete = async (workoutId) => {
        if (!window.confirm("이 운동 기록을 삭제할까?")) return;

        try {
            await deleteWorkout(workoutId);
            await fetchWorkouts(queryDate); // 지금 보고 있는 날짜 갱신
        } catch (e) {
            if (e?.response?.status === 401) logout();
            else setErrorMsg("삭제 실패");
        }
    };



    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top bar */}
            <div className="min-h-screen bg-slate-50">
                <TopNav me={me} onLogout={logout} />

                {/* Content */}
                <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* 조회 카드 */}
                        <Card className="p-6 md:col-span-1">
                            <h2 className="text-lg font-bold text-slate-900">날짜별 운동 기록 조회</h2>
                            <p className="mt-1 text-sm text-slate-600">조회 날짜를 선택하고 기록을 확인해.</p>

                            <div className="mt-4 space-y-3">
                                <Input
                                    label="조회 날짜"
                                    type="date"
                                    value={queryDate}
                                    onChange={(e) => setQueryDate(e.target.value)}
                                />
                                <Button className="w-full" onClick={() => fetchWorkouts(queryDate)} disabled={loading}>
                                    {loading ? "조회 중..." : "조회"}
                                </Button>

                                {errorMsg && (
                                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                                        {errorMsg}
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* 등록 카드 */}
                        <Card className="p-6 md:col-span-1">
                            <h2 className="text-lg font-bold text-slate-900">운동 기록 추가</h2>
                            <p className="mt-1 text-sm text-slate-600">운동 날짜를 선택하고 세트를 저장해.</p>

                            <div className="mt-4 space-y-3">
                                <Input
                                    label="운동 날짜"
                                    type="date"
                                    value={workoutDate}
                                    onChange={(e) => setWorkoutDate(e.target.value)}
                                />

                                <Input
                                    label="메모"
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                    placeholder="예: 하체 / 컨디션 좋음"
                                />

                                <div className="space-y-3">
                                    {sets.map((s, idx) => (
                                        <div key={idx} className="rounded-xl border p-3 space-y-2">
                                            <div className="space-y-1">
                                                <label className="text-sm font-semibold text-slate-700">운동</label>
                                                <select
                                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
                                                    value={s.exerciseId}
                                                    onChange={(e) => updateSetRow(idx, "exerciseId", e.target.value)}
                                                >
                                                    <option value="">운동 선택</option>
                                                    {exercises.map((ex) => (
                                                        <option key={ex.id} value={ex.id}>
                                                            {ex.name}{ex.category ? ` (${ex.category})` : ""}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <Input
                                                    label="무게(kg)"
                                                    value={s.weight}
                                                    onChange={(e) => updateSetRow(idx, "weight", e.target.value)}
                                                    placeholder="예: 80"
                                                />
                                                <Input
                                                    label="횟수(reps)"
                                                    value={s.reps}
                                                    onChange={(e) => updateSetRow(idx, "reps", e.target.value)}
                                                    placeholder="예: 8"
                                                />
                                            </div>

                                            {sets.length > 1 && (
                                                <Button variant="ghost" onClick={() => removeSetRow(idx)}>
                                                    이 세트 삭제
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <Button variant="ghost" onClick={addSetRow}>
                                    + 세트 추가
                                </Button>

                                <Button className="w-full" onClick={onCreateWorkout} disabled={creating}>
                                    {creating ? "저장 중..." : "저장"}
                                </Button>
                            </div>
                        </Card>

                        {/* 결과 카드 */}
                        <div className="md:col-span-1 space-y-4">
                            <div className="flex items-end justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">결과</h2>
                                    <p className="text-sm text-slate-600">{items.length}개 기록</p>
                                </div>
                            </div>

                            {items.length === 0 ? (
                                <Card className="p-6">
                                    <p className="text-sm text-slate-600">
                                        해당 날짜에 기록이 없어. 다른 날짜로 조회해봐.
                                    </p>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {items.map((w, idx) => {
                                        const workoutId = w.id ?? w.workoutId;
                                        return (
                                            <Card key={workoutId ?? idx} className="p-5">

                                                {/* ===== 수정 모드 ===== */}
                                                {editingId === workoutId ? (

                                                    <div className="space-y-4">

                                                        <Input
                                                            label="운동 날짜"
                                                            type="date"
                                                            value={editWorkoutDate}
                                                            onChange={(e) => setEditWorkoutDate(e.target.value)}
                                                        />

                                                        <Input
                                                            label="메모"
                                                            value={editMemo}
                                                            onChange={(e) => setEditMemo(e.target.value)}
                                                            placeholder="메모"
                                                        />

                                                        {editSets.map((s, i) => (
                                                            <div key={i} className="rounded-xl border p-3 space-y-2">

                                                                <div className="space-y-1">
                                                                    <label
                                                                        className="text-sm font-semibold text-slate-700">운동</label>
                                                                    <select
                                                                        className="w-full rounded-xl border border-slate-200 px-3 py-2"
                                                                        value={s.exerciseId}
                                                                        onChange={(e) => updateEditSet(i, "exerciseId", e.target.value)}
                                                                    >
                                                                        <option value="">운동 선택</option>
                                                                        {exercises.map((ex) => (
                                                                            <option key={ex.id} value={ex.id}>
                                                                                {ex.name}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <Input
                                                                        label="무게(kg)"
                                                                        value={s.weight}
                                                                        onChange={(e) => updateEditSet(i, "weight", e.target.value)}
                                                                    />
                                                                    <Input
                                                                        label="횟수"
                                                                        value={s.reps}
                                                                        onChange={(e) => updateEditSet(i, "reps", e.target.value)}
                                                                    />
                                                                </div>

                                                                {editSets.length > 1 && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        onClick={() => removeEditSet(i)}
                                                                    >
                                                                        이 세트 삭제
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        ))}

                                                        <Button variant="ghost" onClick={addEditSet}>
                                                            + 세트 추가
                                                        </Button>

                                                        <div className="flex gap-2 pt-2">
                                                            <Button className="w-full" onClick={saveEdit}>
                                                                저장
                                                            </Button>
                                                            <Button
                                                                className="w-full"
                                                                variant="ghost"
                                                                onClick={() => setEditingId(null)}
                                                            >
                                                                취소
                                                            </Button>
                                                        </div>

                                                    </div>

                                                ) : (

                                                    /* ===== 보기 모드 ===== */
                                                    <>

                                                        <div className="flex items-start justify-between gap-3">

                                                            <div>
                                                                <p className="text-sm text-slate-500">날짜</p>
                                                                <p className="font-semibold text-slate-900">
                                                                    {w.workoutDate ?? w.date ?? queryDate}
                                                                </p>
                                                            </div>

                                                            <div className="flex items-center gap-2">
                                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                                                  Workout
                                                                </span>

                                                                <Button variant="ghost" onClick={() => startEdit(w, workoutId)}>
                                                                    수정
                                                                </Button>
                                                                <Button variant="ghost" onClick={() => onDelete(workoutId)}>
                                                                    삭제
                                                                </Button>
                                                            </div>

                                                        </div>

                                                        {w.memo && (
                                                            <div className="mt-3 text-sm text-slate-700">
                                                                <span className="font-semibold">메모:</span> {w.memo}
                                                            </div>
                                                        )}

                                                        <div className="mt-4">
                                                            <p className="text-sm font-semibold text-slate-900">세트</p>

                                                            <ul className="mt-2 space-y-1 text-sm text-slate-700 list-disc pl-5">
                                                                {(w.sets ?? [])
                                                                    .slice()
                                                                    .sort((a, b) => (a.setOrder ?? 0) - (b.setOrder ?? 0))
                                                                    .map((s, i) => (
                                                                        <li key={s.id ?? i}>
                                                                            {s.exerciseName ?? `exerciseId:${s.exerciseId}`} / {s.weight}kg
                                                                            × {s.reps}회
                                                                        </li>
                                                                    ))}
                                                            </ul>

                                                        </div>

                                                    </>
                                                )}
                                            </Card>
                                        );
                                    })}

                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
