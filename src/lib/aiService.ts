import { GoogleGenerativeAI } from "@google/generative-ai";

// Define the structure for AI-generated steps
export interface AIStep {
  title: string;
  description: string;
  subtasks: string[];
}

// Function to generate steps based on project name and description
export async function generateProjectSteps(
  projectName: string,
  projectDescription: string
): Promise<AIStep[]> {
  try {
    // Validate API key
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
    }

    // Initialize the Gemini AI client
    const genAI = new GoogleGenerativeAI(apiKey);

    // Use the gemini-flash-latest model which we confirmed works
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Create the prompt for the AI
    const prompt = `You are a project management expert. Based on the project name and description, generate a list of steps to complete the project. Each step should have a title, description, and subtasks.

Project Name: ${projectName}
Project Description: ${projectDescription}

Please provide the response in the following JSON format:
[
  {
    "title": "Step title",
    "description": "Step description",
    "subtasks": ["Subtask 1", "Subtask 2", "Subtask 3"]
  }
]

Important guidelines:
1. Generate 3-7 steps depending on the project complexity
2. Each step should have 2-5 subtasks
3. Make the steps and subtasks specific and actionable
4. Return ONLY valid JSON, no other text
5. Ensure the JSON is properly formatted`;

    console.log("Sending request to Gemini API with project:", { projectName, projectDescription });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Received response from Gemini API:", text);

    // Extract JSON from the response (in case there's extra text)
    let jsonString = text.trim();
    const jsonStart = jsonString.indexOf("[");
    const jsonEnd = jsonString.lastIndexOf("]");
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
    }

    // Parse and validate the JSON
    const steps: AIStep[] = JSON.parse(jsonString);
    
    // Validate the structure
    if (!Array.isArray(steps)) {
      throw new Error("Invalid response format: expected an array of steps");
    }

    // Validate each step
    for (const step of steps) {
      if (!step.title || !step.description || !Array.isArray(step.subtasks)) {
        throw new Error("Invalid step format: each step must have title, description, and subtasks array");
      }
    }

    return steps;
  } catch (error: any) {
    console.error("Error generating project steps:", error);
    
    // Provide more specific error messages
    if (error.message && error.message.includes("API_KEY_INVALID")) {
      throw new Error("Invalid Gemini API key. Please check your VITE_GEMINI_API_KEY in the .env file.");
    }
    
    if (error.message && error.message.includes("FAILED_PRECONDITION")) {
      throw new Error("Gemini API is not properly configured. Please check your API key and quota.");
    }
    
    if (error.message && error.message.includes("NOT_FOUND")) {
      throw new Error("The specified Gemini model is not available. Please check the model name and try again.");
    }
    
    throw new Error(`Failed to generate steps: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}