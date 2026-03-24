import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { chartTheme } from "../../theme/tokens";

function formatKg(value) {
    return `${Number(value ?? 0).toLocaleString()}kg`;
}

export default function ExercisePrChart({ data }) {
    const chartData = (data ?? [])
        .slice()
        .sort((a, b) => (b.bestWeight ?? 0) - (a.bestWeight ?? 0));

    if (!chartData.length) {
        return <div className="text-sm text-slate-500">PR 데이터가 없습니다.</div>;
    }

    return (
        <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                    <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" horizontal={false} />

                    <XAxis
                        type="number"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: chartTheme.axis, fontSize: 12 }}
                        tickFormatter={(v) => `${Number(v).toLocaleString()}`}
                    />

                    <YAxis
                        type="category"
                        dataKey="exerciseName"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: chartTheme.axis, fontSize: 12 }}
                        width={110}
                    />

                    <Tooltip
                        formatter={(value) => [formatKg(value), "최고 중량"]}
                        contentStyle={{
                            borderRadius: 18,
                            border: `1px solid ${chartTheme.tooltipBorder}`,
                            background: chartTheme.tooltipBackground,
                            boxShadow: chartTheme.tooltipShadow,
                        }}
                    />

                    <Bar dataKey="bestWeight" fill={chartTheme.primary} radius={[0, 14, 14, 0]} barSize={28} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
