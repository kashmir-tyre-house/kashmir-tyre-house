import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "kashmir-tyre-house-api",
    timestamp: new Date().toISOString()
  });
}
