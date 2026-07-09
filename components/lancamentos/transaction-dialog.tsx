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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { createTransaction, updateTransaction } from "@/lib/actions";
import type { Category, HouseholdMember, Transaction, CategoryKind } from "@/lib/supabase/types";

function todayISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function TransactionDialog({
  categories,
  members,
  transaction,
  trigger,
}: {
  categories: Category[];
  members: HouseholdMember[];
  transaction?: Transaction;
  trigger: React.ReactNode;
}) {
  const router = useRouter();
  const isEdit = !!transaction;

  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<CategoryKind>(transaction?.kind ?? "expense");
  const [categoryId, setCategoryId] = useState(transaction?.category_id ?? "");
  const [personId, setPersonId] = useState(transaction?.person_id ?? "shared");
  const [amount, setAmount] = useState(
    transaction ? String(transaction.amount) : "",
  );
  const [occurredOn, setOccurredOn] = useState(
    transaction?.occurred_on ?? todayISO(),
  );
  const [description, setDescription] = useState(transaction?.description ?? "");
  const [submitting, setSubmitting] = useState(false);

  const filteredCategories = categories.filter((c) => c.kind === kind);

  function resetForm() {
    setKind("expense");
    setCategoryId("");
    setPersonId("shared");
    setAmount("");
    setOccurredOn(todayISO());
    setDescription("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = Number(amount.replace(",", "."));

    if (!categoryId) {
      toast.error("Escolhe uma categoria.");
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error("O valor precisa ser maior que zero.");
      return;
    }

    setSubmitting(true);
    try {
      const input = {
        categoryId,
        personId: personId === "shared" ? null : personId,
        kind,
        amount: parsedAmount,
        occurredOn,
        description,
      };

      if (isEdit) {
        await updateTransaction(transaction.id, input);
        toast.success("Lançamento atualizado.");
      } else {
        await createTransaction(input);
        toast.success("Lançamento adicionado.");
      }

      setOpen(false);
      if (!isEdit) resetForm();
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
            {isEdit ? "Editar lançamento" : "Novo lançamento"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Tabs
            value={kind}
            onValueChange={(v) => {
              setKind(v as CategoryKind);
              setCategoryId("");
            }}
          >
            <TabsList className="w-full">
              <TabsTrigger value="expense" className="flex-1">
                Despesa
              </TabsTrigger>
              <TabsTrigger value="income" className="flex-1">
                Receita
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Escolha a categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="occurredOn">Data</Label>
              <Input
                id="occurredOn"
                type="date"
                value={occurredOn}
                onChange={(e) => setOccurredOn(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Quem gastou</Label>
              <Select value={personId ?? "shared"} onValueChange={setPersonId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shared">Compartilhado</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              placeholder="Ex: Mercado do mês"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Salvar alterações" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
