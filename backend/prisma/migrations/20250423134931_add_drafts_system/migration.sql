-- CreateEnum
CREATE TYPE "DraftType" AS ENUM ('STORY', 'CHAPTER');

-- CreateTable
CREATE TABLE "drafts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "DraftType" NOT NULL,
    "storyId" TEXT,
    "chapterNumber" INTEGER,
    "coverImage" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "drafts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
