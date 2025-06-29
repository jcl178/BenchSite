'use client';

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { createClient } from "@/app/utils/supabase/client";
import { Bench } from "@/data/benches";

type MapProps = {
  onSelectBench: (bench: Bench) => void;
  onHoverCoords?: (coords: { lat: number; lng: number } | null) => void;
};

export default function Map({ onSelectBench, onHoverCoords }: MapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [benches, setBenches] = useState<Bench[]>([]);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    const supabase = createClient();

    const loadBenches = async () => {
      const { data, error } = await supabase.from("benches").select("*").eq("approved", true);
      if (error) {
        console.error("❌ Error fetching benches:", error);
        return;
      }
      console.log("✅ Fetched benches:", data);
      setBenches(data);
    };

    loadBenches();
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [172.6306, -43.5321], // Christchurch
      zoom: 13,
    });

    // Add hover coordinates functionality if callback provided
    if (onHoverCoords) {
      newMap.on("mousemove", (e) => {
        onHoverCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      });

      newMap.on("mouseleave", () => {
        onHoverCoords(null);
      });
    }

    setMap(newMap);

    return () => {
      // Clean up markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      newMap.remove();
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    benches.forEach((bench) => {
      const el = document.createElement("div");
      el.className = "marker";
      el.style.width = "18px";
      el.style.height = "30px";
      el.style.background = "linear-gradient(180deg, #8b5cf6, #ef4444)"; // purple to red gradient
      el.style.borderRadius = "50% 50% 50% 50% / 20% 20% 80% 80%";
      el.style.cursor = "pointer";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
      el.style.position = "relative";

      el.addEventListener("click", () => {
        onSelectBench(bench);
      });

      const marker = new mapboxgl.Marker({ element: el, offset: [0, -30] })
        .setLngLat([bench.lng, bench.lat])
        .addTo(map);
      
      markersRef.current.push(marker);
    });
  }, [map, benches, onSelectBench]);

  return <div ref={mapContainer} className="w-full h-[80vh] rounded-lg shadow-md" />;
}
