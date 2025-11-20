import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ProgressCircle } from "./ProgressCircle";
import { CreateStepForm } from "./CreateStepForm";
import { StepList } from "./StepList";
import { Id } from "../../convex/_generated/dataModel";

interface Project {
  _id: Id<"projects">;
  name: string;
  description?: string;
  color: string;
  totalSteps: number;
  completedSteps: number;
  progress: number;
  link?: string;
  role: "owner" | "member";
  permission?: "view" | "modify" | null;
}

export function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [showCreateStep, setShowCreateStep] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);

  // Initialize theme from localStorage or system preference (fix for dark mode inheritance)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const project = useQuery(api.projects.get, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const steps = useQuery(api.steps.listByProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const updateProject = useMutation(api.projects.update);

  // Check if user has modify permission
  const canModify = project?.role === "owner" || project?.permission === "modify";

  // If projectId is invalid or project doesn't exist, redirect to home
  useEffect(() => {
    if (projectId && project === null) {
      navigate("/");
    }
  }, [project, projectId, navigate]);

  if (!projectId) {
    navigate("/");
    return null;
  }

  if (project === undefined || steps === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-900 dark:to-dark-800">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (project === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-900 dark:to-dark-800">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Project not found</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">The project you're looking for doesn't exist or has been deleted.</p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Truncate description for preview
  const truncateDescription = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const renderDescription = () => {
    if (!project.description) {
      return (
        <div className="flex items-start gap-3">
          <div className="mt-1 text-slate-400 dark:text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 italic">No description added yet</p>
          </div>
        </div>
      );
    }

    const isLongDescription = project.description.length > 200;
    const shouldTruncate = isLongDescription && !showFullDescription;

    return (
      <div className="mt-2">
        {shouldTruncate ? (
          <div
            className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: truncateDescription(project.description) }}
          />
        ) : (
          <div
            className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: project.description }}
          />
        )}
        {isLongDescription && (
          <button
            onClick={() => setShowDescriptionModal(true)}
            className="mt-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
          >
            {showFullDescription ? "Show Less" : "Read More"}
          </button>
        )}
      </div>
    );
  };

  // Render project link if it exists
  const renderProjectLink = () => {
    if (!project.link) return null;

    return (
      <div className="mt-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium break-all"
        >
          {project.link}
        </a>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-900 dark:to-dark-800 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Back to Projects</span>
          </button>
          {/* Edit Project Button */}
          {canModify && (
            <button
              onClick={() => navigate(`/project/${projectId}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              <span>Edit Project</span>
            </button>
          )}
        </div>

        {/* Project Header */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-700 p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">{project.name}</h1>
              {renderDescription()}
              {renderProjectLink()}
            </div>
            {/* Invite Button */}
            {project.role === "owner" && (
              <button
                onClick={() => alert('Invite functionality to be implemented')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Invite</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <ProgressCircle
                progress={project.progress}
                size={80}
                color={project.color}
              />
              <div>
                <div className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                  {project.completedSteps} of {project.totalSteps} steps completed
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  {project.progress.toFixed(1)}% progress
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Steps Section */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-700 p-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Steps</h2>

          {showCreateStep ? (
            <CreateStepForm
              projectId={project._id}
              onCancel={() => setShowCreateStep(false)}
              onSuccess={() => setShowCreateStep(false)}
            />
          ) : steps && steps.length > 0 ? (
            <StepList steps={steps} projectColor={project.color} canModify={canModify} />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-dark-700">
                <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2 dark:text-slate-200">No steps yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Add your first step to get started</p>
              {canModify && (
                <button
                  onClick={() => setShowCreateStep(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Add First Step
                </button>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Project Description Modal */}
      {showDescriptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 dark:bg-black/70">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col dark:bg-dark-800">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center dark:border-dark-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Project Description</h3>
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors dark:hover:bg-dark-700"
              >
                <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content with Scroll */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="prose max-w-none dark:prose-invert">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">{project.name}</h2>
                <div
                  className="text-slate-600 dark:text-slate-300 prose prose-slate dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: project.description || '' }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex justify-end dark:border-dark-700">
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}