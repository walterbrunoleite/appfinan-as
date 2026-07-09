import { getHouseholdContext } from "@/lib/household";
import { HouseholdProvider } from "@/components/household-provider";
import { AppShell } from "@/components/app-shell";
import { redirect } from "next/navigation";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getHouseholdContext();

  if (!ctx) {
    redirect("/login?erro=sem_acesso");
  }

  return (
    <HouseholdProvider value={ctx}>
      <AppShell>{children}</AppShell>
    </HouseholdProvider>
  );
}
