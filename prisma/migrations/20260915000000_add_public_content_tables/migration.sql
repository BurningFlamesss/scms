-- Public content collections so the -page-detail routes are driven from the
-- database: faculty directory, notice board and scholarship schemes.

CREATE TABLE "faculty_member" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "subjects" JSONB NOT NULL,
    "email" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "officeHours" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "joined" TEXT NOT NULL,
    "leadership" BOOLEAN NOT NULL DEFAULT false,
    "rank" INTEGER,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculty_member_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "faculty_member_slug_key" ON "faculty_member"("slug");
CREATE INDEX "faculty_member_leadership_idx" ON "faculty_member"("leadership");
CREATE INDEX "faculty_member_department_idx" ON "faculty_member"("department");

CREATE TABLE "notice" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "dateAd" TEXT NOT NULL,
    "dateBs" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "issuedBy" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "body" JSONB NOT NULL,
    "bullets" JSONB,
    "table" JSONB,
    "attachments" JSONB NOT NULL,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notice_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notice_category_idx" ON "notice"("category");
CREATE INDEX "notice_pinned_idx" ON "notice"("pinned");

CREATE TABLE "scholarship" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nepaliName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "coverage" INTEGER NOT NULL,
    "award" TEXT NOT NULL,
    "amountNpr" INTEGER NOT NULL,
    "seats" INTEGER NOT NULL,
    "deadlineAd" TEXT NOT NULL,
    "deadlineBs" TEXT NOT NULL,
    "appliesTo" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eligibility" JSONB NOT NULL,
    "benefits" JSONB NOT NULL,
    "documents" JSONB NOT NULL,
    "process" JSONB NOT NULL,
    "renewal" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "spotlight" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scholarship_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "scholarship_category_idx" ON "scholarship"("category");