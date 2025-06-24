'use client';

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { createClient } from "@/app/utils/supabase/client";
import { Bench } from "@/data/benches"; // You can keep this type if it's accurate

type MapProps = {
  onSelectBench: (bench: Bench) => void;
};

export default function Map({ onSelectBench }: MapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [benchMarkers, setBenchMarkers] = useState<mapboxgl.Marker[]>([]);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    const newMap = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [172.6306, -43.5321], // Christchurch
      zoom: 13,
    });

    setMap(newMap);

    return () => newMap.remove();
  }, []);

  useEffect(() => {
    const fetchBenches = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("benches").select("*");

      if (error) {
        console.error("❌ Error fetching benches:", error.message);
        return;
      }

      if (!map || !data) return;

      // Clear any previous markers
      benchMarkers.forEach(marker => marker.remove());

      const newMarkers = data.map((bench: Bench) => {
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

        return new mapboxgl.Marker(el)
          .setLngLat([bench.lng, bench.lat])
          .addTo(map);
      });

      setBenchMarkers(newMarkers);
    };

    fetchBenches();
  }, [map, onSelectBench]);

  return <div ref={mapContainer} className="w-full h-[80vh] rounded-lg shadow-md" />;
}
