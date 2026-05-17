import { getDb, tyreProducts } from "@kth/db";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      data: [],
      meta: {
        status: "setup",
        message: "DATABASE_URL is not configured yet"
      }
    });
  }

  try {
    const db = getDb();
    const data = await db
      .select()
      .from(tyreProducts)
      .where(eq(tyreProducts.isActive, true))
      .orderBy(desc(tyreProducts.createdAt))
      .limit(24);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch products", error);

    return NextResponse.json(
      {
        error: {
          code: "PRODUCTS_FETCH_FAILED",
          message: "Unable to fetch products right now"
        }
      },
      { status: 500 }
    );
  }
}
