import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import TopNav from "../components/layout/TopNav";
import { http } from "../api/http";
import { listExercises } from "../api/exercises";
import { createWorkout, deleteWorkout, getWorkoutDates, updateWorkout } from "../api/workouts";
import {
    createWorkoutTemplate,
    deleteWorkoutTemplate,
    listWorkoutTemplates,
} from "../api/workoutTemplates";

function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function createEmptySetRow() {
    return { exerciseId: "", weight: "", reps: "" };
}

function normalizeSets(rows) {
    return rows
        .map((s, idx) => ({
            exerciseId: Number(s.exerciseId),
            weight: Number(s.weight),
            reps: Number(s.reps),
            setOrder: idx + 1,
        }))
        .filter(
            (s) =>
                Number.isFinite(s.exerciseId) &&
                s.exerciseId > 0 &&
                Number.isFinite(s.weight) &&
                Number.isFinite(s.reps)
        );
}

function mapRowsFromSets(sets = []) {
    const rows = sets
        .slice()
        .sort((a, b) => (a.setOrder ?? 0) - (b.setOrder ?? 0))
        .map((s) => ({
            exerciseId: String(s.exerciseId ?? ""),
            weight: String(s.weight ?? ""),
            reps: String(s.reps ?? ""),
        }));

    return rows.length ? rows : [createEmptySetRow()];
}

export default function DashboardPage() {
    const [me] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("me") || "null");
        } catch {
            return null;
        }
    });

    const today = new Date().toISOString().slice(0, 10);
    const [queryDate, setQueryDate] = useState(today);
    const [workoutDate, setWorkoutDate] = useState(today);
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [markedDates, setMarkedDates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [exercises, setExercises] = useState([]);
    const [memo, setMemo] = useState("");
    const [sets, setSets] = useState([createEmptySetRow()]);
    const [creating, setCreating] = useState(false);

    const [templates, setTemplates] = useState([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [templateSaving, setTemplateSaving] = useState(false);
    const [templateName, setTemplateName] = useState("");
    const [templateError, setTemplateError] = useState("");
    const [templateNotice, setTemplateNotice] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [editWorkoutDate, setEditWorkoutDate] = useState(today);
    const [editMemo, setEditMemo] = useState("");
    const [editSets, setEditSets] = useState([createEmptySetRow()]);

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("me");
        window.location.href = "/login";
    };

    const fetchWorkoutDates = async (dateObj) => {
        try {
            const year = dateObj.getFullYear();
            const month = dateObj.getMonth() + 1;
            const data = await getWorkoutDates(year, month);
            setMarkedDates(data);
        } catch (e) {
            console.error("Failed to load workout dates", e);
            setMarkedDates([]);
        }
    };

    const fetchWorkouts = async (date = queryDate) => {
        setLoading(true);
        setErrorMsg("");

        try {
            const res = await http.get("/api/workouts", { params: { date } });
            setItems(res.data ?? []);
        } catch (e) {
            if (e?.response?.status === 401) {
                logout();
                return;
            }
            setErrorMsg("운동 기록을 불러오지 못했습니다. 서버 상태와 로그인 세션을 확인해주세요.");
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

    const fetchTemplates = async () => {
        setTemplatesLoading(true);
        setTemplateError("");

        try {
            const data = await listWorkoutTemplates();
            setTemplates(data ?? []);
        } catch (e) {
            if (e?.response?.status === 401) {
                logout();
                return;
            }
            setTemplateError("운동 템플릿을 불러오지 못했습니다.");
            setTemplates([]);
        } finally {
            setTemplatesLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkoutDates(calendarDate);
    }, [calendarDate]);

    useEffect(() => {
        fetchExercises();
        fetchWorkouts(today);
        fetchTemplates();
    }, []);

    const handleCalendarChange = async (value) => {
        const selected = Array.isArray(value) ? value[0] : value;
        const formatted = formatLocalDate(selected);
        setQueryDate(formatted);
        await fetchWorkouts(formatted);
    };

    const handleActiveStartDateChange = ({ activeStartDate, view }) => {
        if (view === "month" && activeStartDate) {
            setCalendarDate(activeStartDate);
        }
    };

    const addSetRow = () => setSets((prev) => [...prev, createEmptySetRow()]);
    const removeSetRow = (idx) => setSets((prev) => prev.filter((_, i) => i !== idx));
    const updateSetRow = (idx, key, value) => {
        setSets((prev) => prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)));
    };

    const addEditSet = () => setEditSets((prev) => [...prev, createEmptySetRow()]);
    const removeEditSet = (idx) => setEditSets((prev) => prev.filter((_, i) => i !== idx));
    const updateEditSet = (idx, key, value) => {
        setEditSets((prev) => prev.map((row, i) => (i === idx ? { ...row, [key]: value } : row)));
    };

    const applyTemplate = (template) => {
        setMemo(template.memo ?? "");
        setSets(mapRowsFromSets(template.sets));
        setTemplateError("");
        setTemplateNotice(`"${template.name}" 템플릿을 적용했습니다.`);
    };

    const onSaveTemplate = async () => {
        setTemplateError("");
        setTemplateNotice("");

        const cleanedSets = normalizeSets(sets);
        if (!templateName.trim()) {
            setTemplateError("템플릿 이름을 입력해주세요.");
            return;
        }

        if (cleanedSets.length < 1) {
            setTemplateError("유효한 세트를 1개 이상 입력한 뒤 템플릿을 저장해주세요.");
            return;
        }

        setTemplateSaving(true);
        try {
            await createWorkoutTemplate({
                name: templateName.trim(),
                memo: memo.trim() || null,
                sets: cleanedSets,
            });

            setTemplateName("");
            setTemplateNotice("운동 템플릿을 저장했습니다.");
            await fetchTemplates();
        } catch (e) {
            if (e?.response?.status === 401) {
                logout();
                return;
            }
            setTemplateError("운동 템플릿 저장에 실패했습니다.");
        } finally {
            setTemplateSaving(false);
        }
    };

    const onDeleteTemplate = async (templateId) => {
        if (!window.confirm("이 운동 템플릿을 삭제할까요?")) {
            return;
        }

        try {
            await deleteWorkoutTemplate(templateId);
            setTemplateNotice("운동 템플릿을 삭제했습니다.");
            await fetchTemplates();
        } catch (e) {
            if (e?.response?.status === 401) {
                logout();
                return;
            }
            setTemplateError("운동 템플릿 삭제에 실패했습니다.");
        }
    };

    const onCreateWorkout = async () => {
        setErrorMsg("");

        const cleanedSets = normalizeSets(sets);
        if (cleanedSets.length < 1) {
            setErrorMsg("운동을 저장하려면 유효한 세트를 1개 이상 입력해주세요.");
            return;
        }

        setCreating(true);
        try {
            await createWorkout({
                workoutDate,
                memo: memo.trim() || null,
                sets: cleanedSets,
            });

            setMemo("");
            setSets([createEmptySetRow()]);
            setQueryDate(workoutDate);
            await fetchWorkouts(workoutDate);
            await fetchWorkoutDates(calendarDate);
        } catch (e) {
            if (e?.response?.status === 401) {
                logout();
                return;
            }
            setErrorMsg("운동 기록 저장에 실패했습니다.");
        } finally {
            setCreating(false);
        }
    };

    const startEdit = (workout, workoutId) => {
        setEditingId(workoutId);
        setEditWorkoutDate(workout.workoutDate ?? workout.date ?? queryDate);
        setEditMemo(workout.memo ?? "");
        setEditSets(mapRowsFromSets(workout.sets));
    };

    const saveEdit = async () => {
        setErrorMsg("");

        const cleanedSets = normalizeSets(editSets);
        if (cleanedSets.length < 1) {
            setErrorMsg("운동을 수정하려면 유효한 세트를 1개 이상 입력해주세요.");
            return;
        }

        try {
            await updateWorkout(editingId, {
                workoutDate: editWorkoutDate,
                memo: editMemo.trim() || null,
                sets: cleanedSets,
            });

            setEditingId(null);
            setQueryDate(editWorkoutDate);
            await fetchWorkouts(editWorkoutDate);
            await fetchWorkoutDates(calendarDate);
        } catch (e) {
            if (e?.response?.status === 401) {
                logout();
            } else {
                setErrorMsg("운동 기록 수정에 실패했습니다.");
            }
        }
    };

    const onDelete = async (workoutId) => {
        if (!window.confirm("이 운동 기록을 삭제할까요?")) {
            return;
        }

        try {
            await deleteWorkout(workoutId);
            await fetchWorkouts(queryDate);
            await fetchWorkoutDates(calendarDate);
        } catch (e) {
            if (e?.response?.status === 401) {
                logout();
            } else {
                setErrorMsg("운동 기록 삭제에 실패했습니다.");
            }
        }
    };

    return (
        <div className="ds-app-shell">
            <TopNav me={me} onLogout={logout} />

            <div className="ds-page-wrap space-y-6">
                <section className="ds-glass ds-panel p-6 sm:p-7">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="ds-kicker">Workout Console</p>
                            <h1 className="ds-title mt-3 text-3xl font-bold">일일 운동 기록 관리</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                캘린더 조회, 템플릿 적용, 세트 입력, 운동 기록 관리를 한 화면에서 처리할 수 있습니다.
                            </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <MetricBadge label="조회 날짜" value={queryDate} />
                            <MetricBadge label="기록 수" value={`${items.length}건`} />
                            <MetricBadge label="템플릿" value={`${templates.length}개`} />
                        </div>
                    </div>
                </section>

                {errorMsg && <div className="ds-alert px-4 py-3 text-sm">{errorMsg}</div>}

                <div className="grid gap-6 xl:grid-cols-[0.9fr_1.15fr_1.05fr]">
                    <Card className="p-5">
                        <p className="ds-kicker">Calendar</p>
                        <h2 className="ds-title mt-2 text-2xl font-bold">운동 기록 조회</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            운동 기록이 있는 날짜는 캘린더에 표시됩니다.
                        </p>

                        <div className="ds-calendar-shell mt-5">
                            <Calendar
                                locale="ko-KR"
                                value={new Date(queryDate)}
                                onChange={handleCalendarChange}
                                onActiveStartDateChange={handleActiveStartDateChange}
                                formatDay={(locale, date) => String(date.getDate())}
                                tileContent={({ date, view }) => {
                                    if (view !== "month") {
                                        return null;
                                    }

                                    const dateStr = formatLocalDate(date);
                                    if (!markedDates.includes(dateStr)) {
                                        return null;
                                    }

                                    return (
                                        <div className="mt-1 flex justify-center">
                                            <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                                        </div>
                                    );
                                }}
                            />
                        </div>

                        <div className="ds-panel-soft mt-4 px-4 py-3 text-sm">
                            선택한 날짜
                            <span className="ml-2 font-semibold text-slate-950">{queryDate}</span>
                        </div>
                    </Card>

                    <Card className="p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="ds-kicker">Templates</p>
                                <h2 className="ds-title mt-2 text-2xl font-bold">운동 템플릿</h2>
                                <p className="mt-2 text-sm text-slate-600">
                                    현재 입력 중인 운동 구성을 템플릿으로 저장하고 다시 불러올 수 있습니다.
                                </p>
                            </div>
                            <span className="ds-badge">연동형</span>
                        </div>

                        <div className="mt-5 space-y-4">
                            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                                <Input
                                    label="템플릿 이름"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    placeholder="예: 상체 A 루틴"
                                />
                                <Button
                                    className="self-end justify-center"
                                    onClick={onSaveTemplate}
                                    disabled={templateSaving}
                                >
                                    {templateSaving ? "저장 중..." : "템플릿 저장"}
                                </Button>
                            </div>

                            {templateError && <div className="ds-alert px-4 py-3 text-sm">{templateError}</div>}
                            {templateNotice && <div className="ds-success px-4 py-3 text-sm">{templateNotice}</div>}

                            <div className="space-y-3">
                                {templatesLoading ? (
                                    <div className="ds-panel-soft px-4 py-4 text-sm text-slate-600">
                                        템플릿을 불러오는 중입니다...
                                    </div>
                                ) : templates.length === 0 ? (
                                    <div className="ds-panel-soft px-4 py-4 text-sm text-slate-600">
                                        저장된 템플릿이 없습니다. 현재 폼으로 첫 템플릿을 만들어보세요.
                                    </div>
                                ) : (
                                    templates.map((template) => (
                                        <TemplateCard
                                            key={template.id}
                                            template={template}
                                            exercises={exercises}
                                            onApply={applyTemplate}
                                            onDelete={onDeleteTemplate}
                                        />
                                    ))
                                )}
                            </div>

                            <div className="border-t border-white/40 pt-2" />

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
                                placeholder="운동 메모를 입력하세요"
                            />

                            <div className="space-y-3">
                                {sets.map((row, idx) => (
                                    <SetEditor
                                        key={idx}
                                        exercises={exercises}
                                        row={row}
                                        index={idx}
                                        onChange={updateSetRow}
                                        onRemove={removeSetRow}
                                        removable={sets.length > 1}
                                    />
                                ))}
                            </div>

                            <Button variant="ghost" className="w-full justify-center" onClick={addSetRow}>
                                + 세트 추가
                            </Button>

                            <Button className="w-full justify-center" onClick={onCreateWorkout} disabled={creating}>
                                {creating ? "저장 중..." : "운동 저장"}
                            </Button>
                        </div>
                    </Card>

                    <div className="space-y-4">
                        <div>
                            <p className="ds-kicker">Results</p>
                            <h2 className="ds-title mt-2 text-2xl font-bold">운동 기록 목록</h2>
                            <p className="mt-1 text-sm text-slate-500">선택한 날짜의 기록 {items.length}건</p>
                        </div>

                        {items.length === 0 ? (
                            <Card className="p-6">
                                <p className="text-sm leading-6 text-slate-600">
                                    선택한 날짜에는 운동 기록이 없습니다.
                                </p>
                            </Card>
                        ) : (
                            items.map((workout, idx) => {
                                const workoutId = workout.id ?? workout.workoutId;

                                return (
                                    <Card key={workoutId ?? idx} className="p-5">
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
                                                    placeholder="운동 메모를 입력하세요"
                                                />

                                                {editSets.map((row, i) => (
                                                    <SetEditor
                                                        key={i}
                                                        exercises={exercises}
                                                        row={row}
                                                        index={i}
                                                        onChange={updateEditSet}
                                                        onRemove={removeEditSet}
                                                        removable={editSets.length > 1}
                                                    />
                                                ))}

                                                <Button variant="ghost" className="w-full justify-center" onClick={addEditSet}>
                                                    + 세트 추가
                                                </Button>

                                                <div className="flex gap-2">
                                                    <Button className="w-full justify-center" onClick={saveEdit}>
                                                        저장
                                                    </Button>
                                                    <Button
                                                        className="w-full justify-center"
                                                        variant="ghost"
                                                        onClick={() => setEditingId(null)}
                                                    >
                                                        취소
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                            운동 날짜
                                                        </p>
                                                        <p className="mt-2 text-lg font-semibold text-slate-950">
                                                            {workout.workoutDate ?? workout.date ?? queryDate}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-wrap items-center justify-end gap-2">
                                                        <span className="ds-badge">운동</span>
                                                        <Button variant="ghost" onClick={() => startEdit(workout, workoutId)}>
                                                            수정
                                                        </Button>
                                                        <Button variant="danger" onClick={() => onDelete(workoutId)}>
                                                            삭제
                                                        </Button>
                                                    </div>
                                                </div>

                                                {workout.memo && (
                                                    <div className="ds-panel-soft mt-4 px-4 py-3 text-sm leading-6 text-slate-700">
                                                        {workout.memo}
                                                    </div>
                                                )}

                                                <div className="mt-4">
                                                    <p className="text-sm font-semibold text-slate-900">세트 구성</p>
                                                    <ul className="mt-3 space-y-2">
                                                        {(workout.sets ?? [])
                                                            .slice()
                                                            .sort((a, b) => (a.setOrder ?? 0) - (b.setOrder ?? 0))
                                                            .map((set, i) => (
                                                                <li key={set.id ?? i} className="ds-panel-soft px-4 py-3 text-sm text-slate-700">
                                                                    <span className="font-semibold text-slate-900">
                                                                        {set.exerciseName ?? `exerciseId:${set.exerciseId}`}
                                                                    </span>
                                                                    <span className="mx-2 text-slate-300">/</span>
                                                                    {set.weight}kg x {set.reps}
                                                                </li>
                                                            ))}
                                                    </ul>
                                                </div>
                                            </>
                                        )}
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricBadge({ label, value }) {
    return (
        <div className="ds-panel-soft px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
            <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
        </div>
    );
}

function TemplateCard({ template, exercises, onApply, onDelete }) {
    const getExerciseName = (exerciseId) => {
        const match = exercises.find((item) => String(item.id) === String(exerciseId));
        return match?.name ?? `exerciseId:${exerciseId}`;
    };

    return (
        <div className="ds-panel-soft p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-slate-950">{template.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                        세트 {(template.sets ?? []).length}개
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => onApply(template)}>
                        적용
                    </Button>
                    <Button variant="danger" onClick={() => onDelete(template.id)}>
                        삭제
                    </Button>
                </div>
            </div>

            {template.memo && (
                <p className="mt-3 text-sm leading-6 text-slate-600">{template.memo}</p>
            )}

            <ul className="mt-3 space-y-2">
                {(template.sets ?? [])
                    .slice()
                    .sort((a, b) => (a.setOrder ?? 0) - (b.setOrder ?? 0))
                    .map((set, idx) => (
                        <li key={idx} className="rounded-2xl bg-white/70 px-3 py-2 text-sm text-slate-700">
                            <span className="font-semibold text-slate-900">{getExerciseName(set.exerciseId)}</span>
                            <span className="mx-2 text-slate-300">/</span>
                            {set.weight}kg x {set.reps}
                        </li>
                    ))}
            </ul>
        </div>
    );
}

function SetEditor({ exercises, row, index, onChange, onRemove, removable }) {
    return (
        <div className="ds-panel-soft space-y-3 p-4">
            <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">운동</label>
                <select
                    className="ds-select text-sm"
                    value={row.exerciseId}
                    onChange={(e) => onChange(index, "exerciseId", e.target.value)}
                >
                    <option value="">운동을 선택하세요</option>
                    {exercises.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                            {ex.name}{ex.category ? ` (${ex.category})` : ""}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Input
                    label="무게(kg)"
                    value={row.weight}
                    onChange={(e) => onChange(index, "weight", e.target.value)}
                    placeholder="예: 80"
                />
                <Input
                    label="횟수(reps)"
                    value={row.reps}
                    onChange={(e) => onChange(index, "reps", e.target.value)}
                    placeholder="예: 8"
                />
            </div>

            {removable && (
                <Button variant="ghost" className="w-full justify-center" onClick={() => onRemove(index)}>
                    세트 삭제
                </Button>
            )}
        </div>
    );
}
