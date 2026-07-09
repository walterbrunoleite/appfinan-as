"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, Loader2, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { CategoryIcon } from "@/lib/icons";
import { upsertBudget } from "@/lib/actions";
import { STATUS } from "@/lib/colors";
import type { Category } from "@/lib/supabase/types";

export function BudgetRow({
  category,
  spent,
  budgetAmount,
  year,
  month,
}: {
  category: Category;
  spent: number;
  budgetAmount: number;
  year: number;
  month: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(
    budgetAmount > 0 ? String(budgetAmount) : "",
  );
  const [saving, setSaving] = useState(false);

  const hasBudget = budgetAmount > 0;
  const pct = hasBudget ? Math.min((spent / budgetAmount) * 100, 100) : 0;
  const overPct = hasBudget ? (spent / budgetAmount) * 100 : 0;

  const statusColor =
    overPct >= 100 ? STATUS.critical : overPct >= 80 ? STATUS.warning : STATUS.good;

  async function handleSave() {
    const parsed = Number(value.replace(",", "."));
    if (!parsed || parsed <= 0) {
      toast.error("O orçamento precisa ser maior que zero.");
      return;
    }
    setSaving(true);
    try {
      await upsertBudget(category.id, year, month, parsed);
      toast.success("Orçamento salvo.");
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("Não deu para salvar. Tenta de novo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${category.color}26`, color: category.color }}
          >
            <CategoryIcon name={category.icon} className="h-4 w-4" />
          </span>
          <span className="truncate text-sm text-foreground">
            {category.name}
          </span>
        </div>

        {editing ? (
          <div className="flex items-center gap-1.5">
            <Input
              autoFocus
              inputMode="decimal"
              placeholder="0,00"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-8 w-28 text-right"
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm tabular-nums">
            <span className="text-foreground">{formatCurrency(spent)}</span>
            {hasBudget && (
              <span className="text-muted-foreground">
                / {formatCurrency(budgetAmount)}
              </span>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {hasBudget ? (
        <div className="flex flex-col gap-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-[width]"
              style={{ width: `${pct}%`, backgroundColor: statusColor }}
            />
          </div>
          {overPct >= 80 && (
            <p
              className="flex items-center gap-1 text-xs"
              style={{ color: statusColor }}
            >
              <AlertTriangle className="h-3 w-3" />
              {overPct >= 100
                ? `${Math.round(overPct)}% do orçamento — estourou`
                : `${Math.round(overPct)}% do orçamento`}
            </p>
          )}
        </div>
      ) : (
        !editing && (
          <p className="text-xs text-muted-foreground">
            Sem orçamento definido para este mês.
          </p>
        )
      )}
    </div>
  );
}
