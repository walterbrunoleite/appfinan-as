"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useHousehold } from "@/components/household-provider";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  Tags,
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lancamentos", label: "Lançamentos", icon: Receipt },
  { href: "/orcamento", label: "Orçamento", icon: PiggyBank },
  { href: "/categorias", label: "Categorias", icon: Tags },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { member } = useHousehold();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = member.display_name.slice(0, 2).toUpperCase();

  return (
    <div className="flex min-h-screen flex-1">
      {/* Sidebar — desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-sidebar px-4 py-6 md:flex">
        <Link href="/" className="mb-8 px-2">
          <span className="font-display text-2xl italic text-foreground">
            Casa Leite
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 rounded-lg border border-border/60 px-3 py-2.5">
          <Avatar className="h-8 w-8">
            <AvatarFallback
              className="text-xs font-medium"
              style={{ backgroundColor: member.color, color: "#1c1710" }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-foreground">
              {member.display_name}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
            title="Sair"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* Topbar — mobile */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border/60 bg-sidebar px-4 py-3 md:hidden">
          <span className="font-display text-xl italic text-foreground">
            Casa Leite
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        {mobileOpen && (
          <nav className="flex flex-col gap-1 border-b border-border/60 bg-sidebar px-4 py-3 md:hidden">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                    active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-muted-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </nav>
        )}

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
