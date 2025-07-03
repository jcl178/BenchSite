'use client'

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/supabase-provider";
import { useRouter } from "next/navigation";
import UserBar from "./UserBar";

export default function AddBenchForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude.toString());
          setLng(position.coords.longitude.toString());
          setMessage("📍 Location detected successfully!");
        },
        (error) => {
          setMessage("Unable to get your location. Please enter coordinates manually.");
        }
      );
    } else {
      setMessage("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    if (!user) {
      setMessage("You must be logged in.");
      setIsLoading(false);
      return;
    }

    // Validation
    if (!name.trim()) {
      setMessage("Please enter a name for the bench.");
      setIsLoading(false);
      return;
    }

    const latParsed = parseFloat(lat);
    const lngParsed = parseFloat(lng);

    if (isNaN(latParsed) || isNaN(lngParsed)) {
      setMessage("Please enter valid numbers for latitude and longitude.");
      setIsLoading(false);
      return;
    }

    if (latParsed < -90 || latParsed > 90) {
      setMessage("Latitude must be between -90 and 90.");
      setIsLoading(false);
      return;
    }

    if (lngParsed < -180 || lngParsed > 180) {
      setMessage("Longitude must be between -180 and 180.");
      setIsLoading(false);
      return;
    }

    try {
      let imageUrl = "";

      if (imageFile) {
        const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${user.id}-${Date.now()}-${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from("bench-photos")
          .upload(filename, imageFile);

        if (uploadError) {
          setMessage(`Upload error: ${uploadError.message}`);
          setIsLoading(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("bench-photos")
          .getPublicUrl(filename);

        imageUrl = publicUrlData.publicUrl;
      }

      const { error: insertError } = await supabase
        .from("benches")
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description.trim(),
          lat: latParsed,
          lng: lngParsed,
          image_url: imageUrl,
        });

      if (insertError) {
        setMessage(`Error: ${insertError.message}`);
      } else {
        setMessage("✅ Bench added successfully! Redirecting...");
        setTimeout(() => router.push("/my-benches"), 2000);
      }
    } catch (error) {
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <UserBar />
      
      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-maroon-primary mb-4">
              Add a Beautiful Bench
            </h1>
            <p className="text-text-light text-lg">
              Share a special bench location with our community
            </p>
            <div className="w-24 h-1 bg-gradient-gold mx-auto rounded-full mt-4"></div>
          </div>

          {/* Form */}
          <div className="card-elegant p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bench Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text-dark mb-2">
                  Bench Name *
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="e.g., Sunset View Bench, Garden Paradise..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-warm-gray rounded-lg text-text-dark placeholder-text-light focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-transparent transition-all duration-300"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-text-dark mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  placeholder="Describe what makes this bench special - the view, surroundings, or atmosphere..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-warm-gray rounded-lg text-text-dark placeholder-text-light focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-transparent transition-all duration-300 resize-none"
                />
              </div>

              {/* Location */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-text-dark">
                    Location *
                  </label>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                                          className="px-4 py-2 bg-gradient-gold text-maroon-primary font-medium rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm"
                  >
                    📍 Use Current Location
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="lat" className="block text-xs font-medium text-text-light mb-1">
                      Latitude
                    </label>
                    <input
                      id="lat"
                      type="number"
                      step="any"
                      placeholder="-43.5321"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-warm-gray rounded-lg text-text-dark placeholder-text-light focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label htmlFor="lng" className="block text-xs font-medium text-text-light mb-1">
                      Longitude
                    </label>
                    <input
                      id="lng"
                      type="number"
                      step="any"
                      placeholder="172.6306"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-warm-gray rounded-lg text-text-dark placeholder-text-light focus:outline-none focus:ring-2 focus:ring-gold-primary focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-text-dark mb-2">
                  Bench Photo
                </label>
                <div className="space-y-4">
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                                          className="w-full px-4 py-3 border border-warm-gray rounded-lg text-text-dark file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-gold file:text-maroon-primary file:font-medium hover:file:shadow-lg transition-all duration-300"
                  />
                  
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-300"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold text-gold-primary transition-all duration-300 transform border-2 border-gold-primary ${
                    isLoading
                      ? 'bg-text-light cursor-not-allowed'
                      : 'bg-gradient-maroon hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Adding Bench...
                    </div>
                  ) : (
                    <>
                      Add Bench
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="px-6 py-3 border-2 border-maroon-primary text-maroon-primary hover:bg-maroon-primary hover:text-white font-semibold rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Message Display */}
            {message && (
              <div className={`mt-6 p-4 rounded-lg text-sm ${
                message.includes("error") || message.includes("Error")
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : message.includes("✅") || message.includes("success")
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              } animate-slide-up`}>
                <div className="flex items-center">
                  <span className="mr-2">
                    {message.includes("error") || message.includes("Error") ? "❌" :
                     message.includes("✅") || message.includes("success") ? "✅" : "ℹ️"}
                  </span>
                  {message}
                </div>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="mt-8 card-elegant p-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center">
              <span className="mr-2">💡</span>
              Tips for Great Bench Submissions
            </h3>
            <div className="space-y-3 text-text-light">
              <div className="flex items-start">
                <span className="mr-2 text-gold-primary">•</span>
                <span>Choose benches with beautiful views or interesting surroundings</span>
              </div>
              <div className="flex items-start">
                <span className="mr-2 text-gold-primary">•</span>
                <span>Take photos during golden hour for the best lighting</span>
              </div>
              <div className="flex items-start">
                <span className="mr-2 text-gold-primary">•</span>
                <span>Include details about what makes this location special</span>
              </div>
              <div className="flex items-start">
                <span className="mr-2 text-gold-primary">•</span>
                <span>Double-check coordinates for accuracy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
