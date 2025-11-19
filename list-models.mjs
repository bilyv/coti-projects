// Script to list available Gemini models
import fs from 'fs';

async function listModels() {
  try {
    // Read API key from .env.local
    let apiKey = '';
    
    if (fs.existsSync('.env.local')) {
      const envContent = fs.readFileSync('.env.local', 'utf8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('VITE_GEMINI_API_KEY=')) {
          apiKey = line.split('=')[1].trim();
          break;
        }
      }
    }
    
    if (!apiKey) {
      console.error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env.local file.");
      return;
    }

    console.log("Fetching available models...");
    
    // Make a direct API call to list models
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.error) {
      console.error("API Error:", data.error.message);
      return;
    }
    
    console.log("Available models:");
    data.models.forEach(model => {
      console.log(`- ${model.name} (${model.displayName})`);
    });
  } catch (error) {
    console.error("Error listing models:", error.message);
  }
}

listModels();