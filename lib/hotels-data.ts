export interface HotelRoom {
  type: string
  priceRange: string
}

export interface Hotel {
  name: string
  rooms: HotelRoom[]
  distance: string
  mapsUrl: string
}

export const hotelsData: Hotel[] = [
  {
    name: "Daima Suites Margonda",
    distance: "6 km",
    mapsUrl: "https://maps.app.goo.gl/8SiGdcTHDNPk3C9GA",
    rooms: [
      { type: "Suite 1BR Twin", priceRange: "Rp. 422,000 - Rp. 515,000" },
      { type: "Deluxe Suite", priceRange: "Rp. 570,000 - Rp. 700,000" },
      { type: "Suite 1BR Double", priceRange: "Rp. 490,000 - Rp. 595,000" },
      { type: "Suites 1 Bedroom Double", priceRange: "Rp. 560,000 - Rp. 680,000" },
    ],
  },
  {
    name: "Apartemen Evenciio by En's Room",
    distance: "6.2 km",
    mapsUrl: "https://maps.app.goo.gl/mFiwfn3pUHfAKc1A9",
    rooms: [{ type: "Bedroom Studio Apartment", priceRange: "Rp. 210,000 - Rp. 315,000" }],
  },
  {
    name: "Studio Dave Apartment",
    distance: "2.1 km",
    mapsUrl: "https://maps.app.goo.gl/vW7p3qUi7uYZTJKb8",
    rooms: [
      { type: "Bedroom Studio Apartment", priceRange: "Rp. 215,000 - Rp. 265,000" },
      { type: "Room", priceRange: "Rp. 290,000 - Rp. 355,000" },
    ],
  },
  {
    name: "Younz Apartmen By Margonda Residence 2",
    distance: "3.2 km",
    mapsUrl: "https://maps.app.goo.gl/hoCfsSTbrrfSphS16",
    rooms: [{ type: "Bedroom Studio Apartment", priceRange: "Rp. 155,000 - Rp. 215,000" }],
  },
  {
    name: "Wisma Makara Universitas Indonesia",
    distance: "3.3 km",
    mapsUrl: "https://maps.app.goo.gl/Nhozv5MRvwHXP2XS8",
    rooms: [
      { type: "Deluxe", priceRange: "Rp. 575,000 - Rp. 700,000" },
      { type: "Suite", priceRange: "Rp. 660,000 - Rp. 800,000" },
    ],
  },
  {
    name: "Star Apartemen Margonda Residence 2 Depok",
    distance: "5.7 km",
    mapsUrl: "https://maps.app.goo.gl/wJXbgXfkhnNAwL4s5",
    rooms: [
      { type: "Studio Room", priceRange: "Rp. 250,000 - Rp. 310,000" },
      { type: "Studio", priceRange: "Rp. 250,000 - Rp. 315,000" },
    ],
  },
  {
    name: "G357 Near Margo City",
    distance: "6.8 km",
    mapsUrl: "https://maps.app.goo.gl/TNXgnmyY7USBj1sD7",
    rooms: [
      { type: "Standard Room", priceRange: "Rp. 180,000 - Rp. 250,000" },
      { type: "Superior Room", priceRange: "Rp. 190,000 - Rp. 215,000" },
      { type: "Deluxe Room", priceRange: "Rp. 210,000 - Rp. 300,000" },
      { type: "Super Deluxe", priceRange: "Rp. 225,000 - Rp. 300,000" },
      { type: "Junior Suite", priceRange: "Rp. 240,000 - Rp. 350,000" },
    ],
  },
  {
    name: "Hotel Bumi Wiyata",
    distance: "7.6 km",
    mapsUrl: "https://maps.app.goo.gl/2rkuGVdyvHB9vQiP7",
    rooms: [
      { type: "Standard Junior Room", priceRange: "Rp. 380,000 - Rp. 580,000" },
      { type: "Twin Junior Room", priceRange: "Rp. 380,000 - Rp. 570,000" },
      { type: "Twin Superior Room", priceRange: "Rp. 420,000 - Rp. 605,000" },
      { type: "Junior Room", priceRange: "Rp. 440,000 - Rp. 550,000" },
      { type: "King Suite-nonsmoking", priceRange: "Rp. 600,000 - Rp. 710,000" },
      { type: "Suite Standard", priceRange: "Rp. 615,000 - Rp. 700,000" },
    ],
  },
  {
    name: "Savero Hotel Depok",
    distance: "7.7 km",
    mapsUrl: "https://maps.app.goo.gl/Y2RnbZB3PgqC1Gvd8",
    rooms: [
      { type: "Twin Superior Room", priceRange: "Rp. 440,000 - Rp. 600,000" },
      { type: "Twin Deluxe Room", priceRange: "Rp. 515,000 - Rp. 655,000" },
      { type: "King Deluxe Room", priceRange: "Rp. 590,000 - Rp. 675,000" },
    ],
  },
  {
    name: "Hotel Santika Depok",
    distance: "8.8 km",
    mapsUrl: "https://maps.app.goo.gl/rnj8Vne8QRjNL5d48",
    rooms: [
      { type: "King Superior Room", priceRange: "Rp. 500,000 - Rp. 535,000" },
      { type: "Twin Superior Room", priceRange: "Rp. 500,000 - Rp. 555,000" },
      { type: "Superior Room", priceRange: "Rp. 510,000 - Rp. 630,000" },
      { type: "Queen Superior Room", priceRange: "Rp. 550,000 - Rp. 670,000" },
      { type: "Deluxe Room", priceRange: "Rp. 600,000 - Rp. 750,000" },
    ],
  },
  {
    name: "RedLiving Apartemen",
    distance: "8.2 km",
    mapsUrl: "https://maps.app.goo.gl/AMc7KchHTMckAAyN9",
    rooms: [
      { type: "Bedroom Studio Apartment", priceRange: "Rp. 295,000 - Rp. 385,000" },
      { type: "Double Studio", priceRange: "Rp. 315,000 - Rp. 385,000" },
    ],
  },
  {
    name: "IRoom Margonda Residence 345",
    distance: "8.7 km",
    mapsUrl: "https://maps.app.goo.gl/JErpBMeydoV82qH8A",
    rooms: [
      { type: "Studio Apartment", priceRange: "Rp. 160,000 - Rp. 205,000" },
      { type: "Standard", priceRange: "Rp. 210,000 - Rp. 255,000" },
      { type: "Standard Studio", priceRange: "Rp. 410,000 - Rp. 500,000" },
      { type: "Economy Studio", priceRange: "Rp. 490,000 - Rp. 600,000" },
      { type: "Bussiness Studio", priceRange: "Rp. 575,000 - Rp. 700,000" },
    ],
  },
  {
    name: "favehotel margonda - depok",
    distance: "8.5 km",
    mapsUrl: "https://maps.app.goo.gl/wCKDqbDS8HnNLFDx9",
    rooms: [
      { type: "Faveroom", priceRange: "Rp. 390,000 - Rp. 450,000" },
      { type: "Standard Room", priceRange: "Rp. 395,000 - Rp. 460,000" },
    ],
  },
  {
    name: "DNA Apartment Margonda Residence 2",
    distance: "6 km",
    mapsUrl: "https://maps.app.goo.gl/SPpRWdzLwTFWKFba8",
    rooms: [
      { type: "Cozy Apartemen Margonda Residence", priceRange: "Rp. 160,000 - Rp. 215,000" },
      { type: "Dna Beautiful", priceRange: "Rp. 160,000 - Rp. 215,000" },
      { type: "Sweet Rooms", priceRange: "Rp. 160,000 - Rp. 215,000" },
    ],
  },
  {
    name: "Koolkost near Margo City",
    distance: "5.3 km",
    mapsUrl: "https://maps.app.goo.gl/8sXsK14XQ5eP7KREA",
    rooms: [
      { type: "Single Room", priceRange: "Rp. 65,000 - Rp. 80,000" },
      { type: "Twin Room", priceRange: "Rp. 95,000 - Rp. 120,000" },
      { type: "Single Standard Room", priceRange: "Rp. 100,000 - Rp. 125,000" },
      { type: "Twin Standard Room", priceRange: "Rp. 100,000 - Rp. 125,000" },
      { type: "Standard Room", priceRange: "Rp. 120,000 - Rp. 150,000" },
      { type: "Double Standard Room", priceRange: "Rp. 125,000 - Rp. 160,000" },
    ],
  },
  {
    name: "Koolkost near Universitas Indonesia",
    distance: "2 km",
    mapsUrl: "https://maps.app.goo.gl/UJwhq3astGkbJY736",
    rooms: [
      { type: "Queen Standard Room", priceRange: "Rp. 205,000 - Rp. 255,000" },
      { type: "Double Standard Room", priceRange: "Rp. 205,000 - Rp. 250,000" },
    ],
  },
]
