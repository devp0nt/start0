-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "AdminPermission" AS ENUM ('manageAdmins', 'viewUsers', 'manageUsers');

-- CreateEnum
CREATE TYPE "UserPermission" AS ENUM ('useBetaFeatures');

-- CreateEnum
CREATE TYPE "ActionLogActorType" AS ENUM ('admin', 'user', 'system');

-- CreateTable
CREATE TABLE "Admin" (
    "dangerServerOnlyProperty" BOOLEAN NOT NULL DEFAULT true,
    "id" TEXT NOT NULL,
    "sn" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authTokenSource" TEXT NOT NULL,
    "permissions" "AdminPermission"[] DEFAULT ARRAY[]::"AdminPermission"[],
    "bannedAt" TIMESTAMP(3),
    "banReason" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "dangerServerOnlyProperty" BOOLEAN NOT NULL DEFAULT true,
    "id" TEXT NOT NULL,
    "sn" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authTokenSource" TEXT NOT NULL,
    "permissions" "UserPermission"[] DEFAULT ARRAY[]::"UserPermission"[],
    "bannedAt" TIMESTAMP(3),
    "banReason" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "dangerServerOnlyProperty" BOOLEAN NOT NULL DEFAULT true,
    "id" TEXT NOT NULL,
    "sn" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionLog" (
    "dangerServerOnlyProperty" BOOLEAN NOT NULL DEFAULT true,
    "id" TEXT NOT NULL,
    "sn" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "action" TEXT NOT NULL,
    "descripton" TEXT,
    "data" JSONB NOT NULL,
    "actorType" "ActionLogActorType" NOT NULL,
    "ip" TEXT,
    "country" TEXT,
    "adminId" TEXT,
    "userId" TEXT,
    "projectId" TEXT,

    CONSTRAINT "ActionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FrequencyLog" (
    "dangerServerOnlyProperty" BOOLEAN NOT NULL DEFAULT true,
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "procedureName" TEXT NOT NULL,
    "ip" TEXT,
    "userId" TEXT,
    "adminId" TEXT,
    "phone" TEXT,
    "email" TEXT,

    CONSTRAINT "FrequencyLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_sn_key" ON "Admin"("sn");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_authTokenSource_key" ON "Admin"("authTokenSource");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_sn_key" ON "User"("sn");

-- CreateIndex
CREATE UNIQUE INDEX "User_authTokenSource_key" ON "User"("authTokenSource");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Project_sn_key" ON "Project"("sn");

-- CreateIndex
CREATE UNIQUE INDEX "ActionLog_sn_key" ON "ActionLog"("sn");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionLog" ADD CONSTRAINT "ActionLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionLog" ADD CONSTRAINT "ActionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionLog" ADD CONSTRAINT "ActionLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
