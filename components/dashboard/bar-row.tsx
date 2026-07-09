import { formatCurrency } from "@/lib/format";

export function BarRow({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 3 : 0) : 0;

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="w-20 shrink-0 truncate text-xs text-muted-foreground sm:w-28 sm:text-sm">
        {label}
      </span>
      <div className="h-2 min-w-6 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="shrink-0 text-right text-xs tabular-nums text-foreground sm:text-sm">
        {formatCurrency(value)}
      </span>
    </div>
  );
}
