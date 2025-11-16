"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { ProcessingPage } from "./ProcessingPage";

export function RegisterForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const { signIn } = useAuthActions();
  const updateUserProfile = useMutation(api.auth.updateUserProfile);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: name, 2: email, 3: password, 4: processing
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setStep(2);
      setError("");
    } else {
      setError("Please enter your name");
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      setStep(3);
      setError("");
    } else {
      setError("Please enter a valid email address");
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setError("");
    setStep(4); // Go to processing page
  };

  const handleGetStarted = async () => {
    // Update the user's name after successful authentication
    try {
      await updateUserProfile({ name });
    } catch (err) {
      console.error("Failed to update user profile:", err);
    }
    // This will automatically redirect to the dashboard since the user is now authenticated
    window.location.reload();
  };

  // Render processing page
  if (step === 4) {
    return (
      <ProcessingPage 
        name={name} 
        email={email} 
        password={password} 
        onGetStarted={handleGetStarted} 
      />
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100 dark:bg-dark-800 dark:border-dark-700">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Create Account</h2>
          <p className="text-slate-600 text-sm mt-1 dark:text-slate-400">Join us to get started</p>
        </div>

        {step === 1 && (
          <form className="space-y-4" onSubmit={handleNameSubmit}>
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-slate-700 mb-1 dark:text-slate-300">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-dark-800 dark:border-dark-700 dark:text-white"
                placeholder="John Doe"
              />
            </div>
            
            {error && <p className="text-red-500 text-xs dark:text-red-400">{error}</p>}
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Continue
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="space-y-4" onSubmit={handleEmailSubmit}>
            <div className="flex items-center mb-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <h3 className="text-lg font-medium text-slate-800 ml-2 dark:text-slate-200">What's your email?</h3>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-700 mb-1 dark:text-slate-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-dark-800 dark:border-dark-700 dark:text-white"
                placeholder="you@example.com"
              />
            </div>
            
            {error && <p className="text-red-500 text-xs dark:text-red-400">{error}</p>}
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Continue
            </button>
          </form>
        )}

        {step === 3 && (
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <div className="flex items-center mb-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <h3 className="text-lg font-medium text-slate-800 ml-2 dark:text-slate-200">Create password</h3>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-slate-700 mb-1 dark:text-slate-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoFocus
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-dark-800 dark:border-dark-700 dark:text-white"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-slate-700 mb-1 dark:text-slate-300">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 dark:bg-dark-800 dark:border-dark-700 dark:text-white"
                placeholder="••••••••"
              />
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Password must be at least 8 characters long
            </p>
            
            {error && <p className="text-red-500 text-xs dark:text-red-400">{error}</p>}
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Create Account
            </button>
          </form>
        )}

        {step < 4 && (
          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm dark:text-slate-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToSignIn}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline dark:text-blue-400 dark:hover:text-blue-300"
              >
                Sign in
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}