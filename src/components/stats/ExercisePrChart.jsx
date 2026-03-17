import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

/**
 * 숫자를 kg 형태로 포맷
 */
function formatKg(value) {
    return `${Number(value ?? 0).toLocaleString()}kg`;
}

export default function ExercisePrChart({ data }) {
    /**
     * 운동별 최고중량을 큰 값 순으로 정렬
     * data 예시:
     * [
     *   { exerciseId: 1, exerciseName: "벤치프레스", bestWeight: 80 },
     *   ...
     * ]
     */
    const chartData = (data ?? [])
        .slice()
        .sort((a, b) => (b.bestWeight ?? 0) - (a.bestWeight ?? 0));

    if (!chartData.length) {
        return <div className="text-sm text-slate-500">PR 데이터가 없어.</div>;
    }

    return (
        <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    layout="vertical" // 가로 막대 그래프
                    data={chartData}
                    margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                >
                    {/* 배경 그리드 */}
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />

                    {/* X축: 숫자(중량) */}
                    <XAxis
                        type="number"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${Number(v).toLocaleString()}`}
                    />

                    {/* Y축: 운동명 */}
                    <YAxis
                        type="category"
                        dataKey="exerciseName"
                        tickLine={false}
                        axisLine={false}
                        width={100}
                    />

                    {/* 마우스 올렸을 때 표시 */}
                    <Tooltip
                        formatter={(value) => [formatKg(value), "최고 중량"]}
                        contentStyle={{
                            borderRadius: 12,
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 10px 30px rgba(2,6,23,0.08)",
                        }}
                    />

                    {/* 막대 */}
                    <Bar
                        dataKey="bestWeight"
                        fill="#0f172a"
                        radius={[0, 12, 12, 0]} // 오른쪽만 둥글게
                        barSize={28}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}