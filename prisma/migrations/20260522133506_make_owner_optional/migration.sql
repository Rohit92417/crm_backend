-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_refOwnerUserId_fkey";

-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "refOwnerUserId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_refOwnerUserId_fkey" FOREIGN KEY ("refOwnerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
