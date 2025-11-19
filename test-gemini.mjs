// Simple test script to verify Gemini API connectivity
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';

async function testGemini() {
  try {
    // Read .env.local file directly
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

    console.log("Testing Gemini API connectivity...");
    
    // Initialize the Gemini AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try models that should be available based on our list
    const modelNames = [
      "gemini-pro-latest",
      "gemini-flash-latest",
      "gemini-2.0-flash",
      "gemini-2.0-pro-exp"
    ];
    
    for (const modelName of modelNames) {
      try {
        console.log(`\nTrying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = "Say hello world";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log(`Response from ${modelName}:`, text);
        console.log(`✅ Successfully used model: ${modelName}`);
        return; // Exit after first successful model
      } catch (modelError) {
        console.error(`❌ Error with model ${modelName}:`, modelError.message);
      }
    }
    
    console.log("❌ No models worked");
  } catch (error) {
    console.error("❌ Error testing Gemini API:", error.message);
  }
}

testGemini();