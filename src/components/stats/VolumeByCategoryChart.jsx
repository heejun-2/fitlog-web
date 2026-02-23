import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

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
                <BarChart
                    layout="vertical"   // ⭐ 핵심
                    data={chartData}
                    margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />

                    <XAxis
                        type="number"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `${Number(v).toLocaleString()}`}
                    />

                    <YAxis
                        type="category"
                        dataKey="category"
                        tickLine={false}
                        axisLine={false}
                        width={80}
                    />

                    <Tooltip
                        formatter={(value) => [formatKg(value), "볼륨"]}
                        contentStyle={{
                            borderRadius: 12,
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 10px 30px rgba(2,6,23,0.08)",
                        }}
                    />

                    <Bar
                        dataKey="volume"
                        fill="#0f172a"
                        radius={[0, 12, 12, 0]} // 오른쪽 둥글게
                        barSize={28}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
