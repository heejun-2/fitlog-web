import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

// const fmt = (d) => String(d).slice(5).replace("-", "/"); // 02-09 -> 02/09
const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => v.toLocaleString()} />
                    <Tooltip
                        formatter={(v) => [`${Number(v).toLocaleString()}kg`, "볼륨"]}
                        labelFormatter={(label) => `날짜 ${label}`}
                        contentStyle={{
                            borderRadius: 12,
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 10px 30px rgba(2,6,23,0.08)",
                        }}
                    />
                    <Line type="monotone" dataKey="volume" stroke="#0f172a" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}