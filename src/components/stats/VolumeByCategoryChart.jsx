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

function formatKg(v) {
    return `${Number(v ?? 0).toLocaleString()}kg`;
}

export default function VolumeByCategoryChart({ data }) {
    const chartData = (data ?? [])
        .slice()
        .sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0));

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
                        dataKey="category"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: chartTheme.axis, fontSize: 12 }}
                        width={88}
                    />

                    <Tooltip
                        formatter={(value) => [formatKg(value), "볼륨"]}
                        contentStyle={{
                            borderRadius: 18,
                            border: `1px solid ${chartTheme.tooltipBorder}`,
                            background: chartTheme.tooltipBackground,
                            boxShadow: chartTheme.tooltipShadow,
                        }}
                    />

                    <Bar dataKey="volume" fill={chartTheme.primary} radius={[0, 14, 14, 0]} barSize={28} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
