import { z } from "zod";

export const onboardingSchema = z.object({
  dob: z.string().min(1),
  consent: z.literal(true),
});

export const childSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().min(3).max(12),
  avatar: z.string().optional(),
});

export const attemptSchema = z.object({
  childId: z.string().min(1),
  wordId: z.number().int(),
  accuracy: z.number().min(0).max(1),
  deviceAttemptId: z.string().min(8),
});

export const syncSchema = z.object({
  childId: z.string().min(1),
  attempts: z.array(attemptSchema),
});
