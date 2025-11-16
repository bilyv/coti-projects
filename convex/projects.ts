import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get step counts and completion for each project
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const steps = await ctx.db
          .query("steps")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();
        
        const totalSteps = steps.length;
        const completedSteps = steps.filter(step => step.isCompleted).length;
        const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

        return {
          ...project,
          totalSteps,
          completedSteps,
          progress: Math.round(progress),
        };
      })
    );

    return projectsWithProgress;
  },
});

export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      return null;
    }

    // Get step counts and completion for the project
    const steps = await ctx.db
      .query("steps")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();
    
    const totalSteps = steps.length;
    const completedSteps = steps.filter(step => step.isCompleted).length;
    const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    return {
      ...project,
      totalSteps,
      completedSteps,
      progress: Math.round(progress),
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      userId,
      color: args.color,
    });
  },
});

export const remove = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or unauthorized");
    }

    // Delete all steps first
    const steps = await ctx.db
      .query("steps")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    
    for (const step of steps) {
      await ctx.db.delete(step._id);
    }

    // Delete the project
    await ctx.db.delete(args.projectId);
  },
});