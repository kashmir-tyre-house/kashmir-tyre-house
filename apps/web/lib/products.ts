export type Product = {
  brand: string;
  category: string;
  productName: string;
  primarySize: string;
  availableSizesCount: number;
  application: string;
  keyFeature: string;
  loadIndex: string;
  image: string;
  isBookmarked: boolean;
};

export const productCatalog: Product[] = [
  {
    brand: "Maxam",
    category: "Highway Truck Tyre",
    productName: "Highway Pro HP-300",
    primarySize: "295/80 R22.5",
    availableSizesCount: 6,
    application: "Truck / Highway",
    keyFeature: "High load capacity",
    loadIndex: "152/148",
    image: "/images/tyre-image.jpeg",
    isBookmarked: true
  },
  {
    brand: "Michelin",
    category: "Mixed Service Tyre",
    productName: "TerraGrip MX",
    primarySize: "10.00 R20",
    availableSizesCount: 4,
    application: "Mixed Service",
    keyFeature: "Strong road grip",
    loadIndex: "146/143",
    image: "/images/tyre-image.jpeg",
    isBookmarked: true
  },
  {
    brand: "Bridgestone",
    category: "Light Truck Tyre",
    productName: "UrbanRide CT-90",
    primarySize: "215/75 R15",
    availableSizesCount: 8,
    application: "Light Truck",
    keyFeature: "Long tread life",
    loadIndex: "110/108",
    image: "/images/tyre-image.jpeg",
    isBookmarked: true
  },
  {
    brand: "Michelin",
    category: "Off-Road Tyre",
    productName: "OffRoad Beast OR-X",
    primarySize: "385/65 R22.5",
    availableSizesCount: 5,
    application: "Off-Road / Site",
    keyFeature: "Rugged terrain ready",
    loadIndex: "160",
    image: "/images/tyre-image.jpeg",
    isBookmarked: true
  },
  {
    brand: "Bridgestone",
    category: "Regional Haul Tyre",
    productName: "Duratrail RH-7",
    primarySize: "11.00 R20",
    availableSizesCount: 3,
    application: "Regional Transport",
    keyFeature: "Stable long-haul wear",
    loadIndex: "150/146",
    image: "/images/home-image-2.png",
    isBookmarked: true
  },
  {
    brand: "Maxam",
    category: "Construction Tyre",
    productName: "SiteMaster XM",
    primarySize: "315/80 R22.5",
    availableSizesCount: 5,
    application: "Construction / Fleet",
    keyFeature: "Cut-resistant compound",
    loadIndex: "156/150",
    image: "/images/home-image-4.png",
    isBookmarked: false
  },
  {
    brand: "Michelin",
    category: "All-Terrain Tyre",
    productName: "RoadTerrain AT-5",
    primarySize: "265/70 R19.5",
    availableSizesCount: 4,
    application: "Utility / Mixed Terrain",
    keyFeature: "Balanced grip and mileage",
    loadIndex: "140/137",
    image: "/images/home-image-1.png",
    isBookmarked: false
  }
];

export const featuredProducts = productCatalog;

export const bookmarkedProducts = productCatalog.filter(
  (product) => product.isBookmarked
);
