import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Mutations

export const createInvitation = mutation({
    args: {
        projectId: v.id("projects"),
        permission: v.string(),
    },
    returns: v.string(),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Verify user owns the project
        const project = await ctx.db.get(args.projectId);
        if (!project || project.userId !== userId) {
            throw new Error("Project not found or unauthorized");
        }

        // Validate permission
        if (args.permission !== "view" && args.permission !== "modify") {
            throw new Error("Invalid permission. Must be 'view' or 'modify'");
        }

        // Generate unique token
        const token = crypto.randomUUID();

        // Set expiration to 7 days from now
        const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

        // Insert invitation
        await ctx.db.insert("invitations", {
            projectId: args.projectId,
            invitedBy: userId,
            permission: args.permission,
            token,
            expiresAt,
            status: "pending",
        });

        return token;
    },
});

export const acceptInvitation = mutation({
    args: {
        token: v.string(),
    },
    returns: v.id("projects"),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        // Look up invitation by token
        const invitation = await ctx.db
            .query("invitations")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .unique();

        if (!invitation) {
            throw new Error("Invitation not found");
        }

        // Validate invitation
        if (invitation.status !== "pending") {
            throw new Error("Invitation has already been used or expired");
        }

        if (invitation.expiresAt < Date.now()) {
            // Update status to expired
            await ctx.db.patch(invitation._id, { status: "expired" });
            throw new Error("Invitation has expired");
        }

        // Check if user is already a member
        const existingMember = await ctx.db
            .query("projectMembers")
            .withIndex("by_project_and_user", (q) =>
                q.eq("projectId", invitation.projectId).eq("userId", userId)
            )
            .unique();

        if (existingMember) {
            throw new Error("You are already a member of this project");
        }

        // Check if user is the owner
        const project = await ctx.db.get(invitation.projectId);
        if (project && project.userId === userId) {
            throw new Error("You are the owner of this project");
        }

        // Insert into projectMembers
        await ctx.db.insert("projectMembers", {
            projectId: invitation.projectId,
            userId,
            permission: invitation.permission,
            addedAt: Date.now(),
            addedBy: invitation.invitedBy,
        });

        // Update invitation status
        await ctx.db.patch(invitation._id, {
            status: "accepted",
            acceptedBy: userId,
            acceptedAt: Date.now(),
        });

        return invitation.projectId;
    },
});

export const declineInvitation = mutation({
    args: {
        token: v.string(),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        // Look up invitation by token
        const invitation = await ctx.db
            .query("invitations")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .unique();

        if (!invitation) {
            throw new Error("Invitation not found");
        }

        // Update status to declined
        await ctx.db.patch(invitation._id, { status: "declined" });

        return null;
    },
});

export const revokeInvitation = mutation({
    args: {
        invitationId: v.id("invitations"),
    },
    returns: v.null(),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const invitation = await ctx.db.get(args.invitationId);
        if (!invitation) {
            throw new Error("Invitation not found");
        }

        // Verify user owns the project
        const project = await ctx.db.get(invitation.projectId);
        if (!project || project.userId !== userId) {
            throw new Error("Unauthorized");
        }

        // Update status to expired
        await ctx.db.patch(args.invitationId, { status: "expired" });

        return null;
    },
});

// Queries

export const getInvitationDetails = query({
    args: {
        token: v.string(),
    },
    returns: v.union(
        v.object({
            projectId: v.id("projects"),
            projectName: v.string(),
            projectColor: v.string(),
            inviterName: v.string(),
            permission: v.string(),
            expiresAt: v.number(),
            isExpired: v.boolean(),
            status: v.string(),
        }),
        v.null()
    ),
    handler: async (ctx, args) => {
        // Look up invitation by token
        const invitation = await ctx.db
            .query("invitations")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .unique();

        if (!invitation) {
            return null;
        }

        // Get project details
        const project = await ctx.db.get(invitation.projectId);
        if (!project) {
            return null;
        }

        // Get inviter details
        const inviter = await ctx.db.get(invitation.invitedBy);
        const inviterName = inviter?.name || inviter?.email || "Unknown";

        // Check if expired
        const isExpired = invitation.expiresAt < Date.now();

        return {
            projectId: invitation.projectId,
            projectName: project.name,
            projectColor: project.color,
            inviterName,
            permission: invitation.permission,
            expiresAt: invitation.expiresAt,
            isExpired,
            status: invitation.status,
        };
    },
});

export const listProjectInvitations = query({
    args: {
        projectId: v.id("projects"),
    },
    returns: v.array(
        v.object({
            _id: v.id("invitations"),
            token: v.string(),
            permission: v.string(),
            status: v.string(),
            expiresAt: v.number(),
            isExpired: v.boolean(),
            acceptedBy: v.optional(v.id("users")),
            acceptedAt: v.optional(v.number()),
        })
    ),
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);
        if (!userId) return [];

        // Verify user owns the project
        const project = await ctx.db.get(args.projectId);
        if (!project || project.userId !== userId) {
            return [];
        }

        // Get all invitations for the project
        const invitations = await ctx.db
            .query("invitations")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .collect();

        // Map to include isExpired flag
        return invitations.map((inv) => ({
            _id: inv._id,
            token: inv.token,
            permission: inv.permission,
            status: inv.status,
            expiresAt: inv.expiresAt,
            isExpired: inv.expiresAt < Date.now(),
            acceptedBy: inv.acceptedBy,
            acceptedAt: inv.acceptedAt,
        }));
    },
});
