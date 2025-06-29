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

  return (
    <div className="p-4">
      <UserBar />
      <h1 className="text-2xl font-bold mb-4">My Benches</h1>

      {message && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {benches.map((bench) => (
          <div
            key={bench.id}
            className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-lg"
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
          </div>
        ))}
      </div>

      <div
        ref={mapContainerRef}
        className="w-full h-[300px] rounded shadow"
      />

      {hoverCoords && (
        <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow text-sm text-gray-700 z-50">
          <strong>Lat:</strong> {hoverCoords.lat.toFixed(5)} | <strong>Lng:</strong> {hoverCoords.lng.toFixed(5)}
        </div>
      )}
    </div>
  );
}
