import { createClient } from "@/lib/supabase/server";
import { monthRange } from "@/lib/format";
import type { Category, HouseholdMember, Transaction, Budget } from "@/lib/supabase/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function getMonthTransactions(
  year: number,
  month: number,
): Promise<Transaction[]> {
  const supabase = await createClient();
  const { start, end } = monthRange(year, month);
  const { data } = await supabase
    .from("transactions")
    .select("*")
    .gte("occurred_on", start)
    .lte("occurred_on", end)
    .order("occurred_on", { ascending: false });
  return data ?? [];
}

export async function getMonthBudgets(
  year: number,
  month: number,
): Promise<Budget[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("budgets")
    .select("*")
    .eq("year", year)
    .eq("month", month);
  return data ?? [];
}

export interface MonthSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  fixedExpense: number;
  variableExpense: number;
  byCategory: { category: Category; total: number }[];
  byPerson: { member: HouseholdMember | null; total: number }[];
}

export function summarizeMonth(
  transactions: Transaction[],
  categories: Category[],
  members: HouseholdMember[],
): MonthSummary {
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const memberById = new Map(members.map((m) => [m.id, m]));

  let totalIncome = 0;
  let totalExpense = 0;
  let fixedExpense = 0;
  let variableExpense = 0;

  const categoryTotals = new Map<string, number>();
  const personTotals = new Map<string, number>();

  for (const t of transactions) {
    const category = categoryById.get(t.category_id);

    if (t.kind === "income") {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
      if (category?.fixed) fixedExpense += t.amount;
      else variableExpense += t.amount;

      categoryTotals.set(
        t.category_id,
        (categoryTotals.get(t.category_id) ?? 0) + t.amount,
      );

      const personKey = t.person_id ?? "shared";
      personTotals.set(personKey, (personTotals.get(personKey) ?? 0) + t.amount);
    }
  }

  const byCategory = Array.from(categoryTotals.entries())
    .map(([categoryId, total]) => ({
      category: categoryById.get(categoryId)!,
      total,
    }))
    .filter((c) => c.category)
    .sort((a, b) => b.total - a.total);

  const byPerson = Array.from(personTotals.entries())
    .map(([personId, total]) => ({
      member: personId === "shared" ? null : (memberById.get(personId) ?? null),
      total,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    fixedExpense,
    variableExpense,
    byCategory,
    byPerson,
  };
}
