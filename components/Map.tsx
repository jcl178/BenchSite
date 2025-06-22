'use client'

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { benches, Bench } from "@/data/benches";

type MapProps = {
  onSelectBench: (bench: Bench) => void;
};

export default function Map({ onSelectBench }: MapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    const map = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [172.6306, -43.5321], // Christchurch
      zoom: 13,
    });

    benches.forEach((bench) => {
      const el = document.createElement("div");
      el.className = "marker";
      el.style.width = "20px";
      el.style.height = "20px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "red";
      el.style.cursor = "pointer";

      el.addEventListener("click", () => {
        onSelectBench(bench); // ✅ Show modal with info
      });

      new mapboxgl.Marker(el)
        .setLngLat([bench.lng, bench.lat])
        .addTo(map);
    });

    return () => map.remove();
  }, [onSelectBench]);

  return <div ref={mapContainer} className="w-full h-[80vh] rounded-lg shadow-md" />;
}
