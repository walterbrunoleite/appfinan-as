export type CategoryKind = "expense" | "income";

export interface Household {
  id: string;
  name: string;
  created_at: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  email: string;
  display_name: string;
  color: string;
  created_at: string;
}

export interface Category {
  id: string;
  household_id: string;
  name: string;
  kind: CategoryKind;
  fixed: boolean;
  color: string;
  icon: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  household_id: string;
  category_id: string;
  person_id: string | null;
  kind: CategoryKind;
  amount: number;
  occurred_on: string;
  description: string;
  created_by: string;
  created_at: string;
}

export interface Budget {
  id: string;
  household_id: string;
  category_id: string;
  year: number;
  month: number;
  amount: number;
  created_at: string;
}
