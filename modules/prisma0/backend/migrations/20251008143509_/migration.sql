/*
  Warnings:

  - The primary key for the `AdminUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `AdminUser` table. All the data in the column will be lost.
  - The primary key for the `MemberUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `MemberUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."AdminUser" DROP CONSTRAINT "AdminUser_pkey",
DROP COLUMN "id";

-- AlterTable
ALTER TABLE "public"."MemberUser" DROP CONSTRAINT "MemberUser_pkey",
DROP COLUMN "id";
