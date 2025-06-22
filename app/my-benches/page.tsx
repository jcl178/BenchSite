'use client'

import UserBar from "@/components/UserBar";
import { useAuth } from "@/lib/supabase-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MyBenchesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user]);

  if (loading || !user) return null;

  return (
    <div className="p-6">
        <UserBar />
      <h1 className="text-2xl font-bold mb-4">My Benches</h1>
      <p>You’ll list benches created by this user here later.</p>
    </div>
  );
}
