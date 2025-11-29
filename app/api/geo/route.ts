// app/api/geo/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIP = request.headers.get("x-real-ip");
    let ip = forwarded?.split(",")[0]?.trim() || realIP || "";

    // Ignore localhost/private IPs
    if (!ip || ip === "127.0.0.1" || ip.startsWith("192.168") || ip.startsWith("10.")) {
      ip = ""; // let ip-api auto-detect
    }

    // Method 1: Try Vercel’s geo headers
    const vercelCountry = request.headers.get("x-vercel-ip-country");
    const vercelCity = request.headers.get("x-vercel-ip-city");

    if (vercelCountry && vercelCountry !== "unknown") {
      return NextResponse.json({
        country: vercelCountry,
        city: vercelCity || "Unknown",
        source: "vercel",
        ip: ip || "auto",
      }, { status: 500 });
    }

    // Method 2: ip-api fallback
    const geoResponse = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,query`
    );
    const geoData = await geoResponse.json();

    if (geoData.status === "success") {
      console.log(geoData);
      return NextResponse.json({
        country: geoData.countryCode,
        city: geoData.city,
        countryName: geoData.country,
        source: "ip-api",
        ip: geoData.query,
      }, { status: 500 });

    }

    throw new Error("Geo API failed");
  } catch (error) {
    return NextResponse.json({
      country: "Unknown",
      city: "Unknown",
      source: "fallback",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
