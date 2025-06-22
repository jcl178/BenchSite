'use client'

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

export default function Map() {
  const mapContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!; // 🔑 Set here

    const map = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [172.6306, -43.5321], // Christchurch
      zoom: 12,
    });

    new mapboxgl.Marker()
      .setLngLat([174.7633, -36.8485])
      .setPopup(new mapboxgl.Popup().setHTML(`<h3>Sample Bench</h3>`))
      .addTo(map);

    return () => map.remove();
  }, []);

  return <div ref={mapContainer} className="w-full h-[80vh] rounded-lg shadow-md" />;
}
