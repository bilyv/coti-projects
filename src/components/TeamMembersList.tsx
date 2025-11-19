import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface TeamMembersListProps {
    projectId: Id<"projects">;
    isOwner: boolean;
}

export function TeamMembersList({ projectId, isOwner }: TeamMembersListProps) {
    const [removingMemberId, setRemovingMemberId] = useState<Id<"users"> | null>(null);
    const [changingPermissionId, setChangingPermissionId] = useState<Id<"users"> | null>(null);

    const members = useQuery(api.projectMembers.listProjectMembers, { projectId });
    const removeMember = useMutation(api.projectMembers.removeMember);
    const updatePermission = useMutation(api.projectMembers.updateMemberPermission);

    const handleRemoveMember = async (memberUserId: Id<"users">) => {
        if (!confirm("Are you sure you want to remove this team member?")) return;

        setRemovingMemberId(memberUserId);
        try {
            await removeMember({ projectId, memberUserId });
            toast.success("Team member removed");
        } catch (error) {
            toast.error("Failed to remove team member");
        } finally {
            setRemovingMemberId(null);
        }
    };

    const handleChangePermission = async (memberUserId: Id<"users">, currentPermission: string) => {
        const newPermission = currentPermission === "modify" ? "view" : "modify";
        setChangingPermissionId(memberUserId);
        try {
            await updatePermission({ projectId, memberUserId, permission: newPermission });
            toast.success(`Permission updated to ${newPermission === "modify" ? "Can Modify" : "View Only"}`);
        } catch (error) {
            toast.error("Failed to update permission");
        } finally {
            setChangingPermissionId(null);
        }
    };

    if (members === undefined) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    if (members.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-dark-700 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                </div>
                <p className="text-slate-600 dark:text-slate-400">No team members yet</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                    Invite team members to collaborate on this project
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {members.map((member) => (
                <div
                    key={member._id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-lg hover:shadow-sm transition-shadow"
                >
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {member.userName.charAt(0).toUpperCase()}
                        </div>

                        {/* Member Info */}
                        <div>
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                                {member.userName}
                            </div>
                            {member.userEmail && (
                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {member.userEmail}
                                </div>
                            )}
                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                Added {new Date(member.addedAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Permission Badge */}
                        <span className={`px-3 py-1 rounded-md text-xs font-medium ${member.permission === "modify"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                            }`}>
                            {member.permission === "modify" ? "Can Modify" : "View Only"}
                        </span>

                        {/* Actions (only for owner) */}
                        {isOwner && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleChangePermission(member.userId, member.permission)}
                                    disabled={changingPermissionId === member.userId}
                                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 dark:text-slate-400 dark:hover:bg-dark-700"
                                    title="Change permission"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleRemoveMember(member.userId)}
                                    disabled={removingMemberId === member.userId}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                    title="Remove member"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
