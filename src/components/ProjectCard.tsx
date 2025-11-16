import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ProjectModal } from "./ProjectModal";
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

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const removeProject = useMutation(api.projects.remove);

  // Convert hex color to rgba with higher opacity for more visible background
  const getBackgroundColor = (hexColor: string) => {
    // Remove # if present
    const cleanHex = hexColor.replace('#', '');
    
    // Parse r, g, b values
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    
    // Return rgba with higher opacity (increased from 0.05 to 0.15)
    return `rgba(${r}, ${g}, ${b}, 0.15)`;
  };

  const handleDelete = async () => {
    await removeProject({ projectId: project._id });
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div 
        className="rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-slate-100 hover:border-slate-200 group dark:border-dark-700 dark:hover:border-dark-600"
        style={{ 
          backgroundColor: getBackgroundColor(project.color),
        }}
        onClick={() => setShowModal(true)}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800 text-lg mb-1 group-hover:text-blue-600 transition-colors dark:text-slate-100 dark:group-hover:text-blue-400">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-slate-600 text-sm line-clamp-2 dark:text-slate-400">
                {project.description}
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ProgressCircle 
              progress={project.progress} 
              size={48}
              color={project.color}
            />
            <div>
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {project.completedSteps} of {project.totalSteps} steps
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {project.progress}% complete
              </div>
            </div>
          </div>
          
          <div 
            className="w-4 h-4 rounded-full border-2 border-white shadow-sm dark:border-dark-800"
            style={{ backgroundColor: project.color }}
          ></div>
        </div>
      </div>

      {showModal && (
        <ProjectModal 
          project={project} 
          onClose={() => setShowModal(false)} 
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 dark:bg-black/70">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full dark:bg-dark-800">
            <h3 className="text-lg font-semibold text-slate-800 mb-2 dark:text-slate-100">
              Delete Project
            </h3>
            <p className="text-slate-600 mb-6 dark:text-slate-300">
              Are you sure you want to delete "{project.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors dark:border-dark-700 dark:text-slate-300 dark:hover:bg-dark-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors dark:bg-red-600 dark:hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
