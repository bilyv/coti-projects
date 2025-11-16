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
}

export function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [showCreateStep, setShowCreateStep] = useState(false);
  
  const project = useQuery(api.projects.get, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const steps = useQuery(api.steps.listByProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-dark-900 dark:to-dark-800">
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
        </div>

        {/* Project Header */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-700 p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">{project.name}</h1>
              {project.description && (
                <p className="text-slate-600 dark:text-slate-400">{project.description}</p>
              )}
            </div>
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
                  {project.progress}% progress
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowCreateStep(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all text-sm font-medium"
            >
              Add Step
            </button>
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
            <StepList steps={steps} projectColor={project.color} />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-dark-700">
                <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2 dark:text-slate-200">No steps yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Add your first step to get started</p>
              <button
                onClick={() => setShowCreateStep(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Add First Step
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}