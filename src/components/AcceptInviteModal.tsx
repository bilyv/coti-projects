import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface AcceptInviteModalProps {
    invitationToken: string;
    onClose: () => void;
    onAccept: (projectId: string) => void;
}

export function AcceptInviteModal({ invitationToken, onClose, onAccept }: AcceptInviteModalProps) {
    const [isAccepting, setIsAccepting] = useState(false);
    const [isDeclining, setIsDeclining] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const invitationDetails = useQuery(api.invitations.getInvitationDetails, {
        token: invitationToken,
    });
    const acceptInvitation = useMutation(api.invitations.acceptInvitation);
    const declineInvitation = useMutation(api.invitations.declineInvitation);

    const handleAccept = async () => {
        setIsAccepting(true);
        try {
            const projectId = await acceptInvitation({ token: invitationToken });
            setShowSuccess(true);
            toast.success("Successfully joined the team!");
            setTimeout(() => {
                onAccept(projectId);
            }, 1500);
        } catch (error: any) {
            toast.error(error.message || "Failed to accept invitation");
            setIsAccepting(false);
        }
    };

    const handleDecline = async () => {
        setIsDeclining(true);
        try {
            await declineInvitation({ token: invitationToken });
            toast.info("Invitation declined");
            onClose();
        } catch (error) {
            toast.error("Failed to decline invitation");
            setIsDeclining(false);
        }
    };

    if (invitationDetails === undefined) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 dark:bg-black/70">
                <div className="bg-white rounded-xl p-8 max-w-md w-full dark:bg-dark-800 shadow-lg">
                    <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!invitationDetails || invitationDetails.status !== "pending") {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 dark:bg-black/70">
                <div className="bg-white rounded-xl p-8 max-w-md w-full dark:bg-dark-800 shadow-lg text-center">
                    <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                        Invalid Invitation
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        This invitation link is invalid, has expired, or has already been used.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors dark:bg-dark-700 dark:hover:bg-dark-600 dark:text-white"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    if (invitationDetails.isExpired) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 dark:bg-black/70">
                <div className="bg-white rounded-xl p-8 max-w-md w-full dark:bg-dark-800 shadow-lg text-center">
                    <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                        Invitation Expired
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        This invitation link has expired. Please request a new invitation from the project owner.
                    </p>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors dark:bg-dark-700 dark:hover:bg-dark-600 dark:text-white"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    if (showSuccess) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 dark:bg-black/70">
                <div className="bg-white rounded-xl p-8 max-w-md w-full dark:bg-dark-800 shadow-lg text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 animate-bounce">
                        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
                        Welcome to the Team!
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                        You've successfully joined the project.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 dark:bg-black/70">
            <div className="bg-white rounded-xl p-6 max-w-md w-full dark:bg-dark-800 shadow-lg">
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                        Team Invitation
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
                    {/* Project Info */}
                    <div className="p-4 bg-slate-50 dark:bg-dark-700 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: invitationDetails.projectColor }}
                            >
                                {invitationDetails.projectName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                                    {invitationDetails.projectName}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Invited by {invitationDetails.inviterName}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Permission:</span>
                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${invitationDetails.permission === "modify"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                    : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                                }`}>
                                {invitationDetails.permission === "modify" ? "Can Modify" : "View Only"}
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {invitationDetails.permission === "modify"
                            ? "You'll be able to edit project details, steps, and subtasks."
                            : "You'll be able to view project details and progress."}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleDecline}
                            disabled={isDeclining || isAccepting}
                            className="flex-1 px-4 py-2.5 text-sm border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:border-dark-700 dark:text-slate-300 dark:hover:bg-dark-700"
                        >
                            {isDeclining ? "Declining..." : "Decline"}
                        </button>
                        <button
                            onClick={handleAccept}
                            disabled={isAccepting || isDeclining}
                            className="flex-1 px-4 py-2.5 text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAccepting ? "Accepting..." : "Accept Invitation"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
