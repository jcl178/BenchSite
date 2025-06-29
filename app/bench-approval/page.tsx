// A page where the admin, user with id 93e38698-f4dd-4b20-acee-b481b6bbee57 can see cards of all benches that are not approved and then approve them or delete them.

'use client'

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/supabase-provider";
import { createClient } from "@/app/utils/supabase/client";
import { Bench } from "@/data/benches";
import UserBar from "@/components/UserBar";
import { v4 as uuidv4 } from 'uuid';


export default function MyBenchesPage() {
    const { user } = useAuth();
    const [benches, setBenches] = useState<Bench[]>([]);
    const [message, setMessage] = useState("");
    const isAdmin = user?.id === "93e38698-f4dd-4b20-acee-b481b6bbee57";
    const supabase = createClient();

    useEffect(() => {
        const loadBenches = async () => {
        const query = isAdmin 
            ? supabase.from("benches").select("*").eq("approved", false)
            : supabase.from("benches").select("*").eq("user_id", user?.id);

        const { data, error } = await query;
        
        if (error) {
            console.error("Error fetching benches:", error);
            setMessage("Failed to load benches");
            return;
        }

        setBenches(data || []);
        };

        if (user) {
        loadBenches();
        }
    }, [user, isAdmin]);

    const handleApprove = async (benchId: string, e: React.MouseEvent<HTMLButtonElement>) => {
         e.preventDefault();
          if (!isAdmin) return;
         
         console.log("🔐 Current user ID:", user?.id);
         console.log("🎯 Admin ID expected:", "93e38698-f4dd-4b20-acee-b481b6bbee57");
         console.log("✅ Is Admin:", isAdmin);
         console.log("📝 Updating bench ID:", benchId);

         const { data, error } = await supabase
          .from("benches")
         .update({ 
           approved: true,
         })
          .eq("id", benchId)
          .select(); // Add select() to return updated data

         console.log("📊 Update result:", { data, error });
         
         if (error) {
           console.error("❌ Update error:", error);
           setMessage(`Failed to approve bench: ${error.message}`);
           return;
         }

         console.log("✅ Bench approved successfully");
         setMessage("Bench approved successfully!");
         setBenches(benches.filter(b => b.id !== benchId));
         
         // Clear message after 3 seconds
         setTimeout(() => setMessage(""), 3000);
     };

    const handleDelete = async (benchId: string) => {
        const bench = benches.find(b => b.id === benchId);
        if (!isAdmin && user?.id !== bench?.user_id) return;

        const { error } = await supabase
        .from("benches")
        .delete()
        .eq("id", benchId);

        if (error) {
            setMessage("Failed to delete bench");
            return;
        }

        setBenches(benches.filter(b => b.id !== benchId));
    };

    if (!user) {
        return <div className="p-4">Please log in to view your benches.</div>;
    }

    return (
        <div className="p-4">
            <UserBar />
        <h1 className="text-2xl font-bold mb-4">
            {isAdmin ? "Pending Approval Benches" : "My Benches"}
        </h1>
        
        {message && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {message}
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {benches.map((bench) => (
            <div key={bench.id} className="bg-white rounded-lg shadow p-4">
                {bench.image_url && (
                <img 
                    src={bench.image_url} 
                    alt={bench.name}
                    className="w-full h-48 object-cover rounded mb-2"
                />
                )}
                <h2 className="text-xl text-gray-600 font-semibold">{bench.name}</h2>
                <p className="text-gray-600 mb-2">{bench.description}</p>
                <p className="text-sm text-gray-500 mb-4">
                Location: {bench.lat}, {bench.lng}
                </p>
                <div className="flex gap-2">
                {isAdmin && (
                    <button
                    onClick={(e) => handleApprove(bench.id, e)}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                    Approve
                    </button>
                )}
                <button
                    onClick={() => handleDelete(bench.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                >
                    Delete
                </button>
                </div>
            </div>
            ))}
        </div>

        {benches.length === 0 && (
            <p className="text-gray-500 text-center mt-8">
            {isAdmin ? "No benches pending approval" : "You haven't added any benches yet"}
            </p>
        )}
        </div>
    );
}
