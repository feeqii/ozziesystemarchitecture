# Phase 2 Testing Guide - XP & Achievements

## ✅ What Was Implemented

### Backend (Phase 2)
1. **Database Schema**
   - `ChildProfile`: Added `totalXp` and `level` fields
   - `Achievement`: New table for achievement definitions
   - `ChildAchievement`: Junction table for earned achievements

2. **API Endpoints**
   - `GET /api/progress/xp?childId=...` - Get XP status and level
   - `GET /api/achievements` - List all available achievements
   - `GET /api/children/:id/achievements` - Get child's earned achievements
   - `POST /api/progress/sync` - Now returns `xpEarned` and `achievementsEarned`

3. **Gamification Logic** (`lib/achievements.ts`)
   - XP rewards for actions (word mastery, perfect accuracy, etc.)
   - Level calculation (10 levels, increasing XP thresholds)
   - Auto-award achievements on relevant actions
   - 5 initial achievements seeded

### Frontend (Phase 2 UI)
1. **Demo Page** (`/demo`)
   - New "🎮 XP & Achievements" tab
   - XP status display with level and progress bar
   - Earned achievements showcase
   - All available achievements list
   - Real-time sync feedback

2. **Backend Status** (`/backend-status`)
   - Achievement and ChildAchievement counts
   - Labeled with "Phase 2" badge

## 🧪 How to Test on Vercel

### Step 1: Access the Demo
Visit: https://ozziesystemarchitecture-ymca.vercel.app/demo

### Step 2: Sign In
1. Click "Sign In" (Clerk auth)
2. Use Google or create account
3. Complete onboarding if needed

### Step 3: Create a Child Profile
1. Go to "Profiles" tab
2. Create a child (name, age, optional avatar)
3. Select the child

### Step 4: Test XP & Achievements
1. Click "🎮 XP & Achievements" tab
2. You should see:
   - Level 1, 0 XP initially
   - 5 available achievements (none earned yet)

### Step 5: Earn XP
1. Go to "Learn" tab
2. Select a Surah (1 or 112)
3. Set accuracy to "1.0 - Perfect"
4. Click word chips to submit attempts
5. Enable "Offline mode" and click several words
6. Go to "Progress" tab and click "Sync"

### Step 6: Check Gamification Results
1. Return to "🎮 XP & Achievements" tab
2. You should see:
   - XP increased (5 XP per word at 90%+ accuracy, +25 for perfect)
   - Green feedback box showing XP earned
   - "First Verse" achievement unlocked (⭐ +50 XP)
   - "Perfect Recitation" achievement unlocked (🏆 +100 XP)
   - Level may have increased
   - Progress bar updated

### Step 7: Verify Backend Status
1. Visit `/backend-status`
2. Check counts:
   - Achievement: 5 (seeded)
   - ChildAchievement: 1-2 (earned by your child)

## 📊 Expected Behavior

### XP Awards
| Action | XP Earned |
|--------|-----------|
| Word at 90%+ accuracy | 5 XP |
| Perfect accuracy (100%) | +25 XP bonus |
| First Verse achievement | +50 XP |
| Perfect Recitation achievement | +100 XP |

### Achievements
| Name | Trigger | Reward |
|------|---------|--------|
| First Verse ⭐ | Complete any verse | 50 XP |
| Perfect Recitation 🏆 | Get 100% accuracy | 100 XP |
| Week Streak 🔥 | 7-day streak | 150 XP |
| Surah Scholar 📖 | Complete a surah | 200 XP |
| Memorization Master 🧠 | Master 10 words | 100 XP |

### Level Progression
- Level 1: 0-99 XP
- Level 2: 100-299 XP
- Level 3: 300-599 XP
- Level 4: 600-999 XP
- Level 5: 1000-1499 XP
- ...and so on

## 🔍 API Testing (Optional)

You can also test the endpoints directly using the browser console or Postman:

```javascript
// Get XP status (replace childId)
fetch('/api/progress/xp?childId=YOUR_CHILD_ID')
  .then(r => r.json())
  .then(console.log);

// Get all achievements
fetch('/api/achievements')
  .then(r => r.json())
  .then(console.log);

// Get child's earned achievements
fetch('/api/children/YOUR_CHILD_ID/achievements')
  .then(r => r.json())
  .then(console.log);
```

## ✅ Success Criteria

- [x] XP tracked per child and persisted
- [x] Level calculated from XP
- [x] Achievement definitions in database (5 seeded)
- [x] Children can earn achievements
- [x] API endpoints return proper data
- [x] Build passes with no TypeScript errors
- [x] UI displays XP, level, and achievements
- [x] Real-time feedback on sync

## 🚀 Deployment Status

- **Branch**: `main`
- **Last Commit**: `4a26aae` - "feat: add Phase 2 gamification UI"
- **Vercel**: Auto-deploying from main branch
- **Database**: Supabase (achievements seeded locally, need to seed on production)

## ⚠️ Note

The achievements need to be seeded on the production database. Run:
```bash
npx tsx scripts/seed-achievements.ts
```

This will populate the 5 initial achievements in the production database.
