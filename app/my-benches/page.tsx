"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";
import mapboxgl from "mapbox-gl";
import UserBar from "@/components/UserBar";
import { useAuth } from "@/lib/supabase-provider";
import { useRouter } from "next/navigation";

export default function MyBenchesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [benches, setBenches] = useState<any[]>([]);
  const [hoverCoords, setHoverCoords] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [message, setMessage] = useState("");
  const [editingBench, setEditingBench] = useState<any | null>(null);
  const [formState, setFormState] = useState({ name: '', description: '', image_url: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const loadBenches = async () => {
      const query = supabase.from("benches").select("*").eq("user_id", user?.id);
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
  }, [user]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [172.6306, -43.5321],
      zoom: 13,
    });

    map.on("mousemove", (e) => {
      setHoverCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    benches.forEach((bench) => {
      new mapboxgl.Marker({ color: bench.approved ? "green" : "yellow" })
        .setLngLat([bench.lng, bench.lat])
        .addTo(mapRef.current!);
    });
  }, [benches]);

  const zoomToBench = (lat: number, lng: number) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 15 });
  };

  const handleEdit = (bench: any) => {
    setEditingBench(bench);
    setFormState({
      name: bench.name,
      description: bench.description,
      image_url: bench.image_url || '',
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingBench) return;

    let uploadedImageUrl = formState.image_url;

    if (imageFile && user) {
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `public/${user.id}/${editingBench.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("bench-photos")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: true,
          contentType: imageFile.type,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setMessage("Image upload failed: " + uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("bench-photos")
        .getPublicUrl(filePath);

      uploadedImageUrl = urlData.publicUrl;
    }

    const { error: updateError } = await supabase
      .from("benches")
      .update({
        name: formState.name,
        description: formState.description,
        image_url: uploadedImageUrl,
      })
      .eq("id", editingBench.id);

    if (updateError) {
      setMessage("Failed to update bench");
      return;
    }

    setBenches(benches.map(b => b.id === editingBench.id ? { ...b, ...formState, image_url: uploadedImageUrl } : b));
    setEditingBench(null);
    setMessage("Bench updated successfully");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <UserBar />
      
      <div className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-maroon-primary mb-4">My Benches</h1>
            <p className="text-text-light text-lg">Manage your beautiful bench contributions</p>
            <div className="w-24 h-1 bg-gradient-gold mx-auto rounded-full mt-4"></div>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg text-sm max-w-2xl mx-auto ${
              message.includes("Failed") || message.includes("failed")
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            } animate-slide-up`}>
              <div className="flex items-center">
                <span className="mr-2">
                  {message.includes("Failed") || message.includes("failed") ? "❌" : "✅"}
                </span>
                {message}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {benches.map((bench) => (
              <div
                key={bench.id}
                className="card-elegant p-6 cursor-pointer group"
                onClick={() => zoomToBench(bench.lat, bench.lng)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-text-dark group-hover:text-maroon-primary transition-colors duration-300">
                    {bench.name}
                  </h2>
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      bench.approved 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}
                  >
                    {bench.approved ? '✅ Approved' : '⏳ Pending'}
                  </span>
                </div>
                
                <p className="text-text-light mb-4 line-clamp-3">
                  {bench.description || "No description provided"}
                </p>
                
                {bench.image_url && (
                  <img
                    src={bench.image_url}
                    alt={bench.name}
                    className="w-full h-40 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(bench);
                  }}
                  className="w-full py-2 bg-gradient-gold text-maroon-primary font-medium rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <span className="mr-2">✏️</span>
                  Edit Bench
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {editingBench && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-gradient-subtle p-8 rounded-xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-maroon-primary mb-2">Edit Bench</h2>
              <div className="w-16 h-1 bg-gradient-gold mx-auto rounded-full"></div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Name</label>
                <input
                  name="name"
                  value={formState.name}
                  onChange={handleFormChange}
                  placeholder="Bench name"
                  className="w-full px-4 py-3 border border-warm-gray rounded-lg text-text-dark placeholder-text-light focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-transparent transition-all duration-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Description</label>
                <textarea
                  name="description"
                  value={formState.description}
                  onChange={handleFormChange}
                  placeholder="Describe your bench..."
                  rows={3}
                  className="w-full px-4 py-3 border border-warm-gray rounded-lg text-text-dark placeholder-text-light focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-transparent transition-all duration-300 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Update Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-3 border border-warm-gray rounded-lg text-text-dark file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-gold file:text-maroon-primary file:font-medium hover:file:shadow-lg transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setEditingBench(null)}
                className="flex-1 px-4 py-3 border-2 border-maroon-primary text-maroon-primary hover:bg-maroon-primary hover:text-white font-semibold rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-3 bg-gradient-maroon text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <div className="card-elegant p-6 rounded-xl overflow-hidden">
          <div className="mb-4 text-center">
            <h3 className="text-xl font-semibold text-text-dark mb-2">
              Your Bench Locations
            </h3>
            <p className="text-text-light">
              Click on a bench card above to see it on the map
            </p>
          </div>
          
          <div className="rounded-xl overflow-hidden shadow-lg">
            <div
              ref={mapContainerRef}
              className="w-full h-[400px]"
            />
          </div>
        </div>
      </div>

      {hoverCoords && (
        <div className="fixed bottom-6 right-6 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg text-sm text-text-dark z-50 border border-warm-gray">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-text-gold">📍</span>
            <span>
              <strong>Lat:</strong> {hoverCoords.lat.toFixed(5)} | 
              <strong> Lng:</strong> {hoverCoords.lng.toFixed(5)}
            </span>
          </div>
        </div>
      )}

      {benches.length === 0 && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🪑</span>
            </div>
            <h3 className="text-2xl font-semibold text-text-dark mb-4">No Benches Yet</h3>
            <p className="text-text-light mb-6">
              You haven't added any benches yet. Start exploring and share your favorite spots!
            </p>
            <button 
              onClick={() => router.push("/add-bench")}
              className="px-6 py-3 bg-gradient-maroon text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              <span className="mr-2">✨</span>
              Add Your First Bench
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
