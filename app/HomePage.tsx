'use client'

import { useState } from "react";
import Map from "@/components/Map";
import BenchModal from "@/components/BenchModal";
import { Bench } from "@/data/benches";

export default function HomePage() {
  const [selectedBench, setSelectedBench] = useState<Bench | null>(null);

  return (
    <main className="min-h-screen bg-black-100 p-4 relative">
      <h1 className="text-3xl font-bold mb-4">Benches with a View</h1>
      <Map onSelectBench={setSelectedBench} />
      {selectedBench && (
        <BenchModal bench={selectedBench} onClose={() => setSelectedBench(null)} />
      )}
    </main>
  );
}
