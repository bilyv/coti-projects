import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify user has access to the project
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    // Check if user is owner or member with modify permission
    const isOwner = project.userId === userId;
    let hasPermission = isOwner;

    if (!isOwner) {
      const membership = await ctx.db
        .query("projectMembers")
        .withIndex("by_project_and_user", (q) =>
          q.eq("projectId", args.projectId).eq("userId", userId)
        )
        .unique();

      if (membership && membership.permission === "modify") {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      throw new Error("Unauthorized to add notes to this project");
    }

    const now = Date.now();
    return await ctx.db.insert("notes", {
      projectId: args.projectId,
      content: args.content,
      createdAt: now,
      updatedAt: now,
      userId,
    });
  },
});

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Verify user has access to the project
    const project = await ctx.db.get(args.projectId);
    if (!project) return [];

    // Check if user is owner or member
    const isOwner = project.userId === userId;
    let hasAccess = isOwner;

    if (!isOwner) {
      const membership = await ctx.db
        .query("projectMembers")
        .withIndex("by_project_and_user", (q) =>
          q.eq("projectId", args.projectId).eq("userId", userId)
        )
        .unique();

      if (membership) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return [];
    }

    return await ctx.db
      .query("notes")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const remove = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const note = await ctx.db.get(args.noteId);
    if (!note) throw new Error("Note not found");

    // Verify user is the owner of the note
    if (note.userId !== userId) {
      throw new Error("Unauthorized to delete this note");
    }

    await ctx.db.delete(args.noteId);
  },
});

export const update = mutation({
  args: { 
    noteId: v.id("notes"),
    content: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const note = await ctx.db.get(args.noteId);
    if (!note) throw new Error("Note not found");

    // Verify user is the owner of the note
    if (note.userId !== userId) {
      throw new Error("Unauthorized to edit this note");
    }

    const now = Date.now();
    await ctx.db.patch(args.noteId, {
      content: args.content,
      updatedAt: now
    });
  },
});
