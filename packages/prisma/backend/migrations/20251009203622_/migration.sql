/*
  Warnings:

  - You are about to drop the column `permissions` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "permissions",
ADD COLUMN     "specialPermissions" JSONB NOT NULL DEFAULT '{}';
