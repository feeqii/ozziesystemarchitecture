-- Phase 3 Part A: Performance Optimizations
-- This migration adds:
-- 1. PostgreSQL function for child progress summary (replaces JS aggregation)
-- 2. Missing indexes for common query patterns

-- ============================================
-- 1. Create Progress Summary Function
-- ============================================
-- This function aggregates all child progress data in a single DB query
-- Replaces multiple JS-side queries and aggregations

CREATE OR REPLACE FUNCTION get_child_progress_summary(p_child_id TEXT)
RETURNS TABLE (
  total_attempts BIGINT,
  avg_accuracy NUMERIC,
  mastered_count BIGINT,
  learning_count BIGINT,
  struggling_count BIGINT,
  current_xp INT,
  current_level INT,
  achievement_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT a.id)::BIGINT as total_attempts,
    COALESCE(AVG(a.accuracy), 0)::NUMERIC as avg_accuracy,
    COUNT(DISTINCT CASE WHEN m.status = 'mastered' THEN m.id END)::BIGINT as mastered_count,
    COUNT(DISTINCT CASE WHEN m.status = 'learning' THEN m.id END)::BIGINT as learning_count,
    COUNT(DISTINCT CASE WHEN m.status = 'struggling' THEN m.id END)::BIGINT as struggling_count,
    COALESCE(c."totalXp", 0) as current_xp,
    COALESCE(c.level, 1) as current_level,
    COUNT(DISTINCT ca.id)::BIGINT as achievement_count
  FROM "ChildProfile" c
  LEFT JOIN "Attempt" a ON a."childId" = c.id
  LEFT JOIN "Mastery" m ON m."childId" = c.id
  LEFT JOIN "ChildAchievement" ca ON ca."childId" = c.id
  WHERE c.id = p_child_id
  GROUP BY c.id, c."totalXp", c.level;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. Create Child Stats Function
-- ============================================
-- Returns comprehensive stats for a child including recent activity

CREATE OR REPLACE FUNCTION get_child_stats(p_child_id TEXT)
RETURNS TABLE (
  total_attempts BIGINT,
  recent_attempts_7d BIGINT,
  avg_accuracy NUMERIC,
  recent_avg_accuracy_7d NUMERIC,
  mastered_words BIGINT,
  learning_words BIGINT,
  struggling_words BIGINT,
  total_xp INT,
  level INT,
  achievements_earned BIGINT,
  current_streak INT,
  longest_streak INT,
  last_practice_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT a.id)::BIGINT as total_attempts,
    COUNT(DISTINCT CASE 
      WHEN a."createdAt" >= NOW() - INTERVAL '7 days' 
      THEN a.id 
    END)::BIGINT as recent_attempts_7d,
    COALESCE(AVG(a.accuracy), 0)::NUMERIC as avg_accuracy,
    COALESCE(AVG(CASE 
      WHEN a."createdAt" >= NOW() - INTERVAL '7 days' 
      THEN a.accuracy 
    END), 0)::NUMERIC as recent_avg_accuracy_7d,
    COUNT(DISTINCT CASE WHEN m.status = 'mastered' THEN m.id END)::BIGINT as mastered_words,
    COUNT(DISTINCT CASE WHEN m.status = 'learning' THEN m.id END)::BIGINT as learning_words,
    COUNT(DISTINCT CASE WHEN m.status = 'struggling' THEN m.id END)::BIGINT as struggling_words,
    COALESCE(c."totalXp", 0) as total_xp,
    COALESCE(c.level, 1) as level,
    COUNT(DISTINCT ca.id)::BIGINT as achievements_earned,
    COALESCE(c."currentStreak", 0) as current_streak,
    COALESCE(c."longestStreak", 0) as longest_streak,
    c."lastPracticeAt" as last_practice_at
  FROM "ChildProfile" c
  LEFT JOIN "Attempt" a ON a."childId" = c.id
  LEFT JOIN "Mastery" m ON m."childId" = c.id
  LEFT JOIN "ChildAchievement" ca ON ca."childId" = c.id
  WHERE c.id = p_child_id
  GROUP BY c.id, c."totalXp", c.level, c."currentStreak", c."longestStreak", c."lastPracticeAt";
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. Add Missing Indexes for Query Optimization
-- ============================================

-- Index for Attempt queries by childId + createdAt (for timeline queries)
CREATE INDEX IF NOT EXISTS "Attempt_childId_createdAt_idx" 
  ON "Attempt"("childId", "createdAt" DESC);

-- Index for Mastery queries by childId + status (for filtering by status)
CREATE INDEX IF NOT EXISTS "Mastery_childId_status_idx" 
  ON "Mastery"("childId", "status");

-- Index for ChildAchievement queries by childId + earnedAt (for recent achievements)
CREATE INDEX IF NOT EXISTS "ChildAchievement_childId_earnedAt_idx" 
  ON "ChildAchievement"("childId", "earnedAt" DESC);

-- Index for Session queries by childId + status (already exists but ensuring)
-- This helps with active session lookups
CREATE INDEX IF NOT EXISTS "Session_childId_status_idx" 
  ON "Session"("childId", "status");

-- Composite index for Attempt accuracy queries (for analytics)
CREATE INDEX IF NOT EXISTS "Attempt_childId_accuracy_idx" 
  ON "Attempt"("childId", "accuracy");

-- Index for word-level mastery lookups
CREATE INDEX IF NOT EXISTS "Mastery_wordId_status_idx" 
  ON "Mastery"("wordId", "status");
