'use client'

import AddBenchForm from "@/components/AddBenchForm";
import { useAuth } from "@/lib/supabase-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AddBenchPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user]);

  if (!user || loading) return null;

  return <AddBenchForm />;
}
