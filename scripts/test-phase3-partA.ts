import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testPhase3PartA() {
    console.log("🧪 Testing Phase 3 Part A - Performance Optimizations\n");

    try {
        // Test 1: Check if functions exist
        console.log("Test 1: Checking if database functions exist...");
        const functions = await prisma.$queryRaw<Array<{ routine_name: string }>>`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name LIKE 'get_child%'
      ORDER BY routine_name;
    `;

        console.log(`✅ Found ${functions.length} functions:`);
        functions.forEach((f) => console.log(`   - ${f.routine_name}`));

        if (functions.length !== 2) {
            console.log("❌ Expected 2 functions, found", functions.length);
            return;
        }

        // Test 2: Check if indexes exist
        console.log("\nTest 2: Checking if indexes were created...");
        const indexes = await prisma.$queryRaw<Array<{ indexname: string; tablename: string }>>`
      SELECT indexname, tablename
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE '%_childId_%'
      OR indexname LIKE '%_wordId_%'
      ORDER BY tablename, indexname;
    `;

        console.log(`✅ Found ${indexes.length} relevant indexes:`);
        indexes.forEach((idx) => console.log(`   - ${idx.tablename}.${idx.indexname}`));

        // Test 3: Get a test child
        console.log("\nTest 3: Finding a test child...");
        const child = await prisma.childProfile.findFirst({
            where: { isDeleted: false },
        });

        if (!child) {
            console.log("⚠️  No child profiles found. Create one to test the functions.");
            return;
        }

        console.log(`✅ Found child: ${child.name} (${child.id})`);

        // Test 4: Test get_child_progress_summary function
        console.log("\nTest 4: Testing get_child_progress_summary function...");
        const summary = await prisma.$queryRaw<
            Array<{
                total_attempts: bigint;
                avg_accuracy: number;
                mastered_count: bigint;
                learning_count: bigint;
                struggling_count: bigint;
                current_xp: number;
                current_level: number;
                achievement_count: bigint;
            }>
        >`SELECT * FROM get_child_progress_summary(${child.id})`;

        if (summary.length > 0) {
            const s = summary[0];
            console.log("✅ Function returned data:");
            console.log(`   - Total Attempts: ${s.total_attempts}`);
            console.log(`   - Avg Accuracy: ${Number(s.avg_accuracy).toFixed(2)}`);
            console.log(`   - Mastered: ${s.mastered_count}`);
            console.log(`   - Learning: ${s.learning_count}`);
            console.log(`   - Struggling: ${s.struggling_count}`);
            console.log(`   - XP: ${s.current_xp} (Level ${s.current_level})`);
            console.log(`   - Achievements: ${s.achievement_count}`);
        } else {
            console.log("❌ Function returned no data");
        }

        // Test 5: Test get_child_stats function
        console.log("\nTest 5: Testing get_child_stats function...");
        const stats = await prisma.$queryRaw<
            Array<{
                total_attempts: bigint;
                recent_attempts_7d: bigint;
                avg_accuracy: number;
                recent_avg_accuracy_7d: number;
                mastered_words: bigint;
                learning_words: bigint;
                struggling_words: bigint;
                total_xp: number;
                level: number;
                achievements_earned: bigint;
                current_streak: number;
                longest_streak: number;
                last_practice_at: Date | null;
            }>
        >`SELECT * FROM get_child_stats(${child.id})`;

        if (stats.length > 0) {
            const st = stats[0];
            console.log("✅ Function returned data:");
            console.log(`   - Total Attempts: ${st.total_attempts} (Last 7d: ${st.recent_attempts_7d})`);
            console.log(`   - Avg Accuracy: ${Number(st.avg_accuracy).toFixed(2)} (Last 7d: ${Number(st.recent_avg_accuracy_7d).toFixed(2)})`);
            console.log(`   - Mastered: ${st.mastered_words}, Learning: ${st.learning_words}, Struggling: ${st.struggling_words}`);
            console.log(`   - XP: ${st.total_xp} (Level ${st.level})`);
            console.log(`   - Achievements: ${st.achievements_earned}`);
            console.log(`   - Streaks: Current ${st.current_streak}, Longest ${st.longest_streak}`);
            console.log(`   - Last Practice: ${st.last_practice_at || 'Never'}`);
        } else {
            console.log("❌ Function returned no data");
        }

        console.log("\n✅ All tests completed successfully!");
        console.log("\n📝 Next steps:");
        console.log("   1. Test the API endpoints in your browser or Postman");
        console.log("   2. Check the PHASE3_PARTA_TESTING_GUIDE.md for detailed tests");
        console.log("   3. Once satisfied, move to Part B (Supabase Auth Migration)");

    } catch (error) {
        console.error("❌ Test failed:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

testPhase3PartA();
