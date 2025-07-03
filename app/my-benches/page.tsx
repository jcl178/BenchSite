"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";
import mapboxgl from "mapbox-gl";
import UserBar from "@/components/UserBar";
import { useAuth } from "@/lib/supabase-provider";

export default function MyBenchesPage() {
  const { user } = useAuth();
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
      new mapboxgl.Marker({ color: "green" })
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
    <div className="p-4">
      <UserBar />
      <h1 className="text-2xl font-bold mb-4">My Benches</h1>

      {message && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {benches.map((bench) => (
          <div
            key={bench.id}
            className="bg-white p-4 rounded shadow hover:shadow-lg"
            onClick={() => zoomToBench(bench.lat, bench.lng)}
          >
            <h2 className="text-lg font-semibold flex justify-between items-center">
              {bench.name}
              <span
                className={`ml-2 px-2 py-1 text-xs rounded font-medium ${bench.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
              >
                {bench.approved ? 'Approved' : 'Pending'}
              </span>
            </h2>
            <p className="text-sm text-gray-600">{bench.description}</p>
            {bench.image_url && (
              <img
                src={bench.image_url}
                alt={bench.name}
                className="mt-2 w-full h-32 object-cover rounded"
              />
            )}
            <button
              onClick={() => handleEdit(bench)}
              className="mt-2 bg-blue-500 text-white px-4 py-1 rounded"
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      {editingBench && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Bench</h2>
            <input
              name="name"
              value={formState.name}
              onChange={handleFormChange}
              placeholder="Name"
              className="w-full mb-2 p-2 border rounded"
            />
            <textarea
              name="description"
              value={formState.description}
              onChange={handleFormChange}
              placeholder="Description"
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full mb-4 p-2 border rounded"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingBench(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        ref={mapContainerRef}
        className="w-full h-[300px] rounded shadow"
      />

      {hoverCoords && (
        <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow text-sm text-gray-700 z-50">
          <strong>Lat:</strong> {hoverCoords.lat.toFixed(5)} | <strong>Lng:</strong> {hoverCoords.lng.toFixed(5)}
        </div>
      )}

      {benches.length === 0 && (
        <p className="text-gray-500 text-center mt-8">
          You haven't added any benches yet
        </p>
      )}
    </div>
  );
}
