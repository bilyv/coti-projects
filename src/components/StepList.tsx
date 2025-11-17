import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

interface Subtask {
  _id: Id<"subtasks">;
  title: string;
  isCompleted: boolean;
  order: number;
}

interface Step {
  _id: Id<"steps">;
  title: string;
  description?: string;
  order: number;
  isCompleted: boolean;
  isUnlocked: boolean;
}

interface StepListProps {
  steps: Step[] | undefined;
  projectColor: string;
}

// SubtaskList component to handle subtasks for each step
function SubtaskList({ stepId }: { stepId: Id<"steps"> }) {
  const subtasks = useQuery(api.subtasks.listByStep, { stepId }) || [];
  const toggleSubtaskComplete = useMutation(api.subtasks.toggleComplete);

  const handleToggleSubtaskComplete = async (subtaskId: Id<"subtasks">) => {
    try {
      await toggleSubtaskComplete({ subtaskId });
    } catch (error) {
      toast.error("Failed to update subtask");
    }
  };

  if (!subtasks || subtasks.length === 0) return null;

  return (
    <div className="mt-3 pl-4 border-l-2 border-slate-200 dark:border-dark-600">
      <h5 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Subtasks</h5>
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div key={subtask._id} className="flex items-center gap-2">
            <button
              onClick={() => handleToggleSubtaskComplete(subtask._id)}
              className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center ${
                subtask.isCompleted
                  ? "bg-green-500 border-green-500"
                  : "border-slate-300 dark:border-slate-600"
              }`}
            >
              {subtask.isCompleted && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span className={`text-sm ${
              subtask.isCompleted
                ? "text-green-700 line-through dark:text-green-400"
                : "text-slate-700 dark:text-slate-300"
            }`}>
              {subtask.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StepList({ steps, projectColor }: StepListProps) {
  const toggleComplete = useMutation(api.steps.toggleComplete);
  const removeStep = useMutation(api.steps.remove);

  const handleToggleComplete = async (stepId: Id<"steps">) => {
    try {
      await toggleComplete({ stepId });
    } catch (error) {
      toast.error("Failed to update step");
    }
  };

  const handleRemoveStep = async (stepId: Id<"steps">) => {
    try {
      await removeStep({ stepId });
      toast.success("Step removed");
    } catch (error) {
      toast.error("Failed to remove step");
    }
  };

  if (steps === undefined) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-50 rounded-xl p-4 animate-pulse dark:bg-dark-700">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2 dark:bg-slate-600"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2 dark:bg-slate-600"></div>
          </div>
        ))}
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-dark-700">
          <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-800 mb-2 dark:text-slate-200">No steps yet</h3>
        <p className="text-slate-600 dark:text-slate-400">Add your first step to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div
          key={step._id}
          className={`relative rounded-xl border-2 transition-all duration-200 ${
            step.isUnlocked
              ? step.isCompleted
                ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800/50"
                : "bg-white border-slate-200 hover:border-slate-300 dark:bg-dark-800 dark:border-dark-700 dark:hover:border-dark-600"
              : "bg-slate-50 border-slate-200 opacity-60 dark:bg-dark-800/50 dark:border-dark-700"
          }`}
        >
          <div className="p-4">
            <div className="flex items-start gap-4">
              {/* Step number/status */}
              <div className="flex-shrink-0 mt-1">
                {step.isCompleted ? (
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                    style={{ backgroundColor: projectColor }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : step.isUnlocked ? (
                  <div 
                    className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold dark:text-white"
                    style={{ 
                      borderColor: projectColor,
                      color: projectColor 
                    }}
                  >
                    {index + 1}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-500 text-sm font-semibold dark:bg-slate-700 dark:text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-8V7m0 0V5m0 2h2m-2 0H10" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium mb-1 ${
                  step.isCompleted 
                    ? "text-green-800 line-through dark:text-green-400" 
                    : step.isUnlocked 
                      ? "text-slate-800 dark:text-slate-200" 
                      : "text-slate-500 dark:text-slate-500"
                }`}>
                  {step.title}
                </h4>
                {step.description && (
                  <p className={`text-sm ${
                    step.isCompleted 
                      ? "text-green-600 dark:text-green-500" 
                      : step.isUnlocked 
                        ? "text-slate-600 dark:text-slate-400" 
                        : "text-slate-400 dark:text-slate-500"
                  }`}>
                    {step.description}
                  </p>
                )}

                {/* Subtasks Section */}
                <SubtaskList stepId={step._id} />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {step.isUnlocked && (
                  <button
                    onClick={() => handleToggleComplete(step._id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      step.isCompleted
                        ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                    }`}
                  >
                    {step.isCompleted ? "Undo" : "Mark as Done"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Connection line to next step */}
          {index < steps.length - 1 && (
            <div 
              className="absolute left-8 top-12 w-0.5 h-6 -translate-x-0.5"
              style={{ 
                backgroundColor: step.isCompleted ? projectColor : "#e2e8f0" 
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}