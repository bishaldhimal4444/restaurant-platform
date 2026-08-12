/*
  Warnings:

  - A unique constraint covering the columns `[guestToken]` on the table `TableSession` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TableSession" ADD COLUMN     "guestToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TableSession_guestToken_key" ON "TableSession"("guestToken");
