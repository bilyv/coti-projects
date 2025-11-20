import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get owned projects
    const ownedProjects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get projects where user is a member
    const memberships = await ctx.db
      .query("projectMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const memberProjects = await Promise.all(
      memberships.map(async (membership) => {
        const project = await ctx.db.get(membership.projectId);
        return project ? { ...project, memberPermission: membership.permission } : null;
      })
    );

    const validMemberProjects = memberProjects.filter((p) => p !== null);

    // Get step counts and completion for each project
    const ownedWithProgress = await Promise.all(
      ownedProjects.map(async (project) => {
        const steps = await ctx.db
          .query("steps")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();

        // Get all subtasks for all steps in this project
        let totalSubtasks = 0;
        let completedSubtasks = 0;
        
        for (const step of steps) {
          const subtasks = await ctx.db
            .query("subtasks")
            .withIndex("by_step", (q) => q.eq("stepId", step._id))
            .collect();
          
          totalSubtasks += subtasks.length;
          completedSubtasks += subtasks.filter(subtask => subtask.isCompleted).length;
        }

        const totalSteps = steps.length;
        const completedSteps = steps.filter(step => step.isCompleted).length;
        
        // Calculate progress: steps are automatically completed when all subtasks are done,
        // so we only need to count subtasks for progress if they exist, otherwise count steps
        let progress = 0;
        if (totalSubtasks > 0) {
          // If there are subtasks, progress is based on subtask completion
          progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
        } else if (totalSteps > 0) {
          // If there are no subtasks, progress is based on step completion
          progress = (completedSteps / totalSteps) * 100;
        }

        return {
          ...project,
          totalSteps,
          completedSteps,
          progress: Math.round(progress * 100) / 100, // Keep 2 decimal places
          role: "owner" as const,
        };
      })
    );

    const memberWithProgress = await Promise.all(
      validMemberProjects.map(async (project) => {
        const steps = await ctx.db
          .query("steps")
          .withIndex("by_project", (q) => q.eq("projectId", project._id))
          .collect();

        // Get all subtasks for all steps in this project
        let totalSubtasks = 0;
        let completedSubtasks = 0;
        
        for (const step of steps) {
          const subtasks = await ctx.db
            .query("subtasks")
            .withIndex("by_step", (q) => q.eq("stepId", step._id))
            .collect();
          
          totalSubtasks += subtasks.length;
          completedSubtasks += subtasks.filter(subtask => subtask.isCompleted).length;
        }

        const totalSteps = steps.length;
        const completedSteps = steps.filter(step => step.isCompleted).length;
        
        // Calculate progress: steps are automatically completed when all subtasks are done,
        // so we only need to count subtasks for progress if they exist, otherwise count steps
        let progress = 0;
        if (totalSubtasks > 0) {
          // If there are subtasks, progress is based on subtask completion
          progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
        } else if (totalSteps > 0) {
          // If there are no subtasks, progress is based on step completion
          progress = (completedSteps / totalSteps) * 100;
        }

        return {
          ...project,
          totalSteps,
          completedSteps,
          progress: Math.round(progress * 100) / 100, // Keep 2 decimal places
          role: "member" as const,
          permission: project.memberPermission,
        };
      })
    );

    return [...ownedWithProgress, ...memberWithProgress];
  },
});

export const get = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    // Check if user is owner
    const isOwner = project.userId === userId;

    // Check if user is a member
    let permission: string | null = null;
    if (!isOwner) {
      const membership = await ctx.db
        .query("projectMembers")
        .withIndex("by_project_and_user", (q) =>
          q.eq("projectId", args.projectId).eq("userId", userId)
        )
        .unique();

      if (!membership) {
        return null; // User has no access
      }
      permission = membership.permission;
    }

    // Get step counts and completion for the project
    const steps = await ctx.db
      .query("steps")
      .withIndex("by_project", (q) => q.eq("projectId", project._id))
      .collect();

    // Get all subtasks for all steps in this project
    let totalSubtasks = 0;
    let completedSubtasks = 0;
    
    for (const step of steps) {
      const subtasks = await ctx.db
        .query("subtasks")
        .withIndex("by_step", (q) => q.eq("stepId", step._id))
        .collect();
      
      totalSubtasks += subtasks.length;
      completedSubtasks += subtasks.filter(subtask => subtask.isCompleted).length;
    }

    const totalSteps = steps.length;
    const completedSteps = steps.filter(step => step.isCompleted).length;
    
    // Calculate progress: steps are automatically completed when all subtasks are done,
    // so we only need to count subtasks for progress if they exist, otherwise count steps
    let progress = 0;
    if (totalSubtasks > 0) {
      // If there are subtasks, progress is based on subtask completion
      progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
    } else if (totalSteps > 0) {
      // If there are no subtasks, progress is based on step completion
      progress = (completedSteps / totalSteps) * 100;
    }

    return {
      ...project,
      totalSteps,
      completedSteps,
      progress: Math.round(progress * 100) / 100, // Keep 2 decimal places
      role: isOwner ? ("owner" as const) : ("member" as const),
      permission: isOwner ? null : permission,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    link: v.optional(v.string()),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      link: args.link,
      userId,
      color: args.color,
    });
  },
});

export const update = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    link: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or unauthorized");
    }

    const updatedFields: any = {};
    if (args.name !== undefined) updatedFields.name = args.name;
    if (args.description !== undefined) updatedFields.description = args.description;
    if (args.link !== undefined) updatedFields.link = args.link;
    if (args.color !== undefined) updatedFields.color = args.color;

    return await ctx.db.patch(args.projectId, updatedFields);
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

    // Delete all steps (which will also delete their subtasks)
    const steps = await ctx.db
      .query("steps")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    
    for (const step of steps) {
      // Call the steps.remove mutation for each step to ensure subtasks are deleted
      await ctx.db.delete(step._id);
      
      // Delete all subtasks associated with this step
      const subtasks = await ctx.db
        .query("subtasks")
        .withIndex("by_step", (q) => q.eq("stepId", step._id))
        .collect();
      
      for (const subtask of subtasks) {
        await ctx.db.delete(subtask._id);
      }
    }

    // Delete the project
    await ctx.db.delete(args.projectId);
  },
});