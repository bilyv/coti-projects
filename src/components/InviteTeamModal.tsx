import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface InviteTeamModalProps {
    onClose: () => void;
}

export function InviteTeamModal({ onClose }: InviteTeamModalProps) {
    const [selectedProjectId, setSelectedProjectId] = useState<Id<"projects"> | null>(null);
    const [selectedPermission, setSelectedPermission] = useState<"view" | "modify">("modify");
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showCopySuccess, setShowCopySuccess] = useState(false);

    const projects = useQuery(api.projects.list);
    const createInvitation = useMutation(api.invitations.createInvitation);

    // Filter to show only owned projects
    const ownedProjects = projects?.filter((p) => p.role === "owner") || [];

    const handleGenerateLink = async () => {
        if (!selectedProjectId) return;

        setIsGenerating(true);
        try {
            const token = await createInvitation({
                projectId: selectedProjectId,
                permission: selectedPermission,
            });
            const link = `${window.location.origin}/invite/${token}`;
            setInviteLink(link);
            toast.success("Invite link generated!");
        } catch (error) {
            toast.error("Failed to generate invite link");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyLink = async () => {
        if (!inviteLink) return;

        try {
            await navigator.clipboard.writeText(inviteLink);
            setShowCopySuccess(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setShowCopySuccess(false), 2000);
        } catch (error) {
            toast.error("Failed to copy link");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 dark:bg-black/70">
            <div className="bg-white rounded-xl p-6 max-w-md w-full dark:bg-dark-800 shadow-lg">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                        Invite Team Members
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors dark:hover:bg-dark-700"
                    >
                        <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Project Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">
                            Select Project
                        </label>
                        <select
                            value={selectedProjectId || ""}
                            onChange={(e) => setSelectedProjectId(e.target.value as Id<"projects">)}
                            className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-dark-800 dark:border-dark-700 dark:text-white"
                        >
                            <option value="">Choose a project...</option>
                            {ownedProjects.map((project) => (
                                <option key={project._id} value={project._id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Permission Selection */}
                    {selectedProjectId && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">
                                Permission Level
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors dark:border-dark-700 dark:hover:bg-dark-700">
                                    <input
                                        type="radio"
                                        name="permission"
                                        value="modify"
                                        checked={selectedPermission === "modify"}
                                        onChange={(e) => setSelectedPermission(e.target.value as "modify")}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <div className="ml-3">
                                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">Can Modify</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            Can edit project details, steps, and subtasks
                                        </div>
                                    </div>
                                </label>
                                <label className="flex items-center p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors dark:border-dark-700 dark:hover:bg-dark-700">
                                    <input
                                        type="radio"
                                        name="permission"
                                        value="view"
                                        checked={selectedPermission === "view"}
                                        onChange={(e) => setSelectedPermission(e.target.value as "view")}
                                        className="w-4 h-4 text-blue-600"
                                    />
                                    <div className="ml-3">
                                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">View Only</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            Can only view project details and progress
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Generate Link Button */}
                    {selectedProjectId && !inviteLink && (
                        <button
                            onClick={handleGenerateLink}
                            disabled={isGenerating}
                            className="w-full px-4 py-2.5 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? "Generating..." : "Generate Invite Link"}
                        </button>
                    )}

                    {/* Invite Link Display */}
                    {inviteLink && (
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Invite Link
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inviteLink}
                                    readOnly
                                    className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-50 dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                                />
                                <button
                                    onClick={handleCopyLink}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors dark:bg-dark-700 dark:hover:bg-dark-600"
                                >
                                    {showCopySuccess ? (
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Share this link with team members. It will expire in 7 days.
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full px-4 py-2.5 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
