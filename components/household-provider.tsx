"use client";

import { createContext, useContext } from "react";
import type { HouseholdMember } from "@/lib/supabase/types";

interface HouseholdContextValue {
  householdId: string;
  member: HouseholdMember;
  members: HouseholdMember[];
}

const HouseholdContext = createContext<HouseholdContextValue | null>(null);

export function HouseholdProvider({
  value,
  children,
}: {
  value: HouseholdContextValue;
  children: React.ReactNode;
}) {
  return (
    <HouseholdContext.Provider value={value}>
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  const ctx = useContext(HouseholdContext);
  if (!ctx) {
    throw new Error("useHousehold precisa estar dentro de HouseholdProvider");
  }
  return ctx;
}
