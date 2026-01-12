-- CreateTable
CREATE TABLE "ParentUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clerkUserId" TEXT NOT NULL,
    "dob" DATETIME NOT NULL,
    "consentAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ChildProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "avatar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChildProfile_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ParentUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Surah" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Verse" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "surahId" INTEGER NOT NULL,
    "verseNumber" INTEGER NOT NULL,
    "textArabic" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "transliteration" TEXT NOT NULL,
    CONSTRAINT "Verse_surahId_fkey" FOREIGN KEY ("surahId") REFERENCES "Surah" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Word" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "verseId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "textArabic" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "transliteration" TEXT NOT NULL,
    "audioUrl" TEXT,
    CONSTRAINT "Word_verseId_fkey" FOREIGN KEY ("verseId") REFERENCES "Verse" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childId" TEXT NOT NULL,
    "wordId" INTEGER NOT NULL,
    "accuracy" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceAttemptId" TEXT NOT NULL,
    CONSTRAINT "Attempt_childId_fkey" FOREIGN KEY ("childId") REFERENCES "ChildProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Attempt_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Mastery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "childId" TEXT NOT NULL,
    "wordId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "streak" INTEGER NOT NULL,
    "lastAttemptAt" DATETIME NOT NULL,
    CONSTRAINT "Mastery_childId_fkey" FOREIGN KEY ("childId") REFERENCES "ChildProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Mastery_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ParentUser_clerkUserId_key" ON "ParentUser"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Attempt_deviceAttemptId_key" ON "Attempt"("deviceAttemptId");

-- CreateIndex
CREATE UNIQUE INDEX "Mastery_childId_wordId_key" ON "Mastery"("childId", "wordId");
