import { getHouseholdContext } from "@/lib/household";
import { getCategories, getMonthTransactions, summarizeMonth } from "@/lib/data";
import { currentYearMonth, formatCurrency } from "@/lib/format";
import { StatTile } from "@/components/dashboard/stat-tile";
import { CategoryDonut } from "@/components/dashboard/category-donut";
import { BarRow } from "@/components/dashboard/bar-row";
import { MonthSwitcher } from "@/components/dashboard/month-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const current = currentYearMonth();
  const year = params.year ? Number(params.year) : current.year;
  const month = params.month ? Number(params.month) : current.month;

  const ctx = await getHouseholdContext();
  if (!ctx) return null;

  const [categories, transactions] = await Promise.all([
    getCategories(),
    getMonthTransactions(year, month),
  ]);

  const summary = summarizeMonth(transactions, categories, ctx.members);

  const donutData = summary.byCategory.slice(0, 8).map((c) => ({
    name: c.category.name,
    value: c.total,
    color: c.category.color,
  }));

  const maxPerson = Math.max(1, ...summary.byPerson.map((p) => p.total));
  const maxFixedVar = Math.max(1, summary.fixedExpense, summary.variableExpense);

  const recent = transactions.slice(0, 6);
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const memberById = new Map(ctx.members.map((m) => [m.id, m]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-foreground">Dashboard</h1>
        <MonthSwitcher year={year} month={month} basePath="/" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          label="Saldo do mês"
          value={summary.balance}
          tone={summary.balance >= 0 ? "success" : "critical"}
        />
        <StatTile label="Receitas" value={summary.totalIncome} tone="success" />
        <StatTile label="Despesas" value={summary.totalExpense} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Gastos por categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryDonut data={donutData} total={summary.totalExpense} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Fixo x Variável
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <BarRow
                label="Fixo"
                value={summary.fixedExpense}
                max={maxFixedVar}
                color="var(--chart-1)"
              />
              <BarRow
                label="Variável"
                value={summary.variableExpense}
                max={maxFixedVar}
                color="var(--chart-2)"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Por pessoa</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {summary.byPerson.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum gasto neste mês ainda.
                </p>
              )}
              {summary.byPerson.map((p) => (
                <BarRow
                  key={p.member?.id ?? "shared"}
                  label={p.member?.display_name ?? "Compartilhado"}
                  value={p.total}
                  max={maxPerson}
                  color={p.member?.color ?? "var(--muted-foreground)"}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">
            Últimos lançamentos
          </CardTitle>
          <Link
            href="/lancamentos"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Ver todos
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">
              Nenhum lançamento neste mês ainda.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-border/60">
              {recent.map((t) => {
                const category = categoryById.get(t.category_id);
                const person = t.person_id ? memberById.get(t.person_id) : null;
                return (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: category?.color }}
                      />
                      <div className="overflow-hidden">
                        <p className="truncate text-sm text-foreground">
                          {t.description || category?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {category?.name} · {person?.display_name ?? "Compartilhado"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={
                        "shrink-0 tabular-nums text-sm " +
                        (t.kind === "income" ? "text-success" : "text-foreground")
                      }
                    >
                      {t.kind === "income" ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
