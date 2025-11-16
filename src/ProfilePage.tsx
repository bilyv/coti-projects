import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";

export function ProfilePage({ onClose }: { onClose: () => void }) {
  const user = useQuery(api.auth.loggedInUser);
  const projects = useQuery(api.projects.list);
  
  // Generate mock contribution data (in a real app, this would come from the backend)
  const [contributions] = useState(() => {
    const data = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 5), // Random contributions between 0-4
      });
    }
    return data;
  });

  // Calculate statistics
  const totalProjects = projects?.length || 0;
  const totalSteps = projects?.reduce((sum, project) => sum + project.totalSteps, 0) || 0;
  const completedSteps = projects?.reduce((sum, project) => sum + project.completedSteps, 0) || 0;
  const completionRate = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Group contributions by week for the graph
  const groupedContributions = () => {
    const weeks = [];
    for (let i = 0; i < contributions.length; i += 7) {
      const week = contributions.slice(i, i + 7);
      weeks.push(week);
    }
    return weeks;
  };

  const weeks = groupedContributions();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 dark:bg-black/70">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto dark:bg-dark-800">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-dark-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors dark:hover:bg-dark-700"
            >
              <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {/* User Info */}
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                {user?.name || 'User'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {user?.email}
              </p>
              <div className="flex gap-4 mt-2">
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {totalProjects}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Projects
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {completionRate}%
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Completed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {completedSteps}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Steps Done
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contribution Graph */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
              Activity Overview
            </h4>
            <div className="bg-slate-50 rounded-xl p-4 dark:bg-dark-700">
              <div className="flex items-end gap-1 h-32">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1 flex-1 h-full">
                    {week.map((day, dayIndex) => {
                      let intensity = 'bg-slate-200 dark:bg-slate-600';
                      if (day.count > 0) intensity = 'bg-blue-300 dark:bg-blue-600';
                      if (day.count > 1) intensity = 'bg-blue-400 dark:bg-blue-500';
                      if (day.count > 2) intensity = 'bg-blue-500 dark:bg-blue-400';
                      if (day.count > 3) intensity = 'bg-blue-600 dark:bg-blue-300';
                      
                      return (
                        <div
                          key={dayIndex}
                          className={`flex-1 rounded-sm ${intensity} transition-colors`}
                          title={`${day.date}: ${day.count} contributions`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mt-2">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
                <span>Nov</span>
                <span>Dec</span>
              </div>
            </div>
          </div>

          {/* Progress Summary */}
          <div>
            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
              Progress Summary
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Overall Progress</span>
                  <span className="text-slate-700 dark:text-slate-300">{completionRate}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 dark:bg-dark-700">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 dark:bg-dark-700">
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {totalProjects}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Total Projects
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 dark:bg-dark-700">
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {totalSteps}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Total Steps
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4 dark:bg-dark-700">
                  <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {completedSteps}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Completed Steps
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
