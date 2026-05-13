export type Product = {
  brand: string;
  category: string;
  productName: string;
  primarySize: string;
  availableSizesCount: number;
  vehicleType: string;
  loadIndex: string;
  plyRating: string;
  starRating: number;
  image: string;
  isBookmarked: boolean;
};

export const productCatalog: Product[] = [
  {
    brand: "Maxam",
    category: "Highway Tyre",
    productName: "Highway Pro HP-300",
    primarySize: "295/80 R22.5",
    availableSizesCount: 6,
    vehicleType: "",
    loadIndex: "152/148",
    plyRating: "16PR",
    starRating: 4.8,
    image: "/images/tyre-image.jpeg",
    isBookmarked: true
  },
  {
    brand: "Michelin",
    category: "Mixed Service Tyre",
    productName: "TerraGrip MX",
    primarySize: "10.00 R20",
    availableSizesCount: 4,
    vehicleType: "",
    loadIndex: "146/143",
    plyRating: "16PR",
    starRating: 4.6,
    image: "/images/tyre-image.jpeg",
    isBookmarked: true
  },
  {
    brand: "Bridgestone",
    category: "Light Tyre",
    productName: "UrbanRide CT-90",
    primarySize: "215/75 R15",
    availableSizesCount: 8,
    vehicleType: "Light",
    loadIndex: "110/108",
    plyRating: "8PR",
    starRating: 4.4,
    image: "/images/tyre-image.jpeg",
    isBookmarked: true
  },
  {
    brand: "Michelin",
    category: "Off-Road Tyre",
    productName: "OffRoad Beast OR-X",
    primarySize: "385/65 R22.5",
    availableSizesCount: 5,
    vehicleType: "Heavy",
    loadIndex: "160",
    plyRating: "20PR",
    starRating: 4.9,
    image: "/images/tyre-image.jpeg",
    isBookmarked: true
  },
  {
    brand: "Bridgestone",
    category: "Regional Haul Tyre",
    productName: "Duratrail RH-7",
    primarySize: "11.00 R20",
    availableSizesCount: 3,
    vehicleType: "Regional Transport",
    loadIndex: "150/146",
    plyRating: "18PR",
    starRating: 4.7,
    image: "/images/home-image-2.png",
    isBookmarked: true
  },
  {
    brand: "Maxam",
    category: "Construction Tyre",
    productName: "SiteMaster XM",
    primarySize: "315/80 R22.5",
    availableSizesCount: 5,
    vehicleType: "Construction Fleet",
    loadIndex: "156/150",
    plyRating: "18PR",
    starRating: 4.5,
    image: "/images/home-image-1.png",
    isBookmarked: false
  },
  {
    brand: "Michelin",
    category: "All-Terrain Tyre",
    productName: "RoadTerrain AT-5",
    primarySize: "265/70 R19.5",
    availableSizesCount: 4,
    vehicleType: "Utility Vehicle",
    loadIndex: "140/137",
    plyRating: "14PR",
    starRating: 4.3,
    image: "/images/home-image-1.png",
    isBookmarked: false
  },
  {
    brand: "Continental",
    category: "Urban Delivery Tyre",
    productName: "CityHaul CD-12",
    primarySize: "225/70 R17.5",
    availableSizesCount: 4,
    vehicleType: "Delivery",
    loadIndex: "129/127",
    plyRating: "12PR",
    starRating: 4.4,
    image: "/images/home-image-3.png",
    isBookmarked: false
  }
];

export const featuredProducts = productCatalog;

export const bookmarkedProducts = productCatalog.filter(
  (product) => product.isBookmarked
);
