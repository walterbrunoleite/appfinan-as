import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMonthLabel, shiftYearMonth } from "@/lib/format";

export function MonthSwitcher({
  year,
  month,
  basePath,
}: {
  year: number;
  month: number;
  basePath: string;
}) {
  const prev = shiftYearMonth(year, month, -1);
  const next = shiftYearMonth(year, month, 1);

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`${basePath}?year=${prev.year}&month=${prev.month}`}
        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      <span className="min-w-40 text-center text-sm font-medium text-foreground">
        {formatMonthLabel(year, month)}
      </span>
      <Link
        href={`${basePath}?year=${next.year}&month=${next.month}`}
        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
