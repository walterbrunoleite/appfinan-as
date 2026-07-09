"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Loader2, Check } from "lucide-react";
import { createCategory, updateCategory } from "@/lib/actions";
import { CATEGORY_PALETTE } from "@/lib/colors";
import { ICON_NAMES, CategoryIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { Category, CategoryKind } from "@/lib/supabase/types";

export function CategoryDialog({
  category,
  trigger,
}: {
  category?: Category;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const isEdit = !!category;

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(category?.name ?? "");
  const [kind, setKind] = useState<CategoryKind>(category?.kind ?? "expense");
  const [fixed, setFixed] = useState(category?.fixed ?? false);
  const [color, setColor] = useState(category?.color ?? CATEGORY_PALETTE[0].hex);
  const [icon, setIcon] = useState(category?.icon ?? "circle");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Dá um nome pra categoria.");
      return;
    }

    setSubmitting(true);
    try {
      const input = { name: name.trim(), kind, fixed, color, icon };
      if (isEdit) {
        await updateCategory(category.id, input);
        toast.success("Categoria atualizada.");
      } else {
        await createCategory(input);
        toast.success("Categoria criada.");
        setName("");
        setKind("expense");
        setFixed(false);
        setColor(CATEGORY_PALETTE[0].hex);
        setIcon("circle");
      }
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Não deu para salvar. Tenta de novo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar categoria" : "Nova categoria"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Ex: Farmácia"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <Tabs value={kind} onValueChange={(v) => setKind(v as CategoryKind)}>
            <TabsList className="w-full">
              <TabsTrigger value="expense" className="flex-1">
                Despesa
              </TabsTrigger>
              <TabsTrigger value="income" className="flex-1">
                Receita
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-foreground">Gasto fixo</p>
              <p className="text-xs text-muted-foreground">
                Recorrente todo mês (aluguel, assinaturas...)
              </p>
            </div>
            <Switch checked={fixed} onCheckedChange={setFixed} />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_PALETTE.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110"
                  style={{ backgroundColor: c.hex }}
                >
                  {color === c.hex && <Check className="h-4 w-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Ícone</Label>
            <div className="flex flex-wrap gap-2">
              {ICON_NAMES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setIcon(name)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
                    icon === name
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 text-muted-foreground hover:text-foreground",
                  )}
                >
                  <CategoryIcon name={name} className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Salvar alterações" : "Criar categoria"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
