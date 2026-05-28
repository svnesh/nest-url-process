-- CreateTable
CREATE TABLE "processed_content" (
    "id" SERIAL NOT NULL,
    "urlJobId" INTEGER NOT NULL,
    "contentType" TEXT NOT NULL,
    "extracted" JSONB NOT NULL,

    CONSTRAINT "processed_content_pkey" PRIMARY KEY ("id")
);
