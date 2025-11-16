"use client";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useAuthActions } from "@convex-dev/auth/react";

export function ProcessingPage({ 
  name, 
  email, 
  password, 
  onGetStarted 
}: { 
  name: string; 
  email: string; 
  password: string; 
  onGetStarted: () => void; 
}) {
  const { signIn } = useAuthActions();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [error, setError] = useState("");

  useEffect(() => {
    const createAccount = async () => {
      try {
        // First, sign up the user
        await signIn("password", { 
          flow: "signUp",
          email,
          password
        });
        
        // Account creation successful
        setStatus("success");
        
        // Trigger confetti animation
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#4F46E5', '#7C3AED', '#2563EB', '#0EA5E9']
        });
      } catch (err: any) {
        setStatus("error");
        setError(err.message || "Failed to create account. Please try again.");
      }
    };

    createAccount();
  }, [email, password, signIn]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-100 text-center dark:bg-dark-800">
        {status === "processing" && (
          <div className="py-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 dark:text-slate-200">Creating your account</h3>
            <p className="text-slate-600 dark:text-slate-400">Please wait while we set up your account...</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 dark:text-slate-200">Account Created!</h3>
            <p className="text-slate-600 text-sm mb-6 dark:text-slate-400">
              Welcome aboard, {name}! Your account has been successfully created.
            </p>
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="py-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 dark:text-slate-200">Account Creation Failed</h3>
            <p className="text-slate-600 text-sm mb-4 dark:text-slate-400">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}