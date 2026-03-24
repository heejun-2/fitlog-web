import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { chartTheme } from "../../theme/tokens";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WeeklyTrendChart({ data }) {
    const chartData = (data ?? []).map((x) => ({
        label: days[new Date(x.date).getDay()],
        volume: Number(x.volume ?? 0),
        setCount: Number(x.setCount ?? 0),
    }));

    return (
        <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid stroke={chartTheme.grid} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: chartTheme.axis, fontSize: 12 }} />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: chartTheme.axis, fontSize: 12 }}
                        tickFormatter={(v) => v.toLocaleString()}
                    />
                    <Tooltip
                        formatter={(v) => [`${Number(v).toLocaleString()}kg`, "볼륨"]}
                        labelFormatter={(label) => `요일 ${label}`}
                        contentStyle={{
                            borderRadius: 18,
                            border: `1px solid ${chartTheme.tooltipBorder}`,
                            background: chartTheme.tooltipBackground,
                            boxShadow: chartTheme.tooltipShadow,
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="volume"
                        stroke={chartTheme.primary}
                        strokeWidth={3}
                        dot={{ r: 4, fill: chartTheme.primaryDark, stroke: "#fff", strokeWidth: 2 }}
                        activeDot={{ r: 5 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
