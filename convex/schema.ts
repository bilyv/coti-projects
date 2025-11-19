import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    link: v.optional(v.string()),
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

  subtasks: defineTable({
    stepId: v.id("steps"),
    title: v.string(),
    isCompleted: v.boolean(),
    order: v.number(),
  }).index("by_step", ["stepId"])
    .index("by_step_and_order", ["stepId", "order"]),

  projectMembers: defineTable({
    projectId: v.id("projects"),
    userId: v.id("users"),
    permission: v.string(), // "view" or "modify"
    addedAt: v.number(),
    addedBy: v.id("users"),
  }).index("by_project", ["projectId"])
    .index("by_user", ["userId"])
    .index("by_project_and_user", ["projectId", "userId"]),

  invitations: defineTable({
    projectId: v.id("projects"),
    invitedBy: v.id("users"),
    permission: v.string(), // "view" or "modify"
    token: v.string(),
    expiresAt: v.number(),
    status: v.string(), // "pending", "accepted", "declined", "expired"
    acceptedBy: v.optional(v.id("users")),
    acceptedAt: v.optional(v.number()),
  }).index("by_token", ["token"])
    .index("by_project", ["projectId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
