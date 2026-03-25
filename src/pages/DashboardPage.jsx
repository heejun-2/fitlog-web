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
    updateWorkoutTemplate,
} from "../api/workoutTemplates";

function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function createEmptySetValue() {
    return { weight: "", reps: "" };
}

function createEmptyExerciseBlock() {
    return {
        exerciseId: "",
        sets: [createEmptySetValue()],
    };
}

function normalizeExerciseBlocks(blocks) {
    let setOrder = 1;

    return blocks.flatMap((block) => {
        const exerciseId = Number(block.exerciseId);
        if (!Number.isFinite(exerciseId) || exerciseId <= 0) {
            return [];
        }

        return (block.sets ?? [])
            .map((set) => ({
                exerciseId,
                weight: Number(set.weight),
                reps: Number(set.reps),
            }))
            .filter(
                (set) =>
                    Number.isFinite(set.weight) &&
                    Number.isFinite(set.reps)
            )
            .map((set) => ({
                ...set,
                setOrder: setOrder++,
            }));
    });
}

function mapBlocksFromSets(sets = []) {
    const grouped = [];

    sets
        .slice()
        .sort((a, b) => (a.setOrder ?? 0) - (b.setOrder ?? 0))
        .forEach((set) => {
            const exerciseId = String(set.exerciseId ?? "");
            const current = grouped[grouped.length - 1];

            if (!current || current.exerciseId !== exerciseId) {
                grouped.push({
                    exerciseId,
                    sets: [
                        {
                            weight: String(set.weight ?? ""),
                            reps: String(set.reps ?? ""),
                        },
                    ],
                });
                return;
            }

            current.sets.push({
                weight: String(set.weight ?? ""),
                reps: String(set.reps ?? ""),
            });
        });

    return grouped.length ? grouped : [createEmptyExerciseBlock()];
}

function moveItem(list, fromIndex, toIndex) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= list.length || toIndex >= list.length) {
        return list;
    }

    const next = [...list];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
}

function groupWorkoutSetsByExercise(sets = []) {
    const groups = [];

    sets
        .slice()
        .sort((a, b) => (a.setOrder ?? 0) - (b.setOrder ?? 0))
        .forEach((set) => {
            const key = String(set.exerciseId ?? set.exerciseName ?? "");
            const current = groups[groups.length - 1];

            if (!current || current.key !== key) {
                groups.push({
                    key,
                    exerciseName: set.exerciseName ?? `exerciseId:${set.exerciseId}`,
                    sets: [set],
                });
                return;
            }

            current.sets.push(set);
        });

    return groups;
}

function getGroupVolume(sets = []) {
    return sets.reduce((total, set) => total + Number(set.weight ?? 0) * Number(set.reps ?? 0), 0);
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
    const [exerciseBlocks, setExerciseBlocks] = useState([createEmptyExerciseBlock()]);
    const [creating, setCreating] = useState(false);

    const [templates, setTemplates] = useState([]);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [templateSaving, setTemplateSaving] = useState(false);
    const [templateName, setTemplateName] = useState("");
    const [templateError, setTemplateError] = useState("");
    const [templateNotice, setTemplateNotice] = useState("");
    const [editingTemplateId, setEditingTemplateId] = useState(null);
    const [draggedExerciseIndex, setDraggedExerciseIndex] = useState(null);
    const [draggedEditExerciseIndex, setDraggedEditExerciseIndex] = useState(null);

    const [editingId, setEditingId] = useState(null);
    const [editWorkoutDate, setEditWorkoutDate] = useState(today);
    const [editMemo, setEditMemo] = useState("");
    const [editExerciseBlocks, setEditExerciseBlocks] = useState([createEmptyExerciseBlock()]);

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
        } catch (error) {
            console.error("운동 날짜 조회 실패", error);
            setMarkedDates([]);
        }
    };

    const fetchWorkouts = async (date = queryDate) => {
        setLoading(true);
        setErrorMsg("");

        try {
            const res = await http.get("/api/workouts", { params: { date } });
            setItems(res.data ?? []);
        } catch (error) {
            if (error?.response?.status === 401) {
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
        } catch (error) {
            console.error(error);
            setExercises([]);
        }
    };

    const fetchTemplates = async () => {
        setTemplatesLoading(true);
        setTemplateError("");

        try {
            const data = await listWorkoutTemplates();
            setTemplates(data ?? []);
        } catch (error) {
            if (error?.response?.status === 401) {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const addExerciseBlock = () => {
        setExerciseBlocks((prev) => [...prev, createEmptyExerciseBlock()]);
    };

    const removeExerciseBlock = (exerciseIdx) => {
        setExerciseBlocks((prev) => prev.filter((_, idx) => idx !== exerciseIdx));
    };

    const moveExerciseBlock = (fromIndex, toIndex) => {
        setExerciseBlocks((prev) => moveItem(prev, fromIndex, toIndex));
    };

    const updateExerciseBlock = (exerciseIdx, key, value) => {
        setExerciseBlocks((prev) =>
            prev.map((block, idx) => (idx === exerciseIdx ? { ...block, [key]: value } : block))
        );
    };

    const addSetToExercise = (exerciseIdx) => {
        setExerciseBlocks((prev) =>
            prev.map((block, idx) =>
                idx === exerciseIdx
                    ? { ...block, sets: [...block.sets, createEmptySetValue()] }
                    : block
            )
        );
    };

    const removeSetFromExercise = (exerciseIdx, setIdx) => {
        setExerciseBlocks((prev) =>
            prev.map((block, idx) => {
                if (idx !== exerciseIdx) {
                    return block;
                }

                return {
                    ...block,
                    sets: block.sets.filter((_, innerIdx) => innerIdx !== setIdx),
                };
            })
        );
    };

    const updateExerciseSet = (exerciseIdx, setIdx, key, value) => {
        setExerciseBlocks((prev) =>
            prev.map((block, idx) => {
                if (idx !== exerciseIdx) {
                    return block;
                }

                return {
                    ...block,
                    sets: block.sets.map((set, innerIdx) =>
                        innerIdx === setIdx ? { ...set, [key]: value } : set
                    ),
                };
            })
        );
    };

    const addEditExerciseBlock = () => {
        setEditExerciseBlocks((prev) => [...prev, createEmptyExerciseBlock()]);
    };

    const removeEditExerciseBlock = (exerciseIdx) => {
        setEditExerciseBlocks((prev) => prev.filter((_, idx) => idx !== exerciseIdx));
    };

    const moveEditExerciseBlock = (fromIndex, toIndex) => {
        setEditExerciseBlocks((prev) => moveItem(prev, fromIndex, toIndex));
    };

    const updateEditExerciseBlock = (exerciseIdx, key, value) => {
        setEditExerciseBlocks((prev) =>
            prev.map((block, idx) => (idx === exerciseIdx ? { ...block, [key]: value } : block))
        );
    };

    const addEditSetToExercise = (exerciseIdx) => {
        setEditExerciseBlocks((prev) =>
            prev.map((block, idx) =>
                idx === exerciseIdx
                    ? { ...block, sets: [...block.sets, createEmptySetValue()] }
                    : block
            )
        );
    };

    const removeEditSetFromExercise = (exerciseIdx, setIdx) => {
        setEditExerciseBlocks((prev) =>
            prev.map((block, idx) => {
                if (idx !== exerciseIdx) {
                    return block;
                }

                return {
                    ...block,
                    sets: block.sets.filter((_, innerIdx) => innerIdx !== setIdx),
                };
            })
        );
    };

    const updateEditExerciseSet = (exerciseIdx, setIdx, key, value) => {
        setEditExerciseBlocks((prev) =>
            prev.map((block, idx) => {
                if (idx !== exerciseIdx) {
                    return block;
                }

                return {
                    ...block,
                    sets: block.sets.map((set, innerIdx) =>
                        innerIdx === setIdx ? { ...set, [key]: value } : set
                    ),
                };
            })
        );
    };

    const applyTemplate = (template) => {
        setMemo(template.memo ?? "");
        setExerciseBlocks(mapBlocksFromSets(template.sets));
        setTemplateError("");
        setTemplateNotice(`"${template.name}" 템플릿을 적용했습니다.`);
    };

    const startTemplateEdit = (template) => {
        setEditingTemplateId(template.id);
        setTemplateName(template.name ?? "");
        setMemo(template.memo ?? "");
        setExerciseBlocks(mapBlocksFromSets(template.sets));
        setTemplateError("");
        setTemplateNotice(`"${template.name}" 템플릿 수정 모드입니다.`);
    };

    const cancelTemplateEdit = () => {
        setEditingTemplateId(null);
        setTemplateName("");
        setTemplateError("");
        setTemplateNotice("템플릿 수정 모드를 취소했습니다.");
    };

    const onSaveTemplate = async () => {
        setTemplateError("");
        setTemplateNotice("");

        const cleanedSets = normalizeExerciseBlocks(exerciseBlocks);
        if (!templateName.trim()) {
            setTemplateError("템플릿 이름을 입력해주세요.");
            return;
        }

        if (cleanedSets.length < 1) {
            setTemplateError("유효한 운동과 세트를 1개 이상 입력한 뒤 템플릿을 저장해주세요.");
            return;
        }

        setTemplateSaving(true);
        try {
            const payload = {
                name: templateName.trim(),
                memo: memo.trim() || null,
                sets: cleanedSets,
            };

            if (editingTemplateId) {
                await updateWorkoutTemplate(editingTemplateId, payload);
            } else {
                await createWorkoutTemplate(payload);
            }

            setTemplateName("");
            setEditingTemplateId(null);
            setTemplateNotice(editingTemplateId ? "운동 템플릿을 수정했습니다." : "운동 템플릿을 저장했습니다.");
            await fetchTemplates();
        } catch (error) {
            if (error?.response?.status === 401) {
                logout();
                return;
            }
            setTemplateError(editingTemplateId ? "운동 템플릿 수정에 실패했습니다." : "운동 템플릿 저장에 실패했습니다.");
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
            if (editingTemplateId === templateId) {
                setEditingTemplateId(null);
                setTemplateName("");
            }
            setTemplateNotice("운동 템플릿을 삭제했습니다.");
            await fetchTemplates();
        } catch (error) {
            if (error?.response?.status === 401) {
                logout();
                return;
            }
            setTemplateError("운동 템플릿 삭제에 실패했습니다.");
        }
    };

    const onCreateWorkout = async () => {
        setErrorMsg("");

        const cleanedSets = normalizeExerciseBlocks(exerciseBlocks);
        if (cleanedSets.length < 1) {
            setErrorMsg("운동을 저장하려면 유효한 운동과 세트를 1개 이상 입력해주세요.");
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
            setExerciseBlocks([createEmptyExerciseBlock()]);
            setEditingTemplateId(null);
            setTemplateName("");
            setQueryDate(workoutDate);
            await fetchWorkouts(workoutDate);
            await fetchWorkoutDates(calendarDate);
        } catch (error) {
            if (error?.response?.status === 401) {
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
        setEditExerciseBlocks(mapBlocksFromSets(workout.sets));
    };

    const saveEdit = async () => {
        setErrorMsg("");

        const cleanedSets = normalizeExerciseBlocks(editExerciseBlocks);
        if (cleanedSets.length < 1) {
            setErrorMsg("운동을 수정하려면 유효한 운동과 세트를 1개 이상 입력해주세요.");
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
        } catch (error) {
            if (error?.response?.status === 401) {
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
        } catch (error) {
            if (error?.response?.status === 401) {
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
                            <p className="ds-kicker">운동 관리</p>
                            <h1 className="ds-title mt-3 text-3xl font-bold">일일 운동 기록 관리</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                                운동별로 세트를 쌓는 방식으로 입력 흐름을 정리했습니다.
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
                    <Card className="self-start p-5">
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
                                tileClassName={({ date, view }) => {
                                    if (view !== "month") {
                                        return null;
                                    }

                                    if (date.getDay() === 0) {
                                        return "ds-calendar-sunday";
                                    }

                                    if (date.getDay() === 6) {
                                        return "ds-calendar-saturday";
                                    }

                                    return null;
                                }}
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

                    <div className="space-y-4">
                        <Card className="p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="ds-kicker">템플릿</p>
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
                                    <div className="flex self-end gap-2">
                                        {editingTemplateId && (
                                            <Button variant="ghost" onClick={cancelTemplateEdit}>
                                                수정 취소
                                            </Button>
                                        )}
                                        <Button onClick={onSaveTemplate} disabled={templateSaving}>
                                            {templateSaving ? "저장 중..." : editingTemplateId ? "템플릿 수정" : "템플릿 저장"}
                                        </Button>
                                    </div>
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
                                                onEdit={startTemplateEdit}
                                                onDelete={onDeleteTemplate}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        </Card>

                        <Card className="p-5">
                            <div>
                                <p className="ds-kicker">기록 작성</p>
                                <h2 className="ds-title mt-2 text-2xl font-bold">운동 기록 저장</h2>
                                <p className="mt-2 text-sm text-slate-600">
                                    날짜와 메모를 정하고 운동별 세트를 입력한 뒤 저장합니다.
                                </p>
                            </div>

                            <div className="mt-5 space-y-4">
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

                                <div className="space-y-4">
                                    {exerciseBlocks.map((block, exerciseIdx) => (
                                        <ExerciseBlockEditor
                                            key={exerciseIdx}
                                            exercises={exercises}
                                            block={block}
                                            exerciseIndex={exerciseIdx}
                                            draggable
                                            isDragging={draggedExerciseIndex === exerciseIdx}
                                            onExerciseChange={updateExerciseBlock}
                                            onSetChange={updateExerciseSet}
                                            onAddSet={addSetToExercise}
                                            onRemoveSet={removeSetFromExercise}
                                            onRemoveExercise={removeExerciseBlock}
                                            onMoveUp={() => moveExerciseBlock(exerciseIdx, exerciseIdx - 1)}
                                            onMoveDown={() => moveExerciseBlock(exerciseIdx, exerciseIdx + 1)}
                                            canMoveUp={exerciseIdx > 0}
                                            canMoveDown={exerciseIdx < exerciseBlocks.length - 1}
                                            onDragStart={() => setDraggedExerciseIndex(exerciseIdx)}
                                            onDragOver={(targetIdx) => {
                                                if (draggedExerciseIndex === null || draggedExerciseIndex === targetIdx) {
                                                    return;
                                                }
                                                moveExerciseBlock(draggedExerciseIndex, targetIdx);
                                                setDraggedExerciseIndex(targetIdx);
                                            }}
                                            onDragEnd={() => setDraggedExerciseIndex(null)}
                                            removableExercise={exerciseBlocks.length > 1}
                                        />
                                    ))}
                                </div>

                                <Button variant="ghost" className="w-full justify-center" onClick={addExerciseBlock}>
                                    + 운동 추가
                                </Button>

                                <Button className="w-full justify-center" onClick={onCreateWorkout} disabled={creating}>
                                    {creating ? "저장 중..." : "운동 저장"}
                                </Button>
                            </div>
                        </Card>
                    </div>

                    <Card className="self-start p-5">
                        <div>
                            <p className="ds-kicker">결과</p>
                            <h2 className="ds-title mt-2 text-2xl font-bold">운동 기록 목록</h2>
                            <p className="mt-1 text-sm text-slate-500">선택한 날짜의 기록 {items.length}건</p>
                        </div>

                        {items.length === 0 ? (
                            <div className="mt-4 ds-panel-soft px-4 py-5">
                                <p className="text-sm leading-6 text-slate-600">
                                    선택한 날짜에는 운동 기록이 없습니다.
                                </p>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-4">
                                {items.map((workout, idx) => {
                                    const workoutId = workout.id ?? workout.workoutId;

                                    return (
                                        <div key={workoutId ?? idx} className="ds-panel-soft p-4">
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

                                                <div className="space-y-4">
                                                    {editExerciseBlocks.map((block, exerciseIdx) => (
                                                        <ExerciseBlockEditor
                                                            key={exerciseIdx}
                                                            exercises={exercises}
                                                            block={block}
                                                            exerciseIndex={exerciseIdx}
                                                            draggable
                                                            isDragging={draggedEditExerciseIndex === exerciseIdx}
                                                            onExerciseChange={updateEditExerciseBlock}
                                                            onSetChange={updateEditExerciseSet}
                                                            onAddSet={addEditSetToExercise}
                                                            onRemoveSet={removeEditSetFromExercise}
                                                            onRemoveExercise={removeEditExerciseBlock}
                                                            onMoveUp={() => moveEditExerciseBlock(exerciseIdx, exerciseIdx - 1)}
                                                            onMoveDown={() => moveEditExerciseBlock(exerciseIdx, exerciseIdx + 1)}
                                                            canMoveUp={exerciseIdx > 0}
                                                            canMoveDown={exerciseIdx < editExerciseBlocks.length - 1}
                                                            onDragStart={() => setDraggedEditExerciseIndex(exerciseIdx)}
                                                            onDragOver={(targetIdx) => {
                                                                if (draggedEditExerciseIndex === null || draggedEditExerciseIndex === targetIdx) {
                                                                    return;
                                                                }
                                                                moveEditExerciseBlock(draggedEditExerciseIndex, targetIdx);
                                                                setDraggedEditExerciseIndex(targetIdx);
                                                            }}
                                                            onDragEnd={() => setDraggedEditExerciseIndex(null)}
                                                            removableExercise={editExerciseBlocks.length > 1}
                                                        />
                                                    ))}
                                                </div>

                                                <Button variant="ghost" className="w-full justify-center" onClick={addEditExerciseBlock}>
                                                    + 운동 추가
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
                                                    <div className="mt-3 space-y-3">
                                                        {groupWorkoutSetsByExercise(workout.sets).map((group, groupIndex) => (
                                                            <div key={`${group.key}-${groupIndex}`} className="ds-panel-soft px-4 py-3">
                                                                <div className="flex items-center justify-between gap-3">
                                                                    <p className="text-sm font-semibold text-slate-900">
                                                                        {group.exerciseName}
                                                                    </p>
                                                                    <div className="text-right">
                                                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                                            세트 {group.sets.length}개
                                                                        </p>
                                                                        <p className="mt-1 text-xs font-semibold text-slate-500">
                                                                            총 볼륨 {getGroupVolume(group.sets).toLocaleString()}kg
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-3 flex flex-wrap gap-2">
                                                                    {group.sets.map((set, setIndex) => (
                                                                        <span
                                                                            key={set.id ?? `${group.key}-${setIndex}`}
                                                                            className="rounded-full bg-white/80 px-3 py-2 text-sm text-slate-700"
                                                                        >
                                                                            {setIndex + 1}세트 · {set.weight}kg x {set.reps}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
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

function TemplateCard({ template, exercises, onApply, onEdit, onDelete }) {
    const getExerciseName = (exerciseId) => {
        const match = exercises.find((item) => String(item.id) === String(exerciseId));
        return match?.name ?? `exerciseId:${exerciseId}`;
    };

    const uniqueExerciseCount = new Set((template.sets ?? []).map((set) => String(set.exerciseId))).size;

    return (
        <div className="ds-panel-soft p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-slate-950">{template.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                        운동 {uniqueExerciseCount}개 / 세트 {(template.sets ?? []).length}개
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" onClick={() => onApply(template)}>
                        적용
                    </Button>
                    <Button variant="ghost" onClick={() => onEdit(template)}>
                        수정
                    </Button>
                    <Button variant="danger" onClick={() => onDelete(template.id)}>
                        삭제
                    </Button>
                </div>
            </div>

            {template.memo && <p className="mt-3 text-sm leading-6 text-slate-600">{template.memo}</p>}

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

function ExerciseBlockEditor({
    exercises,
    block,
    exerciseIndex,
    draggable,
    isDragging,
    canMoveUp,
    canMoveDown,
    onExerciseChange,
    onSetChange,
    onAddSet,
    onRemoveSet,
    onRemoveExercise,
    onMoveUp,
    onMoveDown,
    onDragStart,
    onDragOver,
    onDragEnd,
    removableExercise,
}) {
    return (
        <div
            className={`ds-panel-soft space-y-4 p-4 transition ${isDragging ? "opacity-60 ring-2 ring-orange-300" : ""}`}
            draggable={draggable}
            onDragStart={onDragStart}
            onDragOver={(event) => {
                event.preventDefault();
                onDragOver?.(exerciseIndex);
            }}
            onDragEnd={onDragEnd}
            onDrop={(event) => event.preventDefault()}
        >
            <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        운동 {exerciseIndex + 1}
                    </div>

                    {removableExercise && (
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                className="min-w-0 px-3"
                                onClick={onMoveUp}
                                disabled={!canMoveUp}
                                aria-label="위로 이동"
                                title="위로 이동"
                            >
                                ↑
                            </Button>
                            <Button
                                variant="ghost"
                                className="min-w-0 px-3"
                                onClick={onMoveDown}
                                disabled={!canMoveDown}
                                aria-label="아래로 이동"
                                title="아래로 이동"
                            >
                                ↓
                            </Button>
                            <Button variant="ghost" onClick={() => onRemoveExercise(exerciseIndex)}>
                                운동 삭제
                            </Button>
                        </div>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">운동</label>
                    <select
                        className="ds-select text-sm"
                        value={block.exerciseId}
                        onChange={(e) => onExerciseChange(exerciseIndex, "exerciseId", e.target.value)}
                    >
                        <option value="">운동을 선택하세요</option>
                        {exercises.map((exercise) => (
                            <option key={exercise.id} value={exercise.id}>
                                {exercise.name}{exercise.category ? ` (${exercise.category})` : ""}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-3">
                {block.sets.map((set, setIndex) => (
                    <div key={setIndex} className="rounded-2xl bg-white/70 p-3">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-900">세트 {setIndex + 1}</p>
                            {block.sets.length > 1 && (
                                <Button variant="ghost" onClick={() => onRemoveSet(exerciseIndex, setIndex)}>
                                    세트 삭제
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Input
                                label="무게(kg)"
                                value={set.weight}
                                onChange={(e) => onSetChange(exerciseIndex, setIndex, "weight", e.target.value)}
                                placeholder="예: 80"
                            />
                            <Input
                                label="횟수(reps)"
                                value={set.reps}
                                onChange={(e) => onSetChange(exerciseIndex, setIndex, "reps", e.target.value)}
                                placeholder="예: 8"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <Button variant="ghost" className="w-full justify-center" onClick={() => onAddSet(exerciseIndex)}>
                + 세트 추가
            </Button>
        </div>
    );
}

