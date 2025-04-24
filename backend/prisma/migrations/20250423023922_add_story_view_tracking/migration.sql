-- AlterTable
ALTER TABLE "stories" ADD COLUMN     "uniqueViewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "story_views" (
    "id" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storyId" TEXT NOT NULL,
    "userId" TEXT,

    CONSTRAINT "story_views_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "story_views" ADD CONSTRAINT "story_views_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_views" ADD CONSTRAINT "story_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
