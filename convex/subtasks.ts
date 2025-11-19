import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    stepId: v.id("steps"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify user owns the step's project
    const step = await ctx.db.get(args.stepId);
    if (!step) throw new Error("Step not found");

    const project = await ctx.db.get(step.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Get the next order number
    const existingSubtasks = await ctx.db
      .query("subtasks")
      .withIndex("by_step", (q) => q.eq("stepId", args.stepId))
      .collect();
    
    const nextOrder = existingSubtasks.length;

    return await ctx.db.insert("subtasks", {
      stepId: args.stepId,
      title: args.title,
      isCompleted: false,
      order: nextOrder,
    });
  },
});

export const listByStep = query({
  args: { stepId: v.id("steps") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Verify user owns the step's project
    const step = await ctx.db.get(args.stepId);
    if (!step) return [];

    const project = await ctx.db.get(step.projectId);
    if (!project || project.userId !== userId) return [];

    const subtasks = await ctx.db
      .query("subtasks")
      .withIndex("by_step", (q) => q.eq("stepId", args.stepId))
      .collect();
    
    return subtasks.sort((a, b) => a.order - b.order);
  },
});

export const toggleComplete = mutation({
  args: { subtaskId: v.id("subtasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const subtask = await ctx.db.get(args.subtaskId);
    if (!subtask) throw new Error("Subtask not found");

    // Verify user owns the subtask's project
    const step = await ctx.db.get(subtask.stepId);
    if (!step) throw new Error("Step not found");

    const project = await ctx.db.get(step.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const newCompletedState = !subtask.isCompleted;
    
    await ctx.db.patch(args.subtaskId, {
      isCompleted: newCompletedState,
    });

    return newCompletedState;
  },
});

export const remove = mutation({
  args: { subtaskId: v.id("subtasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const subtask = await ctx.db.get(args.subtaskId);
    if (!subtask) throw new Error("Subtask not found");

    // Verify user owns the subtask's project
    const step = await ctx.db.get(subtask.stepId);
    if (!step) throw new Error("Step not found");

    const project = await ctx.db.get(step.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Get all subtasks in the step
    const allSubtasks = await ctx.db
      .query("subtasks")
      .withIndex("by_step", (q) => q.eq("stepId", subtask.stepId))
      .collect();

    // Delete the subtask
    await ctx.db.delete(args.subtaskId);

    // Reorder remaining subtasks
    const remainingSubtasks = allSubtasks
      .filter(s => s._id !== args.subtaskId)
      .sort((a, b) => a.order - b.order);

    for (let i = 0; i < remainingSubtasks.length; i++) {
      await ctx.db.patch(remainingSubtasks[i]._id, {
        order: i,
      });
    }
  },
});

export const update = mutation({
  args: {
    subtaskId: v.id("subtasks"),
    title: v.string(),
    isCompleted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const subtask = await ctx.db.get(args.subtaskId);
    if (!subtask) throw new Error("Subtask not found");

    // Verify user owns the subtask's project
    const step = await ctx.db.get(subtask.stepId);
    if (!step) throw new Error("Step not found");

    const project = await ctx.db.get(step.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Update the subtask
    await ctx.db.patch(args.subtaskId, {
      title: args.title,
      isCompleted: args.isCompleted,
    });

    return args.subtaskId;
  },
});
