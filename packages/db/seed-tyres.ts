/**
 * Development-only seed script.
 * Inserts 20 dummy tyre products if the table is empty.
 * Runs automatically via `npm run predev` in local environments.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./src/schema.js";

const { brands, tyreProducts } = schema;

if (process.env.NODE_ENV === "production") {
  console.log("[seed] Skipping — production environment.");
  process.exit(0);
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("[seed] DATABASE_URL is not set.");
  process.exit(1);
}

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client, { schema });

async function main() {
  // Check if products already exist — skip if so
  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(tyreProducts);

  if (count > 0) {
    console.log(`[seed] ${count} tyre product(s) already exist — skipping seed.`);
    await client.end();
    return;
  }

  // Fetch existing brands to assign foreign keys
  const existingBrands = await db
    .select({ id: brands.id, name: brands.name })
    .from(brands);

  if (existingBrands.length === 0) {
    console.warn("[seed] No brands found — cannot seed tyre products. Add brands first.");
    await client.end();
    return;
  }

  console.log(`[seed] Found ${existingBrands.length} brand(s): ${existingBrands.map((b) => b.name).join(", ")}`);

  function brandId(i: number) {
    return existingBrands[i % existingBrands.length].id;
  }

  const products = [
    {
      brandId: brandId(0),
      name: "XDR Minemaster 40",
      description: "Heavy-duty radial tyre designed for underground mining equipment.",
      category: "Radial" as const,
      pattern: "XDR",
      tyreSize: "27.00 R49",
      tyreWeight: 540.00,
      application: "Mining",
      vehicleType: "Earthmover" as const,
      tyreType: "Tubeless",
      starRating: "3★",
      plyRating: null,
      loadIndex: "210A2",
      tyreFeatures: ["Self-cleaning tread", "Low heat build-up", "Cut resistant"],
      isActive: true,
    },
    {
      brandId: brandId(1),
      name: "Grader Pro 800",
      description: "Engineered for motor graders in road construction and maintenance.",
      category: "Radial" as const,
      pattern: "GP800",
      tyreSize: "23.5 R25",
      tyreWeight: 310.00,
      application: "Road Construction",
      vehicleType: "Grader" as const,
      tyreType: "Tubeless",
      starRating: "2★",
      plyRating: null,
      loadIndex: "192A2",
      tyreFeatures: ["Wide tread for stability", "High cut resistance"],
      isActive: true,
    },
    {
      brandId: brandId(2),
      name: "Dozer King 16PR",
      description: "Bias tyre built for demanding loader and dozer operations.",
      category: "Bais" as const,
      pattern: "DK16",
      tyreSize: "26.5-25",
      tyreWeight: 420.00,
      application: "Construction",
      vehicleType: "Loader and dozer" as const,
      tyreType: "Tube-type",
      starRating: null,
      plyRating: "16PR",
      loadIndex: "195A2",
      tyreFeatures: ["Deep tread depth", "Reinforced sidewall"],
      isActive: true,
    },
    {
      brandId: brandId(0),
      name: "Compactor C55",
      description: "Smooth tread pattern for soil and asphalt compaction.",
      category: "Bais" as const,
      pattern: "C55",
      tyreSize: "23.1-26",
      tyreWeight: 280.00,
      application: "Compaction",
      vehicleType: "Compactor" as const,
      tyreType: "Tube-type",
      starRating: null,
      plyRating: "12PR",
      loadIndex: "180A2",
      tyreFeatures: ["Smooth tread", "High load capacity"],
      isActive: true,
    },
    {
      brandId: brandId(1),
      name: "Underground UT700",
      description: "Designed for low-profile underground haulage trucks.",
      category: "Radial" as const,
      pattern: "UT700",
      tyreSize: "14.00 R24",
      tyreWeight: 195.00,
      application: "Underground Haulage",
      vehicleType: "Underground" as const,
      tyreType: "Tubeless",
      starRating: "4★",
      plyRating: null,
      loadIndex: "170A2",
      tyreFeatures: ["Puncture resistant", "Flame retardant compound"],
      isActive: true,
    },
    {
      brandId: brandId(2),
      name: "Crane Speedmaster HS",
      description: "High-speed crane tyre for highway and job-site travel.",
      category: "Radial" as const,
      pattern: "HS-CR",
      tyreSize: "445/95 R25",
      tyreWeight: 220.00,
      application: "Crane Operations",
      vehicleType: "Mobile crane (High-speed)" as const,
      tyreType: "Tubeless",
      starRating: "3★",
      plyRating: null,
      loadIndex: "176D",
      tyreFeatures: ["High-speed rated", "Reinforced bead"],
      isActive: true,
    },
    {
      brandId: brandId(0),
      name: "LogMaster Timber 24",
      description: "Tyre built for logging trucks on rough forest terrain.",
      category: "Bais" as const,
      pattern: "LM-T24",
      tyreSize: "12.5/80-18",
      tyreWeight: 145.00,
      application: "Logging",
      vehicleType: "Mining and Logging" as const,
      tyreType: "Tube-type",
      starRating: null,
      plyRating: "14PR",
      loadIndex: "152A8",
      tyreFeatures: ["Aggressive tread", "Sidewall protection"],
      isActive: true,
    },
    {
      brandId: brandId(1),
      name: "Industrial Forklift IF300",
      description: "Pneumatic industrial tyre for heavy forklifts.",
      category: "Bais" as const,
      pattern: "IF300",
      tyreSize: "8.25-15",
      tyreWeight: 55.00,
      application: "Forklift",
      vehicleType: "Industrial" as const,
      tyreType: "Tube-type",
      starRating: null,
      plyRating: "14PR",
      loadIndex: "148A5",
      tyreFeatures: ["Non-marking option", "Flat-proof design"],
      isActive: true,
    },
    {
      brandId: brandId(2),
      name: "EarthMax EM57",
      description: "Premium radial tyre for articulated dump trucks.",
      category: "Radial" as const,
      pattern: "EM57",
      tyreSize: "29.5 R29",
      tyreWeight: 690.00,
      application: "Dump Truck",
      vehicleType: "Earthmover" as const,
      tyreType: "Tubeless",
      starRating: "5★",
      plyRating: null,
      loadIndex: "220A8",
      tyreFeatures: ["Extended tread life", "Heat resistant casing", "Retreadable"],
      isActive: true,
    },
    {
      brandId: brandId(0),
      name: "GraderFlex GF200",
      description: "Flexible sidewall radial tyre for articulated graders.",
      category: "Radial" as const,
      pattern: "GF200",
      tyreSize: "17.5 R25",
      tyreWeight: 195.00,
      application: "Grading",
      vehicleType: "Grader" as const,
      tyreType: "Tubeless",
      starRating: "2★",
      plyRating: null,
      loadIndex: "174A2",
      tyreFeatures: ["Flexible sidewall", "Long tread life"],
      isActive: true,
    },
    {
      brandId: brandId(1),
      name: "LoaderMax LM1600",
      description: "Rock-duty bias tyre for wheel loaders in quarry operations.",
      category: "Bais" as const,
      pattern: "LM1600",
      tyreSize: "20.5-25",
      tyreWeight: 330.00,
      application: "Quarry",
      vehicleType: "Loader and dozer" as const,
      tyreType: "Tubeless",
      starRating: null,
      plyRating: "20PR",
      loadIndex: "186A2",
      tyreFeatures: ["Rock resistant tread", "Extra deep lugs"],
      isActive: true,
    },
    {
      brandId: brandId(2),
      name: "CompactorFlat CF80",
      description: "Flat base compactor tyre for smooth drum compactors.",
      category: "Bais" as const,
      pattern: "CF80",
      tyreSize: "13/80-20",
      tyreWeight: 110.00,
      application: "Asphalt Compaction",
      vehicleType: "Compactor" as const,
      tyreType: "Tube-type",
      starRating: null,
      plyRating: "10PR",
      loadIndex: "154A2",
      tyreFeatures: ["Smooth base", "Heat dissipation"],
      isActive: false,
    },
    {
      brandId: brandId(0),
      name: "UltraShield US900",
      description: "Flame-retardant underground tyre for battery-electric vehicles.",
      category: "Radial" as const,
      pattern: "US900",
      tyreSize: "12.00 R20",
      tyreWeight: 155.00,
      application: "Underground Mining",
      vehicleType: "Underground" as const,
      tyreType: "Tubeless",
      starRating: "3★",
      plyRating: null,
      loadIndex: "154A2",
      tyreFeatures: ["Flame retardant", "Anti-static", "Puncture belt"],
      isActive: true,
    },
    {
      brandId: brandId(1),
      name: "CraneHaul CH480",
      description: "Steer and drive tyre for all-terrain mobile cranes.",
      category: "Radial" as const,
      pattern: "CH480",
      tyreSize: "385/95 R24",
      tyreWeight: 180.00,
      application: "All-terrain Crane",
      vehicleType: "Mobile crane (High-speed)" as const,
      tyreType: "Tubeless",
      starRating: "2★",
      plyRating: null,
      loadIndex: "170F",
      tyreFeatures: ["On/off road capability", "Reinforced shoulder"],
      isActive: true,
    },
    {
      brandId: brandId(2),
      name: "TimberGrip TG18",
      description: "Skidder tyre with aggressive lug pattern for logging terrain.",
      category: "Bais" as const,
      pattern: "TG18",
      tyreSize: "30.5L-32",
      tyreWeight: 380.00,
      application: "Skidder",
      vehicleType: "Mining and Logging" as const,
      tyreType: "Tube-type",
      starRating: null,
      plyRating: "16PR",
      loadIndex: "176A8",
      tyreFeatures: ["High-lug pattern", "Self-cleaning"],
      isActive: false,
    },
    {
      brandId: brandId(0),
      name: "PortHandler PH550",
      description: "Heavy-duty industrial tyre for port reach stackers.",
      category: "Radial" as const,
      pattern: "PH550",
      tyreSize: "18.00 R25",
      tyreWeight: 390.00,
      application: "Port Handling",
      vehicleType: "Industrial" as const,
      tyreType: "Tubeless",
      starRating: "4★",
      plyRating: null,
      loadIndex: "188A2",
      tyreFeatures: ["Ultra high load", "Cut resistant casing"],
      isActive: true,
    },
    {
      brandId: brandId(1),
      name: "RockBuster RB45",
      description: "Extra deep tread radial for open-pit mining haul roads.",
      category: "Radial" as const,
      pattern: "RB45",
      tyreSize: "40.00 R57",
      tyreWeight: 950.00,
      application: "Open-pit Mining",
      vehicleType: "Earthmover" as const,
      tyreType: "Tubeless",
      starRating: "5★",
      plyRating: null,
      loadIndex: "224A8",
      tyreFeatures: ["Mega-tread depth", "Heat resistant", "Retreadable casing"],
      isActive: true,
    },
    {
      brandId: brandId(2),
      name: "GraderEdge GE310",
      description: "Shoulder-reinforced tyre for cold-mix grading operations.",
      category: "Bais" as const,
      pattern: "GE310",
      tyreSize: "14.00-24",
      tyreWeight: 175.00,
      application: "Cold Mix Grading",
      vehicleType: "Grader" as const,
      tyreType: "Tube-type",
      starRating: null,
      plyRating: "12PR",
      loadIndex: "162A2",
      tyreFeatures: ["Reinforced shoulder", "Stable footprint"],
      isActive: true,
    },
    {
      brandId: brandId(0),
      name: "Scraper Sprint SS22",
      description: "Self-propelled scraper tyre with excellent traction on dirt.",
      category: "Bais" as const,
      pattern: "SS22",
      tyreSize: "26.5-25",
      tyreWeight: 410.00,
      application: "Scraper",
      vehicleType: "Loader and dozer" as const,
      tyreType: "Tubeless",
      starRating: null,
      plyRating: "20PR",
      loadIndex: "195A2",
      tyreFeatures: ["Traction tread", "Mud expelling grooves"],
      isActive: false,
    },
    {
      brandId: brandId(1),
      name: "AeroLift AL200",
      description: "Lightweight high-flotation tyre for telescopic handlers.",
      category: "Radial" as const,
      pattern: "AL200",
      tyreSize: "400/70 R24",
      tyreWeight: 88.00,
      application: "Telehandler",
      vehicleType: "Industrial" as const,
      tyreType: "Tubeless",
      starRating: "2★",
      plyRating: null,
      loadIndex: "152A8",
      tyreFeatures: ["Low ground pressure", "Wide footprint"],
      isActive: true,
    },
  ];

  console.log(`[seed] Inserting ${products.length} tyre products…`);
  const inserted = await db
    .insert(tyreProducts)
    .values(products)
    .returning({ id: tyreProducts.id, name: tyreProducts.name });

  console.log(`[seed] ✓ Done — inserted ${inserted.length} products.`);
  await client.end();
}

main().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
