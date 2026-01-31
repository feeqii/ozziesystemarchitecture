import type { ReactNode } from "react";
import Link from "next/link";
import { UserButton } from "@/components/user-button";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Demo Layout
 * Phase 3B: Updated for Supabase Auth
 */
export default async function DemoLayout({ children }: { children: ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-display text-xl">
              Ozzie Demo
            </Link>
            <Link
              href="/api-docs"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              API Docs
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {!user ? (
              <Link
                className="text-sm text-muted-foreground hover:text-foreground"
                href="/sign-in"
              >
                Sign in
              </Link>
            ) : (
              <UserButton />
            )}
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
