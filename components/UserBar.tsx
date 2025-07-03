'use client'

import { useAuth } from "@/lib/supabase-provider";  
import { useRouter } from "next/navigation";

export default function UserBar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  if (loading) return null;

  return (
          <div className="bg-gradient-maroon shadow-lg border-b-2 border-gold-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <button 
              onClick={() => router.push("/")} 
              className="text-2xl font-bold text-gold-primary hover:text-gold-light transition-colors duration-300"
            >
              🪑 Benches with a View
            </button>
          </div>

          {/* Navigation */}
          {user ? (
            <div className="flex items-center space-x-4">
              {/* User info */}
              <div className="hidden md:block text-cream text-sm">
                Welcome, <span className="font-semibold text-gold-light">{user.email?.split('@')[0]}</span>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => router.push("/")} 
                  className="px-4 py-2 text-cream hover:text-gold-light font-medium rounded-lg hover:bg-maroon-light transition-all duration-300"
                >
                  Home
                </button>
                <button 
                  onClick={() => router.push("/add-bench")} 
                  className="px-4 py-2 bg-gold-primary text-maroon-primary font-medium rounded-lg hover:bg-gold-light hover:scale-105 transition-all duration-300 shadow-md"
                >
                  Add Bench
                </button>
                <button 
                  onClick={() => router.push("/my-benches")} 
                  className="px-4 py-2 text-cream hover:text-gold-light font-medium rounded-lg hover:bg-maroon-light transition-all duration-300"
                >
                  My Benches
                </button>
                
                {/* Admin button */}
                {user.id === "93e38698-f4dd-4b20-acee-b481b6bbee57" && (
                  <button 
                    onClick={() => router.push("/bench-approval")} 
                    className="px-4 py-2 bg-maroon-accent text-white font-medium rounded-lg hover:bg-maroon-light hover:scale-105 transition-all duration-300 shadow-md"
                  >
                    Admin
                  </button>
                )}
                
                {/* Logout button */}
                <button 
                  onClick={logout} 
                  className="px-4 py-2 border border-cream text-cream hover:bg-cream hover:text-maroon-primary font-medium rounded-lg transition-all duration-300"
                >
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <a 
                href="/login" 
                className="px-6 py-2 bg-gold-primary text-maroon-primary font-semibold rounded-lg hover:bg-gold-light hover:scale-105 transition-all duration-300 shadow-md"
              >
                Log In
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
