# Gemini AI Setup

This document explains how to set up the Gemini AI integration for the "Steps with AI" feature.

## Prerequisites

1. A Google Cloud account
2. A Google Cloud project with the Generative AI API enabled
3. An API key for the Gemini API

## Getting a Gemini API Key

1. Go to the [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key or use an existing one
4. Copy the API key for use in your application

## Environment Configuration

Add your Gemini API key to your environment variables:

### For Development (.env.local)

```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

### For Production (.env.production)

```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

## Security Considerations

**Important**: The API key is exposed to the client-side code. For production applications:

1. Consider implementing a backend proxy service that handles the AI requests
2. Use API key restrictions in the Google Cloud Console
3. Monitor your API usage regularly

## Testing the Integration

After setting up your API key:

1. Start your development server: `npm run dev`
2. Navigate to the "Create New Project" page
3. Enter a project name and description
4. Click the "Steps with AI" button
5. The AI should generate relevant steps and subtasks for your project

## Troubleshooting

If you encounter issues:

1. Verify your API key is correct and active
2. Check that the Generative AI API is enabled in your Google Cloud project
3. Ensure you haven't exceeded your API quota
4. Check the browser console for error messages

## Cost Management

Monitor your usage in the [Google Cloud Console](https://console.cloud.google.com/) to manage costs associated with the Gemini API usage.