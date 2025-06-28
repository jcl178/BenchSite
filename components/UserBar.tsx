'use client'

import { useAuth } from "@/lib/supabase-provider";  
import { useRouter } from "next/navigation";

export default function UserBar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  if (loading) return null;

  return (
    <div className="flex justify-between items-center p-4 bg-white shadow mb-4">
      {user ? (
        <>
          <button onClick={() => router.push("/")} className="text-sm bg-blue-500 text-white px-3 py-1 rounded">Home</button>
          <p className="text-gray-700">Logged in as {user.email}</p>
          <button onClick={() => router.push("/add-bench")} className="text-sm bg-blue-500 text-white px-3 py-1 rounded">Add Bench</button>
          <button onClick={() => router.push("/my-benches")} className="text-sm bg-blue-500 text-white px-3 py-1 rounded">My Benches</button>
          <button onClick={logout} className="text-sm bg-red-500 text-white px-3 py-1 rounded">
            Log Out
          </button>
        </>
      ) : (
        <a href="/login" className="text-blue-600 underline">Log In</a>
      )}
    </div>
  );
}
