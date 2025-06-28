'use client'

import { useState } from "react";
import Map from "@/components/Map";
import BenchModal from "@/components/BenchModal";
import { Bench } from "@/data/benches";

export default function HomePage() {
  const [selectedBench, setSelectedBench] = useState<Bench | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ lat: number; lng: number } | null>(null);


  return (
    <main className="min-h-screen bg-black-100 p-4 relative">
      <h1 className="text-3xl font-bold mb-4">Benches with a View</h1>
      <Map 
        onSelectBench={(bench) => setSelectedBench(bench)} 
        onHoverCoords={setHoverCoords}
      />
      {selectedBench && (
        <BenchModal bench={selectedBench} onClose={() => setSelectedBench(null)} />
      )}
      
      {hoverCoords && (
        <div className="fixed bottom-4 right-4 bg-white p-2 rounded shadow text-sm text-gray-700 z-50">
          <strong>Lat:</strong> {hoverCoords.lat.toFixed(5)} | <strong>Lng:</strong> {hoverCoords.lng.toFixed(5)}
        </div>
      )}
    </main>
  );
}
