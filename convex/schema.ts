import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),
    color: v.string(),
  }).index("by_user", ["userId"]),

  steps: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
    isCompleted: v.boolean(),
    isUnlocked: v.boolean(),
  }).index("by_project", ["projectId"])
    .index("by_project_and_order", ["projectId", "order"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
