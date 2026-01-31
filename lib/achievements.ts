import { prisma } from "@/lib/db";
import { PrismaClient } from "@prisma/client";

// Type for transaction client
type PrismaTransaction = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

// Phase 2: XP Constants
// XP awards for different actions
export const XP_REWARDS = {
    VERSE_COMPLETE: 10,       // Completing a verse lesson
    PERFECT_ACCURACY: 25,     // 100% accuracy on an attempt
    DAILY_STREAK: 5,          // Daily practice (awarded once per day)
    WEEK_STREAK_BONUS: 50,    // 7-day streak bonus
    SURAH_COMPLETE: 100,      // Completing an entire surah
    WORD_MASTERED: 5,         // Mastering a word (streak of correct answers)
} as const;

// Phase 2: Level thresholds
// Level 1 = 0-99 XP, Level 2 = 100-299 XP, etc.
export const LEVEL_THRESHOLDS = [
    0,      // Level 1: 0-99
    100,    // Level 2: 100-299
    300,    // Level 3: 300-599
    600,    // Level 4: 600-999
    1000,   // Level 5: 1000-1499
    1500,   // Level 6: 1500-2099
    2100,   // Level 7: 2100-2799
    2800,   // Level 8: 2800-3599
    3600,   // Level 9: 3600-4499
    4500,   // Level 10: 4500+
] as const;

// Phase 2: Achievement types that can be earned
export const ACHIEVEMENT_TYPES = {
    FIRST_VERSE: "FIRST_VERSE",
    PERFECT_RECITATION: "PERFECT_RECITATION",
    WEEK_STREAK: "WEEK_STREAK",
    SURAH_COMPLETE: "SURAH_COMPLETE",
    MEMORIZATION_MASTER: "MEMORIZATION_MASTER",
} as const;

/**
 * Calculate level from total XP
 */
export function calculateLevel(totalXp: number): number {
    let level = 1;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (totalXp >= LEVEL_THRESHOLDS[i]) {
            level = i + 1;
            break;
        }
    }
    return level;
}

/**
 * Get XP needed to reach next level
 */
export function getXpForNextLevel(currentXp: number): { currentLevel: number; nextLevel: number; xpNeeded: number; progress: number } {
    const currentLevel = calculateLevel(currentXp);

    if (currentLevel >= LEVEL_THRESHOLDS.length) {
        // Max level reached
        return {
            currentLevel,
            nextLevel: currentLevel,
            xpNeeded: 0,
            progress: 100,
        };
    }

    const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1];
    const nextThreshold = LEVEL_THRESHOLDS[currentLevel] ?? currentThreshold * 2;
    const xpInLevel = currentXp - currentThreshold;
    const xpForLevel = nextThreshold - currentThreshold;
    const progress = Math.round((xpInLevel / xpForLevel) * 100);

    return {
        currentLevel,
        nextLevel: currentLevel + 1,
        xpNeeded: nextThreshold - currentXp,
        progress,
    };
}

/**
 * Award XP to a child and update their level
 * Returns { totalXp, level, leveledUp }
 */
export async function awardXp(
    childId: string,
    amount: number,
    tx?: PrismaTransaction
): Promise<{ totalXp: number; level: number; leveledUp: boolean }> {
    const db = tx ?? prisma;

    const child = await db.childProfile.findUnique({
        where: { id: childId },
        select: { totalXp: true, level: true },
    });

    if (!child) {
        throw new Error("Child not found");
    }

    const newTotalXp = child.totalXp + amount;
    const newLevel = calculateLevel(newTotalXp);
    const leveledUp = newLevel > child.level;

    await db.childProfile.update({
        where: { id: childId },
        data: {
            totalXp: newTotalXp,
            level: newLevel,
        },
    });

    return { totalXp: newTotalXp, level: newLevel, leveledUp };
}

/**
 * Check if child has already earned a specific achievement
 */
export async function hasAchievement(
    childId: string,
    achievementName: string,
    tx?: PrismaTransaction
): Promise<boolean> {
    const db = tx ?? prisma;

    const existing = await db.childAchievement.findFirst({
        where: {
            childId,
            achievement: { name: achievementName },
        },
    });

    return !!existing;
}

/**
 * Award an achievement to a child (if not already earned)
 * Returns the earned achievement or null if already had it
 */
export async function awardAchievement(
    childId: string,
    achievementName: string,
    tx?: PrismaTransaction
): Promise<{ awarded: boolean; achievement: { name: string; displayName: string; xpReward: number } | null }> {
    const db = tx ?? prisma;

    // Check if already earned
    if (await hasAchievement(childId, achievementName, tx)) {
        return { awarded: false, achievement: null };
    }

    // Find the achievement definition
    const achievement = await db.achievement.findUnique({
        where: { name: achievementName },
    });

    if (!achievement) {
        console.warn(`Achievement ${achievementName} not found in database`);
        return { awarded: false, achievement: null };
    }

    // Award the achievement
    await db.childAchievement.create({
        data: {
            childId,
            achievementId: achievement.id,
        },
    });

    // Award XP reward if any
    if (achievement.xpReward > 0) {
        await awardXp(childId, achievement.xpReward, tx);
    }

    return {
        awarded: true,
        achievement: {
            name: achievement.name,
            displayName: achievement.displayName,
            xpReward: achievement.xpReward,
        },
    };
}

/**
 * Get child's XP status and level progress
 */
export async function getChildXpStatus(childId: string) {
    const child = await prisma.childProfile.findUnique({
        where: { id: childId },
        select: { totalXp: true, level: true },
    });

    if (!child) {
        return null;
    }

    const levelInfo = getXpForNextLevel(child.totalXp);

    return {
        totalXp: child.totalXp,
        level: child.level,
        ...levelInfo,
    };
}

/**
 * Get all achievements for a child
 */
export async function getChildAchievements(childId: string) {
    const achievements = await prisma.childAchievement.findMany({
        where: { childId },
        include: {
            achievement: true,
        },
        orderBy: { earnedAt: "desc" },
    });

    return achievements.map((ca) => ({
        id: ca.id,
        name: ca.achievement.name,
        displayName: ca.achievement.displayName,
        description: ca.achievement.description,
        iconToken: ca.achievement.iconToken,
        xpReward: ca.achievement.xpReward,
        earnedAt: ca.earnedAt,
    }));
}

/**
 * Get all available achievements
 */
export async function getAllAchievements() {
    return prisma.achievement.findMany({
        orderBy: { createdAt: "asc" },
    });
}

/**
 * Check and award achievements based on child's progress
 * Call this after significant events (verse complete, session end, etc.)
 */
export async function checkAndAwardAchievements(
    childId: string,
    context: {
        verseCompleted?: boolean;
        perfectAccuracy?: boolean;
        currentStreak?: number;
        surahCompleted?: boolean;
        wordsMastered?: number;
    },
    tx?: PrismaTransaction
): Promise<{ name: string; displayName: string; xpReward: number }[]> {
    const earnedAchievements: { name: string; displayName: string; xpReward: number }[] = [];

    // First verse completed
    if (context.verseCompleted) {
        const result = await awardAchievement(childId, ACHIEVEMENT_TYPES.FIRST_VERSE, tx);
        if (result.awarded && result.achievement) {
            earnedAchievements.push(result.achievement);
        }
    }

    // Perfect recitation (100% accuracy)
    if (context.perfectAccuracy) {
        const result = await awardAchievement(childId, ACHIEVEMENT_TYPES.PERFECT_RECITATION, tx);
        if (result.awarded && result.achievement) {
            earnedAchievements.push(result.achievement);
        }
    }

    // Week streak (7 days)
    if (context.currentStreak && context.currentStreak >= 7) {
        const result = await awardAchievement(childId, ACHIEVEMENT_TYPES.WEEK_STREAK, tx);
        if (result.awarded && result.achievement) {
            earnedAchievements.push(result.achievement);
        }
    }

    // Surah completed
    if (context.surahCompleted) {
        const result = await awardAchievement(childId, ACHIEVEMENT_TYPES.SURAH_COMPLETE, tx);
        if (result.awarded && result.achievement) {
            earnedAchievements.push(result.achievement);
        }
    }

    // Memorization master (10+ words mastered)
    if (context.wordsMastered && context.wordsMastered >= 10) {
        const result = await awardAchievement(childId, ACHIEVEMENT_TYPES.MEMORIZATION_MASTER, tx);
        if (result.awarded && result.achievement) {
            earnedAchievements.push(result.achievement);
        }
    }

    return earnedAchievements;
}
