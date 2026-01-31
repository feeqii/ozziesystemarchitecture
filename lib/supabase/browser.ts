import { createBrowserClient } from "@supabase/ssr";

/**
 * Create a Supabase client for browser-side operations
 * Phase 3B: Supabase Auth Migration
 */
export function createSupabaseBrowserClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}
