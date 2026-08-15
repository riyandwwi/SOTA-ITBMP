"use client";

import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart, Line,
} from "recharts";

const COLORS = ["#0E6B4F", "#BD8A34", "#2F6FA6", "#9BA79F", "#C0392B", "#5C6D66"];

export function DonutChart({ data, size = 190 }: {
  data: { name: string; value: number; color?: string }[];
  size?: number;
}) {
  return (
    <div style={{ position: "relative", height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="90%"
            paddingAngle={2} strokeWidth={0}>
            {data.map((d, i) => <Cell key={i} fill={d.color || COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip
            formatter={(v: any) => [Number(v).toLocaleString("id-ID"), ""]}
            contentStyle={{ borderRadius: 10, border: "1px solid #DCE6DF", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutLegend({ data }: { data: { name: string; value?: number; color?: string }[] }) {
  return (
    <div className="legend-row">
      {data.map((d) => (
        <span key={d.name}><i style={{ background: d.color || "var(--primary)" }}></i>
          {d.name}{d.value != null ? ` — ${d.value}` : ""}</span>
      ))}
    </div>
  );
}

export function BarChartCard({ data }: { data: { name: string; a: number; b: number }[] }) {
  return (
    <div style={{ position: "relative", height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E4EAE6" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#5C6D66" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#5C6D66" }} axisLine={false} tickLine={false}
            tickFormatter={(v: number) => `${Math.round(v / 1000000)}jt`} width={44} />
          <Tooltip
            formatter={(v: any, name: any) => [`${Number(v).toLocaleString("id-ID")}`, name === "a" ? "Ditagihkan" : "Terkumpul"]}
            contentStyle={{ borderRadius: 10, border: "1px solid #DCE6DF", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12 }}
          />
          <Legend iconType="circle" iconSize={9} formatter={(v: any) => <span style={{ fontSize: 11.5 }}>{v === "a" ? "Ditagihkan" : "Terkumpul"}</span>} />
          <Bar dataKey="a" fill="#CBDDD3" radius={[4, 4, 0, 0]} />
          <Bar dataKey="b" fill="#0E6B4F" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function IpLineChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div style={{ position: "relative", height: 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="0" vertical={false} stroke="#E4EAE6" />
          <XAxis dataKey="name" tick={{ fontSize: 10.5, fill: "#5C6D66" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 4]} tick={{ fontSize: 10.5, fill: "#5C6D66" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #DCE6DF", fontSize: 12, fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
          <Line type="monotone" dataKey="value" stroke="#0E6B4F" strokeWidth={2.5} dot={{ r: 3, fill: "#0E6B4F" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}