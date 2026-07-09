import { getCategories, getMonthTransactions, getMonthBudgets } from "@/lib/data";
import { currentYearMonth } from "@/lib/format";
import { MonthSwitcher } from "@/components/dashboard/month-switcher";
import { BudgetRow } from "@/components/orcamento/budget-row";
import { Card, CardContent } from "@/components/ui/card";
import { StatTile } from "@/components/dashboard/stat-tile";

export default async function OrcamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const current = currentYearMonth();
  const year = params.year ? Number(params.year) : current.year;
  const month = params.month ? Number(params.month) : current.month;

  const [categories, transactions, budgets] = await Promise.all([
    getCategories(),
    getMonthTransactions(year, month),
    getMonthBudgets(year, month),
  ]);

  const expenseCategories = categories.filter((c) => c.kind === "expense");

  const spentByCategory = new Map<string, number>();
  for (const t of transactions) {
    if (t.kind !== "expense") continue;
    spentByCategory.set(
      t.category_id,
      (spentByCategory.get(t.category_id) ?? 0) + t.amount,
    );
  }

  const budgetByCategory = new Map(budgets.map((b) => [b.category_id, b.amount]));

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = expenseCategories.reduce(
    (sum, c) => sum + (spentByCategory.get(c.id) ?? 0),
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-foreground">Orçamento</h1>
        <MonthSwitcher year={year} month={month} basePath="/orcamento" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatTile label="Orçado no mês" value={totalBudget} />
        <StatTile
          label="Gasto no mês"
          value={totalSpent}
          tone={
            totalBudget > 0 && totalSpent > totalBudget ? "critical" : "default"
          }
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {expenseCategories.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              Crie categorias de despesa primeiro, na aba Categorias.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {expenseCategories.map((c) => (
                <li key={c.id}>
                  <BudgetRow
                    category={c}
                    spent={spentByCategory.get(c.id) ?? 0}
                    budgetAmount={budgetByCategory.get(c.id) ?? 0}
                    year={year}
                    month={month}
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
