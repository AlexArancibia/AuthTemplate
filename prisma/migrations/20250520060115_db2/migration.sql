/*
  Warnings:

  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "clefast"."AddressType" AS ENUM ('shipping', 'billing', 'both');

-- AlterTable
ALTER TABLE "clefast"."User" ADD COLUMN     "acceptsMarketing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "taxId" TEXT;

-- DropTable
DROP TABLE "clefast"."Product";

-- CreateTable
CREATE TABLE "clefast"."Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "addressType" "clefast"."AddressType" NOT NULL DEFAULT 'both',
    "address1" TEXT NOT NULL,
    "address2" TEXT,
    "city" TEXT NOT NULL,
    "province" TEXT,
    "zip" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "clefast"."Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "clefast"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
