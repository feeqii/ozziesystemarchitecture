import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function runMigration() {
    try {
        console.log("🚀 Running Phase 3 Part A migration...");

        const migrationPath = path.join(
            __dirname,
            "../prisma/migrations/20260201000000_phase3_performance/migration.sql"
        );

        const sql = fs.readFileSync(migrationPath, "utf-8");

        // Parse SQL statements properly, handling dollar-quoted strings
        const statements: string[] = [];
        let currentStatement = "";
        let inDollarQuote = false;
        let dollarQuoteTag = "";

        const lines = sql.split("\n");
        for (const line of lines) {
            const trimmed = line.trim();

            // Skip comments
            if (trimmed.startsWith("--") || trimmed.length === 0) {
                continue;
            }

            currentStatement += line + "\n";

            // Check for dollar quote start/end
            const dollarMatch = line.match(/\$\$|\$[a-zA-Z_][a-zA-Z0-9_]*\$/);
            if (dollarMatch) {
                if (!inDollarQuote) {
                    inDollarQuote = true;
                    dollarQuoteTag = dollarMatch[0];
                } else if (dollarMatch[0] === dollarQuoteTag) {
                    inDollarQuote = false;
                    dollarQuoteTag = "";
                }
            }

            // If we hit a semicolon outside of dollar quotes, it's the end of a statement
            if (line.includes(";") && !inDollarQuote) {
                statements.push(currentStatement.trim());
                currentStatement = "";
            }
        }

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            if (stmt.length === 0) continue;

            console.log(`Executing statement ${i + 1}/${statements.length}...`);
            await prisma.$executeRawUnsafe(stmt);
        }

        console.log("✅ Migration completed successfully!");
        console.log("\nCreated functions:");
        console.log("  - get_child_progress_summary(childId)");
        console.log("  - get_child_stats(childId)");
        console.log("\nAdded indexes:");
        console.log("  - Attempt_childId_createdAt_idx");
        console.log("  - Mastery_childId_status_idx");
        console.log("  - ChildAchievement_childId_earnedAt_idx");
        console.log("  - Session_childId_status_idx");
        console.log("  - Attempt_childId_accuracy_idx");
        console.log("  - Mastery_wordId_status_idx");
    } catch (error) {
        console.error("❌ Migration failed:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

runMigration();
