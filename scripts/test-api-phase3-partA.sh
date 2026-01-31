#!/bin/bash

# Phase 3 Part A - API Testing Script
# This script tests the enhanced endpoints with curl

echo "🧪 Phase 3 Part A - API Testing"
echo "================================"
echo ""

# Configuration
BASE_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "⚠️  Prerequisites:"
echo "   1. Server must be running (npm run dev)"
echo "   2. You must be signed in (Clerk auth)"
echo "   3. You must have at least one child profile"
echo ""
read -p "Press Enter to continue..."
echo ""

# Test 1: Get all children (with enhanced data)
echo -e "${BLUE}Test 1: GET /api/children${NC}"
echo "Expected: Children list with _count object"
echo ""
curl -s "$BASE_URL/api/children" \
  -H "Content-Type: application/json" \
  | jq '.'
echo ""
echo "✅ Check: Does response include _count.attempts, _count.mastery, _count.achievements?"
read -p "Press Enter to continue..."
echo ""

# Get first child ID for subsequent tests
CHILD_ID=$(curl -s "$BASE_URL/api/children" | jq -r '.children[0].id')

if [ "$CHILD_ID" = "null" ] || [ -z "$CHILD_ID" ]; then
  echo "❌ No children found. Please create a child profile first."
  exit 1
fi

echo "Using child ID: $CHILD_ID"
echo ""

# Test 2: Get progress summary (enhanced)
echo -e "${BLUE}Test 2: GET /api/progress/summary?childId=$CHILD_ID${NC}"
echo "Expected: Enhanced summary with avgAccuracy, xp, achievementCount"
echo ""
curl -s "$BASE_URL/api/progress/summary?childId=$CHILD_ID" \
  -H "Content-Type: application/json" \
  | jq '.'
echo ""
echo "✅ Check: Does response include avgAccuracy, xp.total, xp.level, achievementCount?"
read -p "Press Enter to continue..."
echo ""

# Test 3: Get comprehensive stats (NEW endpoint)
echo -e "${BLUE}Test 3: GET /api/children/$CHILD_ID/stats${NC}"
echo "Expected: Comprehensive stats with 7-day trends"
echo ""
curl -s "$BASE_URL/api/children/$CHILD_ID/stats" \
  -H "Content-Type: application/json" \
  | jq '.'
echo ""
echo "✅ Check: Does response include:"
echo "   - attempts.total and attempts.last7Days"
echo "   - accuracy.overall and accuracy.last7Days"
echo "   - mastery.mastered, mastery.learning, mastery.struggling"
echo "   - gamification.totalXp, gamification.level, gamification.achievementsEarned"
echo "   - streaks.current, streaks.longest"
echo "   - lastPracticeAt"
read -p "Press Enter to continue..."
echo ""

# Test 4: Get XP status (existing endpoint, should still work)
echo -e "${BLUE}Test 4: GET /api/progress/xp?childId=$CHILD_ID${NC}"
echo "Expected: XP status (existing endpoint should still work)"
echo ""
curl -s "$BASE_URL/api/progress/xp?childId=$CHILD_ID" \
  -H "Content-Type: application/json" \
  | jq '.'
echo ""
echo "✅ Check: Does response include totalXp, level, xpNeeded, progress?"
echo ""

echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo "📝 Summary:"
echo "   - Test 1: Children list with eager-loaded counts"
echo "   - Test 2: Enhanced progress summary with DB aggregation"
echo "   - Test 3: NEW comprehensive stats endpoint"
echo "   - Test 4: Existing XP endpoint (backward compatibility)"
echo ""
echo "🎉 If all responses look correct, Part A is working perfectly!"
