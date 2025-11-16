import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { StepList } from "./StepList";
import { CreateStepForm } from "./CreateStepForm";
import { ProgressCircle } from "./ProgressCircle";
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

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [showCreateStep, setShowCreateStep] = useState(false);
  const steps = useQuery(api.steps.listByProject, { projectId: project._id });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 dark:bg-black/70">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col dark:bg-dark-800">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-dark-700">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-800 mb-1 dark:text-slate-100">
                {project.name}
              </h2>
              {project.description && (
                <p className="text-slate-600 dark:text-slate-300">{project.description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors dark:hover:bg-dark-700"
            >
              <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <ProgressCircle 
                progress={project.progress} 
                size={60}
                color={project.color}
              />
              <div>
                <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {showCreateStep ? (
            <CreateStepForm
              projectId={project._id}
              onCancel={() => setShowCreateStep(false)}
              onSuccess={() => setShowCreateStep(false)}
            />
          ) : (
            <StepList steps={steps} projectColor={project.color} />
          )}
        </div>
      </div>
    </div>
  );
}
