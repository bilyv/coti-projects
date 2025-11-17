import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

const PROJECT_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#84cc16", // lime
];

interface Subtask {
  title: string;
  isCompleted: boolean;
}

interface Step {
  title: string;
  description: string;
  subtasks: Subtask[];
}

export function CreateProjectTab() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
  const [steps, setSteps] = useState<Step[]>([{ title: "", description: "", subtasks: [] }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProject = useMutation(api.projects.create);
  const createStep = useMutation(api.steps.create);
  const createSubtask = useMutation(api.subtasks.create);

  const handleAddStep = () => {
    setSteps([...steps, { title: "", description: "", subtasks: [] }]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return;
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
  };

  const handleStepChange = (index: number, field: keyof Step, value: string) => {
    const newSteps = [...steps];
    if (field === 'subtasks') {
      // This shouldn't happen with our current implementation
      return;
    }
    (newSteps[index][field] as string) = value;
    setSteps(newSteps);
  };

  const handleSubtaskChange = (stepIndex: number, subtaskIndex: number, value: string) => {
    const newSteps = [...steps];
    newSteps[stepIndex].subtasks[subtaskIndex].title = value;
    setSteps(newSteps);
  };

  const handleAddSubtask = (stepIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].subtasks.push({ title: "", isCompleted: false });
    setSteps(newSteps);
  };

  const handleRemoveSubtask = (stepIndex: number, subtaskIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].subtasks.splice(subtaskIndex, 1);
    setSteps(newSteps);
  };

  // Add automatic saving for subtasks
  const autoSaveSubtask = (stepIndex: number, subtaskIndex: number, value: string) => {
    // Update the subtask title in state
    handleSubtaskChange(stepIndex, subtaskIndex, value);
    
    // In the project creation form, we don't save to the backend yet
    // The subtasks will be saved when the project is submitted
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      // First create the project
      const projectId: Id<"projects"> = await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        link: link.trim() || undefined,
        color: selectedColor,
      });

      // Then create steps and their subtasks
      if (steps.some(step => step.title.trim())) {
        for (const step of steps) {
          if (step.title.trim()) {
            // Create the step
            const stepId = await createStep({
              projectId,
              title: step.title.trim(),
              description: step.description.trim() || undefined,
            });

            // Create subtasks for this step
            for (const subtask of step.subtasks) {
              if (subtask.title.trim()) {
                await createSubtask({
                  stepId,
                  title: subtask.title.trim(),
                });
              }
            }
          }
        }
      }

      toast.success("Project created successfully!");
      // Reset form
      setName("");
      setDescription("");
      setLink("");
      setSelectedColor(PROJECT_COLORS[0]);
      setSteps([{ title: "", description: "", subtasks: [] }]);
    } catch (error) {
      toast.error("Failed to create project");
      console.error("Error creating project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700 p-6 mb-6 md:mb-0">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Create New Project</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 dark:text-slate-300">
            Project Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter project name"
            className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-dark-800 dark:border-dark-700 dark:text-white dark:placeholder-slate-500"
            required
          />
        </div>

        {/* Project Color */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2 dark:text-slate-300">
            Color
          </label>
          <div className="flex gap-2">
            {PROJECT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-lg transition-all ${
                  selectedColor === color
                    ? "ring-2 ring-offset-1 ring-slate-400 dark:ring-slate-500"
                    : "hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>

        {/* Project Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 dark:text-slate-300">
            Project Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter project description (optional)"
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-dark-800 dark:border-dark-700 dark:text-white dark:placeholder-slate-500"
          />
        </div>

        {/* Project Link */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 dark:text-slate-300">
            Project Link (optional)
          </label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-dark-800 dark:border-dark-700 dark:text-white dark:placeholder-slate-500"
          />
        </div>

        {/* Steps Section */}
        <div className="border-t border-slate-200 dark:border-dark-700 pt-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Steps</h3>
          
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="border border-slate-200 dark:border-dark-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">Step {index + 1}</h4>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(index)}
                      className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                      aria-label="Remove step"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1 dark:text-slate-400">
                      Step Title *
                    </label>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => handleStepChange(index, "title", e.target.value)}
                      placeholder="Enter step title"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-dark-800 dark:border-dark-700 dark:text-white dark:placeholder-slate-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1 dark:text-slate-400">
                      Description (Optional)
                    </label>
                    <textarea
                      value={step.description}
                      onChange={(e) => handleStepChange(index, "description", e.target.value)}
                      placeholder="Enter step description"
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-dark-800 dark:border-dark-700 dark:text-white dark:placeholder-slate-500"
                    />
                  </div>
                  
                  {/* Subtasks Section */}
                  <div className="border-t border-slate-200 dark:border-dark-700 pt-3 mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="text-xs font-medium text-slate-600 dark:text-slate-400">Subtasks</h5>
                      <button
                        type="button"
                        onClick={() => handleAddSubtask(index)}
                        className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        + Add Subtask
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {step.subtasks.map((subtask, subtaskIndex) => (
                        <div key={subtaskIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={subtask.title}
                            onChange={(e) => autoSaveSubtask(index, subtaskIndex, e.target.value)}
                            placeholder="Enter subtask"
                            className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-dark-800 dark:border-dark-700 dark:text-white dark:placeholder-slate-500"
                          />
                          {step.subtasks.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSubtask(index, subtaskIndex)}
                              className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Add Another Step Button */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-dark-700">
            <button
              type="button"
              onClick={handleAddStep}
              className="w-full py-3 flex items-center justify-center gap-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-lg border-2 border-dashed border-slate-300 hover:border-slate-400 dark:border-dark-600 dark:hover:border-dark-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Another Step
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}