import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";

export function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "critical";
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card px-5 py-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-display text-3xl tabular-nums",
          tone === "success" && "text-success",
          tone === "critical" && "text-critical",
          tone === "default" && "text-foreground",
        )}
      >
        {formatCurrency(value)}
      </p>
    </div>
  );
}
