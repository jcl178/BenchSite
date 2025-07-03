'use client'

import { Bench } from "@/data/benches";

type Props = {
  bench: Bench;
  onClose: () => void;
};

export default function BenchModal({ bench, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-end z-50 animate-fade-in">
      <div className="w-full max-w-md h-full bg-gradient-subtle shadow-2xl overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-maroon p-6 text-white relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white text-xl font-bold transition-all duration-300 hover:scale-110"
          >
            ×
          </button>
          
          <div className="pr-12">
            <h2 className="text-2xl font-bold text-gold-primary mb-2">{bench.name}</h2>
            <p className="text-cream/90 text-sm flex items-center">
              <span className="mr-2">📍</span>
              Beautiful bench location
            </p>
          </div>
        </div>

        {/* Image Section */}
        {bench.image_url && (
          <div className="relative">
            <img
              src={bench.image_url}
              alt={bench.name}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div className="card-elegant p-4">
            <h3 className="text-lg font-semibold text-text-dark mb-3 flex items-center">
              <span className="mr-2">📝</span>
              Description
            </h3>
            <p className="text-text-light leading-relaxed">
              {bench.description || "No description available for this beautiful bench location."}
            </p>
          </div>

          {/* Location Details */}
          <div className="card-elegant p-4">
            <h3 className="text-lg font-semibold text-text-dark mb-3 flex items-center">
              <span className="mr-2">🗺️</span>
              Location Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-text-light font-medium">Latitude:</span>
                <span className="text-text-dark font-mono text-sm bg-warm-gray px-2 py-1 rounded">
                  {bench.lat?.toFixed(6)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-light font-medium">Longitude:</span>
                <span className="text-text-dark font-mono text-sm bg-warm-gray px-2 py-1 rounded">
                  {bench.lng?.toFixed(6)}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="card-elegant p-4">
            <h3 className="text-lg font-semibold text-text-dark mb-3 flex items-center">
              <span className="mr-2">✨</span>
              Status
            </h3>
            <div className="flex items-center">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                bench.approved 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
              }`}>
                {bench.approved ? '✅ Verified Location' : '⏳ Pending Verification'}
              </div>
            </div>
            <p className="text-text-light text-sm mt-2">
              {bench.approved 
                ? 'This bench location has been verified by our community.' 
                : 'This location is waiting for community verification.'}
            </p>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-warm-gray">
            <div className="grid grid-cols-2 gap-3">
              <button className="px-4 py-3 bg-gradient-gold text-maroon-primary font-semibold rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105">
                <span className="mr-2">🧭</span>
                Get Directions
              </button>
              <button className="px-4 py-3 border-2 border-maroon-primary text-maroon-primary hover:bg-maroon-primary hover:text-white font-semibold rounded-lg transition-all duration-300">
                <span className="mr-2">❤️</span>
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-warm-gray p-4 text-center">
          <p className="text-text-light text-sm">
            Discovered a beautiful bench? 
            <button className="ml-1 text-maroon-primary font-semibold hover:text-maroon-secondary transition-colors">
              Share your own!
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
