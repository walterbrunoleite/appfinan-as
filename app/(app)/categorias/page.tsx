import { getCategories } from "@/lib/data";
import { CategoryDialog } from "@/components/categorias/category-dialog";
import { CategoryRowActions } from "@/components/categorias/category-row-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryIcon } from "@/lib/icons";
import { Plus } from "lucide-react";

export default async function CategoriasPage() {
  const categories = await getCategories();
  const expenses = categories.filter((c) => c.kind === "expense");
  const incomes = categories.filter((c) => c.kind === "income");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl text-foreground">Categorias</h1>
        <CategoryDialog
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Nova
            </Button>
          }
        />
      </div>

      <CategoryGroup title="Despesas" categories={expenses} />
      <CategoryGroup title="Receitas" categories={incomes} />
    </div>
  );
}

function CategoryGroup({
  title,
  categories,
}: {
  title: string;
  categories: Awaited<ReturnType<typeof getCategories>>;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
      <Card>
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              Nenhuma categoria ainda.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {categories.map((c) => {
                return (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${c.color}26`, color: c.color }}
                      >
                        <CategoryIcon name={c.icon} className="h-4 w-4" />
                      </span>
                      <span className="text-sm text-foreground">{c.name}</span>
                      {c.fixed && (
                        <Badge variant="secondary" className="text-xs">
                          Fixo
                        </Badge>
                      )}
                    </div>
                    <CategoryRowActions category={c} />
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
