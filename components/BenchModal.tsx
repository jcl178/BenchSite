'use client'

import { Bench } from "@/data/benches";

type Props = {
  bench: Bench;
  onClose: () => void;
};

export default function BenchModal({ bench, onClose }: Props) {
  return (
    <div className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-lg z-50 overflow-y-auto p-4">
      <button onClick={onClose} className="text-gray-600 hover:text-gray-800 float-right text-xl">&times;</button>
      <h2 className="text-2xl text-gray-800 font-bold mb-2">{bench.name}</h2>
      <p className="mb-4 text-gray-600">{bench.description}</p>

      {bench.image_url && (
        <img
          src={bench.image_url}
          alt={bench.name}
          className="mb-2 rounded shadow-md w-full"
        />
      )}
    </div>
  );
}
