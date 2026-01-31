"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

/**
 * Simple User Button Component
 * Phase 3B: Replaces Clerk's UserButton
 */
export function UserButton() {
    const router = useRouter();

    async function handleSignOut() {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        router.push("/sign-in");
        router.refresh();
    }

    return (
        <button
            onClick={handleSignOut}
            className="rounded-md bg-muted px-3 py-1.5 text-sm font-medium hover:bg-muted/80"
        >
            Sign Out
        </button>
    );
}
