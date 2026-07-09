"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/format";

interface Slice {
  name: string;
  value: number;
  color: string;
}

export function CategoryDonut({
  data,
  total,
}: {
  data: Slice[];
  total: number;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Nenhum gasto neste mês ainda.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="relative h-56 w-56 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              stroke="var(--card)"
              strokeWidth={2}
            >
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 13,
                color: "var(--popover-foreground)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground">Total</span>
          <span className="text-lg font-medium tabular-nums text-foreground">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      <ul className="flex min-w-0 flex-1 flex-col gap-2">
        {data.map((slice) => {
          const pct = total > 0 ? (slice.value / total) * 100 : 0;
          return (
            <li key={slice.name} className="flex items-center gap-2 text-xs sm:text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="min-w-0 flex-1 truncate text-foreground">
                {slice.name}
              </span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {pct.toFixed(0)}%
              </span>
              <span className="shrink-0 text-right tabular-nums text-foreground">
                {formatCurrency(slice.value)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
