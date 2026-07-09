import { getHouseholdContext } from "@/lib/household";
import { getCategories, getMonthTransactions } from "@/lib/data";
import { currentYearMonth, formatCurrency } from "@/lib/format";
import { MonthSwitcher } from "@/components/dashboard/month-switcher";
import { TransactionDialog } from "@/components/lancamentos/transaction-dialog";
import { TransactionRowActions } from "@/components/lancamentos/transaction-row-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";

export default async function LancamentosPage({
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

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const memberById = new Map(ctx.members.map((m) => [m.id, m]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-foreground">Lançamentos</h1>
        <div className="flex items-center gap-3">
          <MonthSwitcher year={year} month={month} basePath="/lancamentos" />
          <TransactionDialog
            categories={categories}
            members={ctx.members}
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Novo
              </Button>
            }
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              Nenhum lançamento neste mês ainda.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Pessoa</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((t) => {
                    const category = categoryById.get(t.category_id);
                    const person = t.person_id
                      ? memberById.get(t.person_id)
                      : null;
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {new Date(t.occurred_on + "T00:00:00").toLocaleDateString(
                            "pt-BR",
                            { day: "2-digit", month: "2-digit" },
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-2 whitespace-nowrap">
                            <span
                              className="h-2 w-2 shrink-0 rounded-full"
                              style={{ backgroundColor: category?.color }}
                            />
                            {category?.name ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-48 truncate text-muted-foreground">
                          {t.description || "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {person?.display_name ?? "Compartilhado"}
                        </TableCell>
                        <TableCell
                          className={
                            "text-right tabular-nums whitespace-nowrap " +
                            (t.kind === "income" ? "text-success" : "text-foreground")
                          }
                        >
                          {t.kind === "income" ? "+" : "-"}
                          {formatCurrency(t.amount)}
                        </TableCell>
                        <TableCell>
                          <TransactionRowActions
                            transaction={t}
                            categories={categories}
                            members={ctx.members}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
