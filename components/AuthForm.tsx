'use client'

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const { error } = isLogin
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage(isLogin ? "Welcome back! Redirecting..." : "Please check your email to confirm your account.");
        if (isLogin) {
          setTimeout(() => router.push("/"), 1500);
        }
      }
    } catch (error) {
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-maroon-primary mb-2">
              🪑 Benches with a View
            </h1>
            <div className="w-24 h-1 bg-gradient-gold mx-auto rounded-full"></div>
          </div>
          <h2 className="text-2xl font-semibold text-text-dark">
            {isLogin ? "Welcome Back" : "Join Our Community"}
          </h2>
          <p className="mt-2 text-text-light">
            {isLogin 
              ? "Sign in to discover amazing bench locations" 
              : "Create an account to start sharing beautiful spots"}
          </p>
        </div>

        {/* Form */}
        <div className="card-elegant p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-text-light">📧</span>
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-warm-gray rounded-lg text-text-dark placeholder-text-light focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-dark mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-text-light">🔒</span>
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-warm-gray rounded-lg text-text-dark placeholder-text-light focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 transform ${
                isLoading 
                  ? 'bg-text-light cursor-not-allowed' 
                  : 'bg-gradient-maroon hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? "Signing In..." : "Creating Account..."}
                </div>
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          {/* Toggle between login/signup */}
          <div className="mt-6 text-center">
            <p className="text-text-light">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage("");
              }}
              className="mt-2 font-semibold text-maroon-primary hover:text-maroon-secondary transition-colors duration-300"
            >
              {isLogin ? "Create a new account" : "Sign in instead"}
            </button>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mt-4 p-4 rounded-lg text-sm ${
              message.includes("error") || message.includes("Error")
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : message.includes("Welcome") || message.includes("check your email")
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            } animate-slide-up`}>
              <div className="flex items-center">
                <span className="mr-2">
                  {message.includes("error") || message.includes("Error") ? "❌" : 
                   message.includes("Welcome") || message.includes("check your email") ? "✅" : "ℹ️"}
                </span>
                {message}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-text-light text-sm">
          <p>
            By continuing, you agree to our 
            <a href="#" className="text-maroon-primary hover:text-maroon-secondary ml-1">Terms of Service</a> and 
            <a href="#" className="text-maroon-primary hover:text-maroon-secondary ml-1">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
