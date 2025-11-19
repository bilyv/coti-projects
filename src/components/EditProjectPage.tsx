import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate, useParams } from "react-router-dom";
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
  _id?: Id<"subtasks">;
  title: string;
  isCompleted: boolean;
  order: number;
}

interface Step {
  _id?: Id<"steps">;
  title: string;
  description: string;
  subtasks: Subtask[];
  order: number;
  isCompleted: boolean;
  isUnlocked: boolean;
}

export function EditProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
  const [steps, setSteps] = useState<Step[]>([{ title: "", description: "", subtasks: [], order: 0, isCompleted: false, isUnlocked: true }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [descriptionContent, setDescriptionContent] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [removedStepIds, setRemovedStepIds] = useState<Id<"steps">[]>([]); // Track removed step IDs
  const editorRef = useRef<HTMLDivElement>(null);

  const project = useQuery(api.projects.get, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  const projectSteps = useQuery(api.steps.listByProject, projectId ? { projectId: projectId as Id<"projects"> } : "skip");
  // Add a query to load all subtasks for all steps
  const allSubtasks = useQuery(
    api.subtasks.listBySteps,
    projectId && projectSteps && projectSteps.length > 0
      ? { stepIds: projectSteps.map(step => step._id) }
      : "skip"
  );
  const updateProject = useMutation(api.projects.update);
  const createStep = useMutation(api.steps.create);
  const updateStep = useMutation(api.steps.update);
  const removeStep = useMutation(api.steps.remove);
  const createSubtask = useMutation(api.subtasks.create);
  const updateSubtask = useMutation(api.subtasks.update);
  const removeSubtask = useMutation(api.subtasks.remove);

  // Load project data when it's available
  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || "");
      setDescriptionContent(project.description || "");
      setLink(project.link || "");
      setSelectedColor(project.color);
    }
  }, [project]);

  // Load steps data when it's available
  useEffect(() => {
    if (projectSteps) {
      // Create a copy of steps with subtasks placeholder
      const stepsWithSubtasks: Step[] = projectSteps.map((step) => ({
        _id: step._id,
        title: step.title,
        description: step.description || "",
        subtasks: [], // Will be populated by individual subtask queries
        order: step.order,
        isCompleted: step.isCompleted,
        isUnlocked: step.isUnlocked
      })).sort((a, b) => a.order - b.order);

      setSteps(stepsWithSubtasks);
    }
  }, [projectSteps]);

  // Load subtasks for all steps when they're available
  useEffect(() => {
    if (allSubtasks && projectSteps) {
      // Group subtasks by stepId
      const subtasksByStep: Record<string, Subtask[]> = {};
      allSubtasks.forEach(subtask => {
        if (!subtasksByStep[subtask.stepId]) {
          subtasksByStep[subtask.stepId] = [];
        }
        subtasksByStep[subtask.stepId].push({
          _id: subtask._id,
          title: subtask.title,
          isCompleted: subtask.isCompleted,
          order: subtask.order
        });
      });

      // Update steps with their subtasks
      setSteps(prevSteps => {
        const updatedSteps = [...prevSteps];
        for (let i = 0; i < updatedSteps.length; i++) {
          const step = updatedSteps[i];
          if (step._id && subtasksByStep[step._id]) {
            // Sort subtasks by order
            const sortedSubtasks = subtasksByStep[step._id].sort((a, b) => a.order - b.order);
            updatedSteps[i] = {
              ...step,
              subtasks: sortedSubtasks
            };
          }
        }
        return updatedSteps;
      });
    }
  }, [allSubtasks, projectSteps]);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Add a slight delay to prevent immediate drag
    setTimeout(() => {
      e.currentTarget.classList.add("opacity-50");
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetIndex(index);
  };

  const handleDragLeave = () => {
    setDropTargetIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDropTargetIndex(null);
      return;
    }

    const newSteps = [...steps];
    const draggedStep = newSteps[draggedIndex];

    // Remove the dragged item
    newSteps.splice(draggedIndex, 1);
    // Insert it at the new position
    newSteps.splice(targetIndex, 0, draggedStep);

    // Update order for all steps
    const updatedSteps = newSteps.map((step, index) => ({
      ...step,
      order: index
    }));

    setSteps(updatedSteps);
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const handleAddStep = () => {
    const newOrder = steps.length;
    setSteps([...steps, {
      title: "",
      description: "",
      subtasks: [],
      order: newOrder,
      isCompleted: false,
      isUnlocked: newOrder === 0
    }]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return;

    const stepToRemove = steps[index];
    const newSteps = [...steps];
    newSteps.splice(index, 1);

    // If this is an existing step (has an _id), track it for removal
    if (stepToRemove._id) {
      setRemovedStepIds(prev => [...prev, stepToRemove._id!]);
    }

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
    const newOrder = newSteps[stepIndex].subtasks.length;
    newSteps[stepIndex].subtasks.push({
      title: "",
      isCompleted: false,
      order: newOrder
    });
    setSteps(newSteps);
  };

  const handleRemoveSubtask = async (stepIndex: number, subtaskIndex: number) => {
    const subtask = steps[stepIndex].subtasks[subtaskIndex];

    // If this is an existing subtask with an ID, delete it from the database
    if (subtask._id) {
      try {
        await removeSubtask({ subtaskId: subtask._id });
      } catch (error) {
        console.error("Error deleting subtask:", error);
        toast.error("Failed to delete subtask");
        return; // Don't remove from local state if deletion failed
      }
    }

    // Remove from local state
    const newSteps = [...steps];
    newSteps[stepIndex].subtasks.splice(subtaskIndex, 1);
    setSteps(newSteps);
  };

  // Rich text editor functions
  const formatText = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleSaveDescription = () => {
    if (editorRef.current) {
      setDescription(editorRef.current.innerHTML);
      setDescriptionContent(editorRef.current.innerHTML);
    }
    setShowDescriptionModal(false);
  };

  const handleClearDescription = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      setDescription('');
      setDescriptionContent('');
    }
  };

  // Initialize editor content when modal opens
  useEffect(() => {
    if (showDescriptionModal && editorRef.current) {
      editorRef.current.innerHTML = description;
    }
  }, [showDescriptionModal, description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectId) return;

    setIsSubmitting(true);
    try {
      // First update the project
      await updateProject({
        projectId: projectId as Id<"projects">,
        name: name.trim(),
        description: description || undefined,
        link: link.trim() || undefined,
        color: selectedColor,
      });

      // Remove steps that were deleted
      for (const stepId of removedStepIds) {
        try {
          await removeStep({ stepId });
        } catch (error) {
          console.error("Error removing step:", error);
          toast.error("Failed to remove a step");
        }
      }

      // Process all steps and their subtasks
      for (const [stepIndex, step] of steps.entries()) {
        let stepId = step._id;

        // Update or create step
        if (step._id) {
          // Update existing step with order
          await updateStep({
            stepId: step._id,
            title: step.title.trim(),
            description: step.description.trim() || undefined,
            order: step.order, // Include order in update
          });
        } else if (step.title.trim()) {
          // Create new step
          stepId = await createStep({
            projectId: projectId as Id<"projects">,
            title: step.title.trim(),
            description: step.description.trim() || undefined,
          });

          // Update the step in local state with the new ID
          const newSteps = [...steps];
          newSteps[stepIndex] = { ...step, _id: stepId };
          setSteps(newSteps);
        }

        // Process subtasks for this step (only if step exists)
        if (stepId) {
          // Handle subtasks - update existing, create new, and ensure proper ordering
          for (const [subtaskIndex, subtask] of step.subtasks.entries()) {
            if (subtask._id && subtask.title.trim()) {
              // Update existing subtask
              try {
                await updateSubtask({
                  subtaskId: subtask._id,
                  title: subtask.title.trim(),
                  isCompleted: subtask.isCompleted,
                });
              } catch (error) {
                console.error("Error updating subtask:", error);
                toast.error("Failed to update subtask");
              }
            } else if (!subtask._id && subtask.title.trim()) {
              // Create new subtask
              try {
                await createSubtask({
                  stepId,
                  title: subtask.title.trim(),
                });
              } catch (error) {
                console.error("Error creating subtask:", error);
                toast.error("Failed to create subtask");
              }
            }
          }
        }
      }

      toast.success("Project updated successfully!");
      // Navigate back to project details
      navigate(`/project/${projectId}`);
    } catch (error) {
      toast.error("Failed to update project");
      console.error("Error updating project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!projectId) {
    navigate("/");
    return null;
  }

  if (project === undefined || projectSteps === undefined || allSubtasks === undefined) {
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
            <p className="text-slate-600 dark:text-slate-400 mb-6">The project you're looking for doesn't exist or you don't have permission to edit it.</p>
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
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700 p-4 mb-4 md:mb-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Edit Project</h2>
        <button
          onClick={() => navigate(`/project/${projectId}`)}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all dark:bg-dark-700 dark:text-slate-300 dark:hover:bg-dark-600"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
            Project Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter project name"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-dark-800 dark:border-dark-700 dark:text-white dark:placeholder-slate-500"
            required
          />
        </div>

        {/* Project Color */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
            Color
          </label>
          <div className="flex gap-2">
            {PROJECT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-lg transition-all ${selectedColor === color
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
          <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
            Project Description
          </label>
          <button
            type="button"
            onClick={() => setShowDescriptionModal(true)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-dark-800 dark:border-dark-700 dark:text-white dark:placeholder-slate-500 text-left hover:bg-slate-50 dark:hover:bg-dark-700"
          >
            {descriptionContent ? (
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Project details added</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Add Project Details</span>
              </div>
            )}
          </button>
        </div>

        {/* Project Link */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
            Project Link (optional)
          </label>
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://example.com"
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-dark-800 dark:border-dark-700 dark:text-white dark:placeholder-slate-500"
          />
        </div>

        {/* Steps Section */}
        <div className="border-t border-slate-200 dark:border-dark-700 pt-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">Steps</h3>

          <div className="space-y-3 transition-all duration-300">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`border border-slate-200 dark:border-dark-700 rounded-lg p-3 transition-all duration-200 ease-in-out transform ${draggedIndex === index
                    ? "bg-blue-50 dark:bg-blue-900/20 opacity-50 scale-95 shadow-md"
                    : dropTargetIndex === index && draggedIndex !== null
                      ? "bg-blue-100 dark:bg-blue-900/30 scale-105 shadow-lg"
                      : "bg-white dark:bg-dark-800"
                  } ${dropTargetIndex === index && draggedIndex !== null
                    ? "ring-2 ring-blue-500 ring-opacity-50"
                    : ""
                  }`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDragEnd={handleDragEnd}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    {/* Drag Handle */}
                    <div
                      className="cursor-move p-1 rounded hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors"
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        handleDragStart(e, index);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                    <h4 className="font-medium text-slate-700 dark:text-slate-300">Step {index + 1}</h4>
                  </div>
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

                <div className="space-y-2">
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
                  <div className="border-t border-slate-200 dark:border-dark-700 pt-2 mt-2">
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

                    <div className="space-y-1">
                      {step.subtasks.map((subtask, subtaskIndex) => (
                        <div key={subtaskIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={subtask.title}
                            onChange={(e) => handleSubtaskChange(index, subtaskIndex, e.target.value)}
                            placeholder="Enter subtask"
                            className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:bg-dark-800 dark:border-dark-700 dark:text-white dark:placeholder-slate-500"
                          />
                          <button
                            type="button"
                            onClick={async () => await handleRemoveSubtask(index, subtaskIndex)}
                            className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Another Step Button */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-dark-700">
            <button
              type="button"
              onClick={handleAddStep}
              className="w-full py-2 flex items-center justify-center gap-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-lg border-2 border-dashed border-slate-300 hover:border-slate-400 dark:border-dark-600 dark:hover:border-dark-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Another Step
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2 gap-3">
          <button
            type="button"
            onClick={() => navigate(`/project/${projectId}`)}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all dark:bg-dark-700 dark:text-slate-300 dark:hover:bg-dark-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!name.trim() || isSubmitting}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Rich Text Editor Modal */}
      {showDescriptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 dark:bg-black/70">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col dark:bg-dark-800">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center dark:border-dark-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Project Details</h3>
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors dark:hover:bg-dark-700"
              >
                <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Editor Toolbar */}
            <div className="p-3 border-b border-slate-200 flex flex-wrap gap-1 dark:border-dark-700">
              <button
                type="button"
                onClick={() => formatText('bold')}
                className="p-2 rounded hover:bg-slate-100 transition-colors dark:hover:bg-dark-700"
                title="Bold"
              >
                <svg className="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h16M7 12h10m0 6H7" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => formatText('italic')}
                className="p-2 rounded hover:bg-slate-100 transition-colors dark:hover:bg-dark-700"
                title="Italic"
              >
                <svg className="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M3 4h16" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => formatText('underline')}
                className="p-2 rounded hover:bg-slate-100 transition-colors dark:hover:bg-dark-700"
                title="Underline"
              >
                <svg className="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>

              <div className="w-px bg-slate-300 mx-1 my-1 dark:bg-dark-600"></div>

              <button
                type="button"
                onClick={() => formatText('formatBlock', '<h1>')}
                className="p-2 rounded hover:bg-slate-100 transition-colors text-sm font-bold dark:hover:bg-dark-700"
                title="Heading 1"
              >
                H1
              </button>

              <button
                type="button"
                onClick={() => formatText('formatBlock', '<h2>')}
                className="p-2 rounded hover:bg-slate-100 transition-colors text-sm font-bold dark:hover:bg-dark-700"
                title="Heading 2"
              >
                H2
              </button>

              <button
                type="button"
                onClick={() => formatText('formatBlock', '<h3>')}
                className="p-2 rounded hover:bg-slate-100 transition-colors text-sm font-bold dark:hover:bg-dark-700"
                title="Heading 3"
              >
                H3
              </button>

              <div className="w-px bg-slate-300 mx-1 my-1 dark:bg-dark-600"></div>

              <button
                type="button"
                onClick={() => formatText('insertUnorderedList')}
                className="p-2 rounded hover:bg-slate-100 transition-colors dark:hover:bg-dark-700"
                title="Bullet List"
              >
                <svg className="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => formatText('insertOrderedList')}
                className="p-2 rounded hover:bg-slate-100 transition-colors dark:hover:bg-dark-700"
                title="Numbered List"
              >
                <svg className="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Editor Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div
                ref={editorRef}
                contentEditable
                className="min-h-[300px] p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-dark-700 dark:border-dark-600 dark:text-white"
                style={{ borderRadius: '0.5rem' }}
                onInput={(e) => {
                  // Handle content changes if needed
                }}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3 dark:border-dark-700">
              <button
                onClick={handleClearDescription}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors dark:border-dark-700 dark:text-slate-300 dark:hover:bg-dark-700"
              >
                Clear
              </button>
              <button
                onClick={handleSaveDescription}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Save Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}