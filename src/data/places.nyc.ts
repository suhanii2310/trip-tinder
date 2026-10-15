// New York seed deck. This file is the source of truth: `npm run seed:sql` turns it
// into supabase/seed.sql. Coordinates, distances and visit lengths are estimates;
// entries marked CHECK need a human to confirm them.
//
// Photos: set imageUrl to a licensed image URL. While it is null, cards show the
// gradient (colorFrom -> colorTo) with the `art` icon, like the mock.

export type Category = "do" | "eat" | "stay";
export type Slot = "morning" | "afternoon" | "evening";

export type Place = {
  id: string;
  city: string;
  name: string;
  category: Category;
  area: string;
  lat: number;
  lng: number;
  price: 1 | 2 | 3;
  distKm: number; // straight line from Midtown (Times Square, 40.758, -73.9855)
  visitMinutes: number; // 0 for places to stay
  slot: Slot | null; // best time of day; null for places to stay
  description: string;
  tags: [string, string];
  isSample: boolean; // true for placeholder listings, shown as "Sample listing"
  imageUrl: string | null;
  art: string;
  colorFrom: string;
  colorTo: string;
};

export const NYC_PLACES: Place[] = [
  {
    id: "central-park",
    city: "New York",
    name: "Central Park walk",
    category: "do",
    area: "Central Park",
    lat: 40.774, // Bethesda Terrace
    lng: -73.9708,
    price: 1,
    distKm: 2.2,
    visitMinutes: 120,
    slot: "morning",
    description: "An easy loop past lawns, lakes and Bethesda Terrace, right in the middle of Manhattan.",
    tags: ["Outdoors", "Free"],
    isSample: false,
    imageUrl: null,
    art: "tree",
    colorFrom: "#9BD17B",
    colorTo: "#2E7D4F",
  },
  {
    id: "high-line",
    city: "New York",
    name: "The High Line",
    category: "do",
    area: "Chelsea",
    lat: 40.748, // midpoint of the park
    lng: -74.0048,
    price: 1,
    distKm: 2.0,
    visitMinutes: 90,
    slot: "afternoon",
    description: "A park built on an old elevated rail line, with gardens, public art and views down the West Side.",
    tags: ["Views", "On foot"],
    isSample: false,
    imageUrl: null,
    art: "rail",
    colorFrom: "#B5E3A1",
    colorTo: "#3E8E6E",
  },
  {
    id: "the-met",
    city: "New York",
    name: "The Met museum",
    category: "do",
    area: "Upper East Side",
    lat: 40.7794,
    lng: -73.9632,
    price: 2, // CHECK: $$ assumes the standard adult ticket
    distKm: 3.0,
    visitMinutes: 180,
    slot: "afternoon",
    description: "One of the world's great art museums. Pick a wing or two and it still fills an afternoon.",
    tags: ["Museum", "Indoors"],
    isSample: false,
    imageUrl: null,
    art: "columns",
    colorFrom: "#8EA7E9",
    colorTo: "#4B3FA8",
  },
  {
    id: "brooklyn-bridge",
    city: "New York",
    name: "Brooklyn Bridge at sunset",
    category: "do",
    area: "Lower Manhattan",
    lat: 40.7061, // middle of the span
    lng: -73.9969,
    price: 1,
    distKm: 5.8,
    visitMinutes: 60,
    slot: "evening",
    description: "Walk the bridge's wooden promenade as the Manhattan skyline lights up behind you.",
    tags: ["Landmark", "Free"],
    isSample: false,
    imageUrl: null,
    art: "bridge",
    colorFrom: "#FFC857",
    colorTo: "#E5483D",
  },
  {
    id: "village-jazz",
    city: "New York",
    name: "Jazz night in Greenwich Village",
    category: "do",
    area: "Greenwich Village",
    lat: 40.7336, // CHECK: generic Village point, no specific club chosen
    lng: -74.0003,
    price: 2,
    distKm: 3.0,
    visitMinutes: 120,
    slot: "evening",
    description: "Live jazz in a small, low-lit club, in the neighborhood where so much of the music's history happened.",
    tags: ["Live music", "Nightlife"],
    isSample: false,
    imageUrl: null,
    art: "note",
    colorFrom: "#9C4A6E",
    colorTo: "#2B1B3D",
  },
  {
    id: "chelsea-market",
    city: "New York",
    name: "Chelsea Market",
    category: "eat",
    area: "Chelsea",
    lat: 40.7424,
    lng: -74.0061,
    price: 2,
    distKm: 2.5,
    visitMinutes: 75,
    slot: "afternoon",
    description: "A food hall in an old factory building, so everyone can order something different.",
    tags: ["Food hall", "Something for everyone"],
    isSample: false,
    imageUrl: null,
    art: "bowl",
    colorFrom: "#FF9E5E",
    colorTo: "#C2410C",
  },
  {
    id: "bagel-breakfast",
    city: "New York",
    name: "Bagel breakfast",
    category: "eat",
    area: "Lower East Side", // CHECK: neighborhood chosen by us, no specific shop
    lat: 40.7223,
    lng: -73.9874,
    price: 1,
    distKm: 4.0,
    visitMinutes: 45,
    slot: "morning",
    description: "A classic New York bagel with a schmear, the city's favorite way to start the day.",
    tags: ["Breakfast", "Classic NYC"],
    isSample: false,
    imageUrl: null,
    art: "bagel",
    colorFrom: "#FFD58A",
    colorTo: "#D9861A",
  },
  {
    id: "chinatown-dinner",
    city: "New York",
    name: "Chinatown dinner",
    category: "eat",
    area: "Chinatown",
    lat: 40.7158,
    lng: -73.997,
    price: 2,
    distKm: 4.8,
    visitMinutes: 90,
    slot: "evening",
    description: "Dumplings, noodles and plates to share in one of the city's busiest food neighborhoods.",
    tags: ["Dinner", "Shared plates"],
    isSample: false,
    imageUrl: null,
    art: "noodles",
    colorFrom: "#F27A6B",
    colorTo: "#9C2B2B",
  },
  {
    id: "midtown-hotel",
    city: "New York",
    name: "Midtown hotel",
    category: "stay",
    area: "Midtown",
    lat: 40.7549, // near Bryant Park
    lng: -73.984,
    price: 3,
    distKm: 0.4,
    visitMinutes: 0,
    slot: null,
    description: "A central stay a short walk from Times Square and Bryant Park, with subway lines close by.",
    tags: ["Central", "Near the subway"],
    isSample: true,
    imageUrl: null,
    art: "bed",
    colorFrom: "#7FB7A4",
    colorTo: "#1F6F5C",
  },
  {
    id: "brooklyn-guesthouse",
    city: "New York",
    name: "Brooklyn guesthouse",
    category: "stay",
    area: "Williamsburg", // CHECK: neighborhood chosen by us
    lat: 40.7081,
    lng: -73.9571,
    price: 1,
    distKm: 6.0,
    visitMinutes: 0,
    slot: null,
    description: "A small guesthouse across the river, a subway ride from Manhattan and easier on the budget.",
    tags: ["Budget", "Neighborhood feel"],
    isSample: true,
    imageUrl: null,
    art: "bed",
    colorFrom: "#F4A261",
    colorTo: "#9C3D2E",
  },
];
