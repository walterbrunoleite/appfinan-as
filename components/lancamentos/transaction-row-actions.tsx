"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { TransactionDialog } from "@/components/lancamentos/transaction-dialog";
import { deleteTransaction } from "@/lib/actions";
import type { Category, HouseholdMember, Transaction } from "@/lib/supabase/types";

export function TransactionRowActions({
  transaction,
  categories,
  members,
}: {
  transaction: Transaction;
  categories: Category[];
  members: HouseholdMember[];
}) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Excluir esse lançamento?")) return;
    try {
      await deleteTransaction(transaction.id);
      toast.success("Lançamento excluído.");
      router.refresh();
    } catch {
      toast.error("Não deu para excluir. Tenta de novo.");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <TransactionDialog
          categories={categories}
          members={members}
          transaction={transaction}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Pencil className="h-4 w-4" />
              Editar
            </DropdownMenuItem>
          }
        />
        <DropdownMenuItem variant="destructive" onSelect={handleDelete}>
          <Trash2 className="h-4 w-4" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
