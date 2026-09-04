-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'STAFF';

-- AlterEnum
ALTER TYPE "TableStatus" ADD VALUE 'PENDING';

-- DropIndex
DROP INDEX "TableSession_guestToken_key";

-- CreateIndex
CREATE INDEX "TableSession_guestToken_idx" ON "TableSession"("guestToken");
