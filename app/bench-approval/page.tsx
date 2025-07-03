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
        <div className="min-h-screen bg-gradient-subtle">
            <UserBar />
            
            <div className="py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-maroon-primary mb-4">
                            {isAdmin ? "Bench Approval Center" : "My Benches"}
                        </h1>
                        <p className="text-text-light text-lg">
                            {isAdmin ? "Review and approve community submissions" : "Manage your bench contributions"}
                        </p>
                        <div className="w-24 h-1 bg-gradient-gold mx-auto rounded-full mt-4"></div>
                    </div>
                    
                    {message && (
                        <div className="mb-6 p-4 rounded-lg text-sm max-w-2xl mx-auto bg-red-50 text-red-700 border border-red-200 animate-slide-up">
                            <div className="flex items-center">
                                <span className="mr-2">❌</span>
                                {message}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {benches.map((bench) => (
                        <div key={bench.id} className="card-elegant p-6">
                            {bench.image_url && (
                            <img 
                                src={bench.image_url} 
                                alt={bench.name}
                                className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                            )}
                            <h2 className="text-xl font-semibold text-text-dark mb-2">{bench.name}</h2>
                            <p className="text-text-light mb-3 line-clamp-3">{bench.description}</p>
                            <p className="text-sm text-text-gold mb-4 font-mono bg-warm-gray px-3 py-2 rounded-lg">
                                📍 {bench.lat?.toFixed(4)}, {bench.lng?.toFixed(4)}
                            </p>
                            <div className="flex gap-2">
                            {isAdmin && (
                                <button
                                onClick={(e) => handleApprove(bench.id, e)}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-md"
                                >
                                ✅ Approve
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(bench.id)}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-md"
                            >
                                🗑️ Delete
                            </button>
                            </div>
                        </div>
                        ))}
                    </div>

                    {benches.length === 0 && (
                        <div className="text-center py-16">
                            <div className="max-w-md mx-auto">
                                <div className="w-24 h-24 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="text-4xl">✨</span>
                                </div>
                                <h3 className="text-2xl font-semibold text-text-dark mb-4">All Clear!</h3>
                                <p className="text-text-light">
                                    {isAdmin ? "No benches pending approval" : "You haven't added any benches yet"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
