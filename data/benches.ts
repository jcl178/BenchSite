export type Bench = {
    id: string;
    name: string;
    lat: number;
    lng: number;
    photos: string[]; // For now, use public/images
    description: string;
  };
  
  export const benches: Bench[] = [
    {
      id: "1",
      name: "Test1",
      lat: -43.5321,
      lng: 172.6306,
      photos: ["/images/bench1.jpg"],
      description: "Beautiful view of the hills. Perfect for sunsets.",
    },
    {   
      id: "2",
      name: "Test2",
      lat: -43.5294,
      lng: 172.6236,
      photos: ["/images/bench1.jpg"],
      description: "Peaceful bench near the rose garden.",
    },
  ];
  