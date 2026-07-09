"use server";

import { createClient } from "@/lib/supabase/server";
import { getHouseholdContext } from "@/lib/household";
import { revalidatePath } from "next/cache";
import type { CategoryKind } from "@/lib/supabase/types";

async function requireContext() {
  const ctx = await getHouseholdContext();
  if (!ctx) throw new Error("Sem acesso à família");
  return ctx;
}

// ============ TRANSAÇÕES ============

export interface TransactionInput {
  categoryId: string;
  personId: string | null;
  kind: CategoryKind;
  amount: number;
  occurredOn: string;
  description: string;
  installments?: number;
}

function addMonths(dateStr: string, months: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDayOfTargetMonth = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0),
  ).getUTCDate();
  d.setUTCDate(Math.min(day, lastDayOfTargetMonth));
  return d.toISOString().slice(0, 10);
}

/** Divide um valor total em N parcelas de 2 casas decimais, sem perder centavos por arredondamento. */
function splitIntoInstallments(totalAmount: number, count: number): number[] {
  const totalCents = Math.round(totalAmount * 100);
  const baseCents = Math.floor(totalCents / count);
  const remainder = totalCents - baseCents * count;
  return Array.from({ length: count }, (_, i) =>
    (baseCents + (i < remainder ? 1 : 0)) / 100,
  );
}

export async function createTransaction(input: TransactionInput) {
  const ctx = await requireContext();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sem acesso à família");

  const installmentCount = input.installments ?? 1;

  if (installmentCount <= 1) {
    const { error } = await supabase.from("transactions").insert({
      household_id: ctx.householdId,
      category_id: input.categoryId,
      person_id: input.personId,
      kind: input.kind,
      amount: input.amount,
      occurred_on: input.occurredOn,
      description: input.description,
      created_by: user.id,
    });
    if (error) throw new Error(error.message);
  } else {
    const groupId = crypto.randomUUID();
    const amounts = splitIntoInstallments(input.amount, installmentCount);
    const rows = amounts.map((amount, i) => ({
      household_id: ctx.householdId,
      category_id: input.categoryId,
      person_id: input.personId,
      kind: input.kind,
      amount,
      occurred_on: addMonths(input.occurredOn, i),
      description: input.description,
      created_by: user.id,
      installment_group_id: groupId,
      installment_number: i + 1,
      installment_total: installmentCount,
    }));
    const { error } = await supabase.from("transactions").insert(rows);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/lancamentos");
  revalidatePath("/orcamento");
}

export async function updateTransaction(id: string, input: TransactionInput) {
  await requireContext();
  const supabase = await createClient();

  const { error } = await supabase
    .from("transactions")
    .update({
      category_id: input.categoryId,
      person_id: input.personId,
      kind: input.kind,
      amount: input.amount,
      occurred_on: input.occurredOn,
      description: input.description,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/lancamentos");
  revalidatePath("/orcamento");
}

export async function deleteTransaction(id: string) {
  await requireContext();
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/lancamentos");
  revalidatePath("/orcamento");
}

// ============ CATEGORIAS ============

export interface CategoryInput {
  name: string;
  kind: CategoryKind;
  fixed: boolean;
  color: string;
  icon: string;
}

export async function createCategory(input: CategoryInput) {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    household_id: ctx.householdId,
    name: input.name,
    kind: input.kind,
    fixed: input.fixed,
    color: input.color,
    icon: input.icon,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/categorias");
  revalidatePath("/lancamentos");
  revalidatePath("/orcamento");
  revalidatePath("/");
}

export async function updateCategory(id: string, input: CategoryInput) {
  await requireContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name: input.name,
      kind: input.kind,
      fixed: input.fixed,
      color: input.color,
      icon: input.icon,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/categorias");
  revalidatePath("/lancamentos");
  revalidatePath("/orcamento");
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
  await requireContext();
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/categorias");
  revalidatePath("/lancamentos");
  revalidatePath("/orcamento");
  revalidatePath("/");
}

// ============ ORÇAMENTO ============

export async function upsertBudget(
  categoryId: string,
  year: number,
  month: number,
  amount: number,
) {
  const ctx = await requireContext();
  const supabase = await createClient();
  const { error } = await supabase
    .from("budgets")
    .upsert(
      {
        household_id: ctx.householdId,
        category_id: categoryId,
        year,
        month,
        amount,
      },
      { onConflict: "household_id,category_id,year,month" },
    );
  if (error) throw new Error(error.message);
  revalidatePath("/orcamento");
}
