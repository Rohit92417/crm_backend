/*
  Warnings:

  - You are about to drop the column `uuid` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `Pickup` table. All the data in the column will be lost.
  - You are about to drop the column `activeFrom` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `activeTo` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastLogin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `uuid` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Company_uuid_key";

-- DropIndex
DROP INDEX "Pickup_uuid_key";

-- DropIndex
DROP INDEX "User_uuid_key";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "uuid";

-- AlterTable
ALTER TABLE "Pickup" DROP COLUMN "uuid";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "activeFrom",
DROP COLUMN "activeTo",
DROP COLUMN "lastLogin",
DROP COLUMN "uuid";
