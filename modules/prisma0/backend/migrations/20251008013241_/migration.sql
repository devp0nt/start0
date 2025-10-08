/*
  Warnings:

  - You are about to drop the column `memberUserId` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `MemberUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `MemberUser` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_memberUserId_fkey";

-- DropIndex
DROP INDEX "public"."User_memberUserId_key";

-- AlterTable
ALTER TABLE "public"."MemberUser" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "memberUserId";

-- CreateIndex
CREATE UNIQUE INDEX "MemberUser_userId_key" ON "public"."MemberUser"("userId");

-- AddForeignKey
ALTER TABLE "public"."MemberUser" ADD CONSTRAINT "MemberUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
