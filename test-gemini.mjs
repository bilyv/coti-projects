// Simple test script to verify Gemini API connectivity
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

async function testGemini() {
  try {
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.");
      return;
    }

    console.log("Testing Gemini API connectivity...");
    
    // Initialize the Gemini AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Test with gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = "Say hello world";
    
    console.log("Sending test request...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Response from Gemini API:", text);
    console.log("✅ Gemini API is working correctly!");
  } catch (error) {
    console.error("❌ Error testing Gemini API:", error.message);
  }
}

testGemini();