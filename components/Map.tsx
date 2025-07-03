'use client';

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { createClient } from "@/app/utils/supabase/client";
import { Bench } from "@/data/benches";

type MapProps = {
  onSelectBench: (bench: Bench) => void;
  onHoverCoords?: (coords: { lat: number; lng: number } | null) => void;
};

export default function Map({ onSelectBench, onHoverCoords }: MapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [benches, setBenches] = useState<Bench[]>([]);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    const supabase = createClient();

    const loadBenches = async () => {
      const { data, error } = await supabase.from("benches").select("*").eq("approved", true);
      if (error) {
        console.error("❌ Error fetching benches:", error);
        return;
      }
      console.log("✅ Fetched benches:", data);
      setBenches(data);
    };

    loadBenches();
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [172.6306, -43.5321], // Christchurch
      zoom: 13,
    });

    // Add hover coordinates functionality if callback provided
    if (onHoverCoords) {
      newMap.on("mousemove", (e) => {
        onHoverCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      });

      newMap.on("mouseleave", () => {
        onHoverCoords(null);
      });
    }

    setMap(newMap);

    return () => {
      // Clean up markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
      newMap.remove();
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Wait for map style to load before adding sources and layers
    const addClustering = () => {
      // Convert benches to GeoJSON format
      const geojsonData = {
        type: "FeatureCollection" as const,
        features: benches.map((bench) => ({
          type: "Feature" as const,
          properties: {
            id: bench.id,
            name: bench.name,
            description: bench.description,
            image_url: bench.image_url,
          },
          geometry: {
            type: "Point" as const,
            coordinates: [bench.lng, bench.lat],
          },
        })),
      };

      // Add source for clustering
      if (map.getSource("benches")) {
        (map.getSource("benches") as mapboxgl.GeoJSONSource).setData(geojsonData);
      } else {
        map.addSource("benches", {
          type: "geojson",
          data: geojsonData,
          cluster: true,
          clusterMaxZoom: 14, // Max zoom to cluster points on
          clusterRadius: 50, // Radius of each cluster when clustering points
        });

        // Add cluster circles
        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "benches",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#51bbd6", // Color for small clusters
              10,
              "#f1f075", // Color for medium clusters
              30,
              "#f28cb1", // Color for large clusters
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20, // Radius for small clusters
              10,
              30, // Radius for medium clusters
              30,
              40, // Radius for large clusters
            ],
          },
        });

        // Add cluster count labels
        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "benches",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          },
          paint: {
            "text-color": "#ffffff",
          },
        });

        // Add individual points (unclustered green dots)
        map.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "benches",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "#22c55e", // Green color
            "circle-radius": 8,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#fff",
          },
        });
      }
    };

    // Only add clustering if map style is loaded
    if (map.isStyleLoaded()) {
      addClustering();
    } else {
      map.once("styledata", addClustering);
    }

    // Add click handlers (these only need to be added once when layers exist)
    const handleClusterClick = (e: any) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });
      const clusterId = features[0]?.properties?.cluster_id;
      if (clusterId !== undefined) {
        (map.getSource("benches") as mapboxgl.GeoJSONSource).getClusterExpansionZoom(
          clusterId,
          (err, zoom) => {
            if (err || zoom === null) return;
            map.easeTo({
              center: (features[0].geometry as any).coordinates,
              zoom: zoom,
            });
          }
        );
      }
    };

    const handlePointClick = (e: any) => {
      const coordinates = (e.features?.[0]?.geometry as any)?.coordinates?.slice();
      const properties = e.features?.[0]?.properties;
      
      if (coordinates && properties) {
        // Find the corresponding bench object
        const bench = benches.find((b) => b.id === properties.id);
        if (bench) {
          onSelectBench(bench);
        }
      }
    };

    // Wait for layers to be added before attaching click handlers
    const waitForLayers = () => {
      if (map.getLayer("clusters") && map.getLayer("unclustered-point")) {
        map.on("click", "clusters", handleClusterClick);
        map.on("click", "unclustered-point", handlePointClick);
        
        map.on("mouseenter", "clusters", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "clusters", () => {
          map.getCanvas().style.cursor = "";
        });

        map.on("mouseenter", "unclustered-point", () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "unclustered-point", () => {
          map.getCanvas().style.cursor = "";
        });
      } else {
        // Check again in next frame
        requestAnimationFrame(waitForLayers);
      }
    };

    waitForLayers();

    // Cleanup function
    return () => {
      map.off("styledata", addClustering);
    };
  }, [map, benches, onSelectBench]);


  return <div ref={mapContainer} className="w-full h-[80vh] rounded-lg shadow-md" />;
}
