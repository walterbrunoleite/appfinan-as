import { createClient } from "@/lib/supabase/server";
import type { HouseholdMember } from "@/lib/supabase/types";

export interface HouseholdContext {
  householdId: string;
  member: HouseholdMember;
  members: HouseholdMember[];
}

/**
 * Retorna o household do usuário logado, ou null se ele ainda não foi
 * vinculado a nenhuma família (email fora da lista, ou trigger ainda não rodou).
 */
export async function getHouseholdContext(): Promise<HouseholdContext | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: members } = await supabase
    .from("household_members")
    .select("*")
    .order("created_at", { ascending: true });

  if (!members || members.length === 0) return null;

  const me = members.find((m) => m.user_id === user.id);
  if (!me) return null;

  return {
    householdId: me.household_id,
    member: me,
    members,
  };
}
