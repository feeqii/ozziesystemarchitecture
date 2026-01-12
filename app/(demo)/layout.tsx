import type { ReactNode } from "react";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function DemoLayout({ children }: { children: ReactNode }) {
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
            <SignedOut>
              <Link
                className="text-sm text-muted-foreground hover:text-foreground"
                href="/sign-in"
              >
                Sign in
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
