'use client'

import { useState } from "react";
import Map from "@/components/Map";
import BenchModal from "@/components/BenchModal";
import { Bench } from "@/data/benches";

export default function HomePage() {
  const [selectedBench, setSelectedBench] = useState<Bench | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ lat: number; lng: number } | null>(null);

  return (
    <main className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="bg-gradient-maroon text-center py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gold-primary mb-4 animate-fade-in">
            Discover Amazing
          </h1>
          <h2 className="text-4xl md:text-5xl font-light text-cream mb-6 animate-fade-in">
            Benches with a View
          </h2>
          <p className="text-xl text-cream/90 max-w-2xl mx-auto leading-relaxed animate-slide-up">
            Find and share the most beautiful bench locations around the world. 
            Every bench tells a story, every view creates a memory.
          </p>
        </div>
      </div>

      {/* Map Section */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-maroon-primary/20 to-transparent z-10 pointer-events-none"></div>
        
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="card-elegant p-6 rounded-2xl overflow-hidden">
              <div className="mb-4 text-center">
                <h3 className="text-2xl font-semibold text-text-dark mb-2">
                  Explore Beautiful Bench Locations
                </h3>
                <p className="text-text-light">
                  Click on the markers to discover amazing spots or add your own favorite bench!
                </p>
              </div>
              
              <div className="rounded-xl overflow-hidden shadow-lg">
                <Map 
                  onSelectBench={(bench) => setSelectedBench(bench)} 
                  onHoverCoords={setHoverCoords}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 bg-warm-gray/50">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-text-dark mb-12">
            Why Choose Our Platform?
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 card-elegant">
              <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🗺️</span>
              </div>
              <h4 className="text-xl font-semibold text-text-dark mb-3">Interactive Map</h4>
              <p className="text-text-light">
                Explore bench locations with our beautiful, responsive map interface.
              </p>
            </div>
            
            <div className="text-center p-6 card-elegant">
              <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📸</span>
              </div>
              <h4 className="text-xl font-semibold text-text-dark mb-3">Share Photos</h4>
              <p className="text-text-light">
                Upload beautiful photos of your favorite bench spots to inspire others.
              </p>
            </div>
            
            <div className="text-center p-6 card-elegant">
              <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌟</span>
              </div>
              <h4 className="text-xl font-semibold text-text-dark mb-3">Community</h4>
              <p className="text-text-light">
                Join a community of bench enthusiasts and discover hidden gems.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bench Modal */}
      {selectedBench && (
        <BenchModal bench={selectedBench} onClose={() => setSelectedBench(null)} />
      )}
      
      {/* Coordinate Display */}
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
    </main>
  );
}
