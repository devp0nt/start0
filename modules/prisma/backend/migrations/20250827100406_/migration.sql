-- AlterTable
ALTER TABLE "public"."Idea" ADD COLUMN     "logs" JSONB[] DEFAULT ARRAY[]::JSONB[];
