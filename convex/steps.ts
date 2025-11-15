import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Verify user owns the project
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) return [];

    return await ctx.db
      .query("steps")
      .withIndex("by_project_and_order", (q) => q.eq("projectId", args.projectId))
      .order("asc")
      .collect();
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify user owns the project
    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or unauthorized");
    }

    // Get the next order number
    const existingSteps = await ctx.db
      .query("steps")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    
    const nextOrder = existingSteps.length;
    const isFirstStep = nextOrder === 0;

    return await ctx.db.insert("steps", {
      projectId: args.projectId,
      title: args.title,
      description: args.description,
      order: nextOrder,
      isCompleted: false,
      isUnlocked: isFirstStep, // Only first step is unlocked initially
    });
  },
});

export const toggleComplete = mutation({
  args: { stepId: v.id("steps") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const step = await ctx.db.get(args.stepId);
    if (!step) throw new Error("Step not found");

    // Verify user owns the project
    const project = await ctx.db.get(step.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Can only toggle if step is unlocked
    if (!step.isUnlocked) {
      throw new Error("Step is locked");
    }

    const newCompletedState = !step.isCompleted;
    
    // Update the step
    await ctx.db.patch(args.stepId, {
      isCompleted: newCompletedState,
    });

    // If completing the step, unlock the next step
    if (newCompletedState) {
      const nextStep = await ctx.db
        .query("steps")
        .withIndex("by_project_and_order", (q) => 
          q.eq("projectId", step.projectId).eq("order", step.order + 1)
        )
        .unique();

      if (nextStep && !nextStep.isUnlocked) {
        await ctx.db.patch(nextStep._id, {
          isUnlocked: true,
        });
      }
    }
    // If uncompleting the step, lock all subsequent steps
    else {
      const subsequentSteps = await ctx.db
        .query("steps")
        .withIndex("by_project", (q) => q.eq("projectId", step.projectId))
        .filter((q) => q.gt(q.field("order"), step.order))
        .collect();

      for (const subsequentStep of subsequentSteps) {
        await ctx.db.patch(subsequentStep._id, {
          isCompleted: false,
          isUnlocked: false,
        });
      }
    }
  },
});

export const remove = mutation({
  args: { stepId: v.id("steps") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const step = await ctx.db.get(args.stepId);
    if (!step) throw new Error("Step not found");

    // Verify user owns the project
    const project = await ctx.db.get(step.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Unauthorized");
    }

    // Get all steps in the project
    const allSteps = await ctx.db
      .query("steps")
      .withIndex("by_project", (q) => q.eq("projectId", step.projectId))
      .collect();

    // Delete the step
    await ctx.db.delete(args.stepId);

    // Reorder remaining steps and update unlock status
    const remainingSteps = allSteps
      .filter(s => s._id !== args.stepId)
      .sort((a, b) => a.order - b.order);

    for (let i = 0; i < remainingSteps.length; i++) {
      const currentStep = remainingSteps[i];
      const shouldBeUnlocked = i === 0 || remainingSteps[i - 1].isCompleted;
      
      await ctx.db.patch(currentStep._id, {
        order: i,
        isUnlocked: shouldBeUnlocked,
        isCompleted: currentStep.isCompleted && shouldBeUnlocked,
      });
    }
  },
});
