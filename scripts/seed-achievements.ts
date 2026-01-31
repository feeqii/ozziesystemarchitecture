import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Phase 2: Initial achievement definitions
 * These correspond to the ACHIEVEMENT_TYPES in lib/achievements.ts
 */
const INITIAL_ACHIEVEMENTS = [
    {
        name: "FIRST_VERSE",
        displayName: "First Verse",
        description: "Complete your first verse lesson",
        iconToken: "BADGE_STAR",
        xpReward: 50,
    },
    {
        name: "PERFECT_RECITATION",
        displayName: "Perfect Recitation",
        description: "Get 100% accuracy on a verse",
        iconToken: "BADGE_TROPHY",
        xpReward: 100,
    },
    {
        name: "WEEK_STREAK",
        displayName: "Week Warrior",
        description: "Practice 7 days in a row",
        iconToken: "BADGE_FIRE",
        xpReward: 150,
    },
    {
        name: "SURAH_COMPLETE",
        displayName: "Surah Scholar",
        description: "Complete an entire surah",
        iconToken: "BADGE_BOOK",
        xpReward: 200,
    },
    {
        name: "MEMORIZATION_MASTER",
        displayName: "Memorization Master",
        description: "Master 10 words",
        iconToken: "BADGE_BRAIN",
        xpReward: 100,
    },
];

async function seedAchievements() {
    console.log("Seeding achievements...");

    for (const achievement of INITIAL_ACHIEVEMENTS) {
        await prisma.achievement.upsert({
            where: { name: achievement.name },
            update: {
                displayName: achievement.displayName,
                description: achievement.description,
                iconToken: achievement.iconToken,
                xpReward: achievement.xpReward,
            },
            create: {
                name: achievement.name,
                displayName: achievement.displayName,
                description: achievement.description,
                iconToken: achievement.iconToken,
                xpReward: achievement.xpReward,
            },
        });
        console.log(`  ✓ ${achievement.name}`);
    }

    console.log(`Seeded ${INITIAL_ACHIEVEMENTS.length} achievements`);
}

async function main() {
    await seedAchievements();
}

main()
    .then(async () => {
        await prisma.$disconnect();
        console.log("Done!");
    })
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });
