import { NextResponse } from "next/server";
import { getWeatherForBandung } from "@/lib/weather";

// GET /api/weather - Get weather for Bandung
export async function GET() {
  try {
    const weather = await getWeatherForBandung();
    return NextResponse.json(weather);
  } catch (error) {
    console.error("Error fetching weather:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}