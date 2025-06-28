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

  useEffect(() => {
    const supabase = createClient();

    const loadBenches = async () => {
      const { data, error } = await supabase.from("benches").select("*");
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

    return () => newMap.remove();
  }, []);

  useEffect(() => {
    if (!map) return;

    benches.forEach((bench) => {
      const el = document.createElement("div");
      el.className = "marker";
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "red";
      el.style.cursor = "pointer";

      el.addEventListener("click", () => {
        onSelectBench(bench);
      });

      new mapboxgl.Marker(el)
        .setLngLat([bench.lng, bench.lat])
        .addTo(map);
    });
  }, [map, benches, onSelectBench]);

  return <div ref={mapContainer} className="w-full h-[80vh] rounded-lg shadow-md" />;
}
