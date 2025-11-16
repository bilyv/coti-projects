import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ProjectCard } from "./ProjectCard";

export function ProjectList() {
  const projects = useQuery(api.projects.list);

  if (projects === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse dark:bg-dark-800">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-3 dark:bg-slate-700"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2 mb-4 dark:bg-slate-700"></div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-200 rounded-full dark:bg-slate-700"></div>
              <div className="h-3 bg-slate-200 rounded w-20 dark:bg-slate-700"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 dark:from-blue-900/30 dark:to-purple-900/30">
          <svg className="w-12 h-12 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2 dark:text-slate-200">No projects yet</h3>
        <p className="text-slate-600 dark:text-slate-400">Create your first project to start tracking progress</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project._id} project={project} />
      ))}
    </div>
  );
}
