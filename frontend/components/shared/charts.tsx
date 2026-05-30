"use client";

import {
  Area,
  AreaChart as RAreaChart,
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const palette = {
  brand: "#5B5FF8",
  brand2: "#7C3AED",
  teal: "#00C2A8",
  line: "#E9ECF2",
  muted: "#9CA3AF",
};

export function AreaChart({
  data,
  height = 200,
  color = palette.brand,
}: {
  data: number[];
  height?: number;
  color?: string;
}) {
  const formatted = data.map((v, i) => ({ i, v }));
  return (
    <div style={{ height, width: "100%" }}>
      <ResponsiveContainer>
        <RAreaChart data={formatted} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rv-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={palette.line} vertical={false} />
          <XAxis dataKey="i" hide />
          <YAxis hide />
          <Tooltip
            cursor={{ stroke: palette.muted, strokeDasharray: "3 3" }}
            contentStyle={{
              border: `1px solid ${palette.line}`,
              borderRadius: 10,
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2.2}
            fill="url(#rv-area)"
            dot={false}
            activeDot={{ r: 5, fill: color, stroke: "#fff", strokeWidth: 2 }}
          />
        </RAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChart({
  data,
  height = 180,
  color = palette.brand,
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}) {
  return (
    <div style={{ height, width: "100%" }}>
      <ResponsiveContainer>
        <RBarChart data={data} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={palette.line} vertical={false} />
          <XAxis dataKey="label" axisLine={false} tickLine={false} fontSize={11} />
          <YAxis axisLine={false} tickLine={false} fontSize={11} />
          <Tooltip
            contentStyle={{
              border: `1px solid ${palette.line}`,
              borderRadius: 10,
              fontSize: 12,
            }}
          />
          <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Donut({
  value,
  label = "",
  size = 170,
}: {
  value: number;
  label?: string;
  size?: number;
}) {
  const data = [
    { name: "value", v: value },
    { name: "rest", v: 100 - value },
  ];
  return (
    <div style={{ width: size, height: size }} className="relative">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            innerRadius={size * 0.34}
            outerRadius={size * 0.46}
            paddingAngle={2}
            dataKey="v"
            stroke="none"
            startAngle={90}
            endAngle={-270}
          >
            <Cell fill={palette.brand} />
            <Cell fill={palette.line} />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-2xl font-bold text-ink">{value}%</div>
          {label && <div className="mt-1 text-[11px] uppercase tracking-wider text-subtle">{label}</div>}
        </div>
      </div>
    </div>
  );
}

export function Sparkline({
  data,
  width = 70,
  height = 26,
  color = palette.brand,
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1 || 1);
  const points = data
    .map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 4) - 2}`)
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
