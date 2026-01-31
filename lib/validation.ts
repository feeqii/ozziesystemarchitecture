import { z } from "zod";

// Mamoon: Avatar should be enum token, not arbitrary text
const AVATAR_TOKENS = ["AVATAR_1", "AVATAR_2", "AVATAR_3", "AVATAR_4", "AVATAR_5"] as const;

export const onboardingSchema = z.object({
  // Mamoon: Where is parent's name stored?
  name: z.string().min(1).max(100).optional(), // Optional for backward compat
  dob: z.string().min(1),
  consent: z.literal(true),
});

export const childSchema = z.object({
  // Kareem: Add max length constraints
  name: z.string().min(1).max(50),
  age: z.number().int().min(3).max(12),
  // Mamoon: Avatar as enum tokens
  avatar: z.enum(AVATAR_TOKENS).optional(),
});

export const attemptSchema = z.object({
  childId: z.string().min(1),
  wordId: z.number().int(),
  accuracy: z.number().min(0).max(1),
  deviceAttemptId: z.string().min(8).max(100), // Kareem: Add max length
  // Mamoon: Session linkage for grouping
  sessionId: z.string().optional(),
});

export const syncSchema = z.object({
  childId: z.string().min(1),
  // Kareem: Add array size cap
  attempts: z.array(attemptSchema).max(100),
});
