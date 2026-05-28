/*
  Warnings:

  - The `status` column on the `url_collection` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `updatedAt` on table `url_collection` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "URLJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "url_collection" ADD COLUMN     "error" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "URLJobStatus" DEFAULT 'PENDING',
ALTER COLUMN "updatedAt" SET NOT NULL;
