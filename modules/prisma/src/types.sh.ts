import type { Idea } from "@/idea/utils.sh"

// This file must be a module, so we include an empty export.
// export {}

declare global {
  namespace PrismaJson {
    // Define a type for a user's profile information.
    type IdeaLog = Idea.Log
  }
}
