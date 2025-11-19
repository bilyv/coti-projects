import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Queries

export const listProjectMembers = query({
    args: {
        projectId: v.id("projects"),
    },
    returns: v.array(
        v.object({
            _id: v.id("projectMembers"),
            userId: v.id("users"),
            userName: v.string(),
            userEmail: v.optional(v.string()),
            permission: v.string(),
            addedAt: v.number(),
            addedBy: v.id("users"),
        })
    ),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        // Verify user has access to the project (is owner or member)
        const project = await ctx.db.get(args.projectId);
        if (!project) return [];

        const isOwner = project.userId === userId;
        const isMember = await ctx.db
            .query("projectMembers")
            .withIndex("by_project_and_user", (q) =>
                q.eq("projectId", args.projectId).eq("userId", userId)
            )
            .unique();

        if (!isOwner && !isMember) {
            return [];
        }

        // Get all members
        const members = await ctx.db
            .query("projectMembers")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .collect();

        // Fetch user details for each member
        const result = await Promise.all(
            members.map(async (member) => {
                const user = await ctx.db.get(member.userId);
                if (!user) return null;

                return {
                    _id: member._id,
                    userId: member.userId,
                    userName: user.name || user.email || "Unknown",
                    userEmail: user.email,
                    permission: member.permission,
                    addedAt: member.addedAt,
                    addedBy: member.addedBy,
                };
            })
        );

        return result.filter((r) => r !== null);
    },
});

export const getUserProjects = query({
    args: {},
    returns: v.array(
        v.object({
            _id: v.id("projects"),
            name: v.string(),
            description: v.optional(v.string()),
            link: v.optional(v.string()),
            color: v.string(),
            permission: v.string(),
            totalSteps: v.number(),
            completedSteps: v.number(),
            progress: v.number(),
        })
    ),
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        // Get all projects where user is a member
        const memberships = await ctx.db
            .query("projectMembers")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        // Fetch project details for each membership
        const result = await Promise.all(
            memberships.map(async (membership) => {
                const project = await ctx.db.get(membership.projectId);
                if (!project) return null;

                // Get step counts and completion
                const steps = await ctx.db
                    .query("steps")
                    .withIndex("by_project", (q) => q.eq("projectId", project._id))
                    .collect();

                const totalSteps = steps.length;
                const completedSteps = steps.filter((step) => step.isCompleted).length;
                const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

                return {
                    _id: project._id,
                    name: project.name,
                    description: project.description,
                    link: project.link,
                    color: project.color,
                    permission: membership.permission,
                    totalSteps,
                    completedSteps,
                    progress: Math.round(progress),
                };
            })
        );

        return result.filter((r) => r !== null);
    },
});

export const checkUserPermission = query({
    args: {
        projectId: v.id("projects"),
        userId: v.id("users"),
    },
    returns: v.union(
        v.literal("owner"),
        v.literal("modify"),
        v.literal("view"),
        v.null()
    ),
    handler: async (ctx, args) => {
        // Check if user is the owner
        const project = await ctx.db.get(args.projectId);
        if (project && project.userId === args.userId) {
            return "owner";
        }

        // Check if user is a member
        const membership = await ctx.db
            .query("projectMembers")
            .withIndex("by_project_and_user", (q) =>
                q.eq("projectId", args.projectId).eq("userId", args.userId)
            )
            .unique();

        if (membership) {
            return membership.permission as "modify" | "view";
        }

        return null;
    },
});

// Mutations

export const removeMember = mutation({
    args: {
        projectId: v.id("projects"),
        memberUserId: v.id("users"),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Verify requester is the project owner
        const project = await ctx.db.get(args.projectId);
        if (!project || project.userId !== userId) {
            throw new Error("Unauthorized. Only project owner can remove members");
        }

        // Find and delete the membership
        const membership = await ctx.db
            .query("projectMembers")
            .withIndex("by_project_and_user", (q) =>
                q.eq("projectId", args.projectId).eq("userId", args.memberUserId)
            )
            .unique();

        if (membership) {
            await ctx.db.delete(membership._id);
        }

        return null;
    },
});

export const updateMemberPermission = mutation({
    args: {
        projectId: v.id("projects"),
        memberUserId: v.id("users"),
        permission: v.string(),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Validate permission
        if (args.permission !== "view" && args.permission !== "modify") {
            throw new Error("Invalid permission. Must be 'view' or 'modify'");
        }

        // Verify requester is the project owner
        const project = await ctx.db.get(args.projectId);
        if (!project || project.userId !== userId) {
            throw new Error("Unauthorized. Only project owner can update permissions");
        }

        // Find and update the membership
        const membership = await ctx.db
            .query("projectMembers")
            .withIndex("by_project_and_user", (q) =>
                q.eq("projectId", args.projectId).eq("userId", args.memberUserId)
            )
            .unique();

        if (membership) {
            await ctx.db.patch(membership._id, { permission: args.permission });
        }

        return null;
    },
});
