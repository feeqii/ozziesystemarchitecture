export type FocusArea = "Auth" | "Content" | "Progress" | "Offline Sync";

export const focusAreas: FocusArea[] = [
  "Auth",
  "Content",
  "Progress",
  "Offline Sync",
];

const systemBase = `flowchart LR
  user([Parent & Child]) --> clerk[Clerk Auth]
  clerk --> nextapp[Next.js Demo Portal]
  nextapp --> api[API Routes]
  api --> prisma[Prisma ORM]
  prisma --> db[(SQLite / Postgres)]
  seeded[Seeded Quran Content] --> db
  api --> progress[Progress & Mastery]
  nextapp --> docs[API Docs + Postman]
  progress --> docs`;

const systemAuth = `flowchart LR
  user([Parent & Child]) --> clerk[Clerk Auth]
  clerk --> nextapp[Next.js Demo Portal]
  nextapp --> api[API Routes]
  api --> prisma[Prisma ORM]
  prisma --> db[(Parent + Child Tables)]
  classDef focus fill:#dff6ee,stroke:#1c7c6f,color:#0f172a;
  class clerk,nextapp,db focus`;

const systemContent = `flowchart LR
  api[API Routes] --> prisma[Prisma ORM]
  prisma --> db[(Content Tables)]
  seeded[Seeded Quran Content] --> db
  nextapp[Next.js Demo Portal] --> api
  classDef focus fill:#faefd4,stroke:#c27b22,color:#0f172a;
  class seeded,db,api focus`;

const systemProgress = `flowchart LR
  nextapp[Next.js Demo Portal] --> api[API Routes]
  api --> progress[Attempts + Mastery]
  progress --> prisma[Prisma ORM]
  prisma --> db[(Progress Tables)]
  classDef focus fill:#e6f0ff,stroke:#2d6cdf,color:#0f172a;
  class progress,api,db focus`;

const systemOffline = `flowchart LR
  device[Offline Queue] --> api[Sync Endpoint]
  api --> prisma[Prisma ORM]
  prisma --> db[(Attempts + Mastery)]
  api --> summary[Progress Summary]
  classDef focus fill:#efe9ff,stroke:#6b5bd6,color:#0f172a;
  class device,api,summary focus`;

export const systemOverview: Record<"Default" | FocusArea, string> = {
  Default: systemBase,
  Auth: systemAuth,
  Content: systemContent,
  Progress: systemProgress,
  "Offline Sync": systemOffline,
};

export const sequenceDiagram = `sequenceDiagram
  participant Parent
  participant Clerk
  participant Demo as Next.js Demo
  participant API
  participant DB

  Parent->>Clerk: Sign up / Sign in
  Clerk-->>Demo: Session token
  Parent->>Demo: Complete onboarding (DOB + consent)
  Demo->>API: POST /api/me
  API->>DB: Save ParentUser
  Parent->>Demo: Create/select child
  Demo->>API: POST /api/children
  API->>DB: Save ChildProfile
  Parent->>Demo: Fetch Surah content
  Demo->>API: GET /api/content/surahs/1
  API->>DB: Load verses + words
  Parent->>Demo: Tap word chip
  Demo->>API: POST /api/progress/attempt
  API->>DB: Save Attempt + update Mastery
  Parent->>Demo: Offline queue enabled
  Demo-->>Demo: Store attempts locally
  Parent->>Demo: Sync queue
  Demo->>API: POST /api/progress/sync
  API->>DB: Upsert Attempts + Mastery
  Demo->>API: GET /api/progress/summary
  API->>DB: Aggregate progress`;

export const erDiagram = `erDiagram
  ParentUser ||--o{ ChildProfile : has
  ChildProfile ||--o{ Attempt : logs
  ChildProfile ||--o{ Mastery : tracks
  Surah ||--o{ Verse : contains
  Verse ||--o{ Word : contains
  Word ||--o{ Attempt : measured
  Word ||--o{ Mastery : mastered`;
