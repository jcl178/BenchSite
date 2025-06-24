'use client'

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/supabase-provider";
import { useRouter } from "next/navigation";

export default function AddBenchForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  console.log("Supabase client:", supabase);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    console.clear();
    console.log("🚀 Submitting new bench...");

    if (!user) {
      console.error("❌ No user logged in.");
      setMessage("You must be logged in.");
      return;
    }

    console.log("👤 User ID:", user.id);
    console.log("📍 Bench name:", name);
    console.log("📍 Lat/Lng:", lat, lng);
    console.log("🖼 Image file:", imageFile);

    let imageUrl = "";

    if (imageFile) {
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `${user.id}-${Date.now()}-${safeName}`;
      console.log("📦 Uploading image as:", filename);

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("bench-photos")
        .upload(filename, imageFile);

      if (uploadError) {
        console.error("❌ Upload failed:", uploadError);
        setMessage(`Upload error: ${uploadError.message}`);
        return;
      }

      console.log("✅ Upload succeeded:", uploadData);

      const { data: publicUrlData } = supabase.storage
        .from("bench-photos")
        .getPublicUrl(filename);

      imageUrl = publicUrlData.publicUrl;
      console.log("🌐 Public image URL:", imageUrl);
    }

    const latParsed = parseFloat(lat);
    const lngParsed = parseFloat(lng);

    if (isNaN(latParsed) || isNaN(lngParsed)) {
      console.error("❌ Invalid coordinates");
      setMessage("Please enter valid numbers for latitude and longitude.");
      return;
    }

    console.log("📝 Inserting bench into DB...");

    const { error: insertError, data: insertData } = await supabase
      .from("benches")
      .insert({
        user_id: user.id,
        name,
        description,
        lat: latParsed,
        lng: lngParsed,
        image_url: imageUrl,
      });

    if (insertError) {
      console.error("❌ Insert failed:", insertError);
      setMessage(`Insert error: ${insertError.message}`);
    } else {
      console.log("✅ Insert succeeded:", insertData);
      setMessage("Bench added!");
      router.push("/my-benches");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-black p-6 rounded shadow max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add a Bench</h2>

      <input type="text" placeholder="Name" value={name}
        onChange={(e) => setName(e.target.value)} className="w-full mb-2 p-2 border" />

      <textarea placeholder="Description" value={description}
        onChange={(e) => setDescription(e.target.value)} className="w-full mb-2 p-2 border" />

      <input type="text" placeholder="Latitude" value={lat}
        onChange={(e) => setLat(e.target.value)} className="w-full mb-2 p-2 border" />

      <input type="text" placeholder="Longitude" value={lng}
        onChange={(e) => setLng(e.target.value)} className="w-full mb-2 p-2 border" />

      <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        className="w-full mb-4" />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">Add Bench</button>

      {message && <p className="mt-4 text-red-600">{message}</p>}
    </form>
  );
}
