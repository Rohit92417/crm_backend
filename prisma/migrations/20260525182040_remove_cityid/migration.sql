/*
  Warnings:

  - You are about to drop the column `cityId` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `cityId` on the `RDInfo` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_cityId_fkey";

-- DropForeignKey
ALTER TABLE "RDInfo" DROP CONSTRAINT "RDInfo_cityId_fkey";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "cityId";

-- AlterTable
ALTER TABLE "RDInfo" DROP COLUMN "cityId";
