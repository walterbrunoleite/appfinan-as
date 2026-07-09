"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import { CategoryDialog } from "@/components/categorias/category-dialog";
import { deleteCategory } from "@/lib/actions";
import type { Category } from "@/lib/supabase/types";

export function CategoryRowActions({ category }: { category: Category }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Excluir a categoria "${category.name}"?`)) return;
    setDeleting(true);
    try {
      await deleteCategory(category.id);
      toast.success("Categoria excluída.");
      router.refresh();
    } catch {
      toast.error(
        "Não deu para excluir. Deve ter lançamentos usando essa categoria.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MoreHorizontal className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <CategoryDialog
          category={category}
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
