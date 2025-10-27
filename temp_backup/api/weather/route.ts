import { NextResponse } from 'next/server';

// Sample weather data for now
const sampleWeatherData = {
  location: "New York, NY",
  current: {
    temp: 72,
    condition: "Partly Cloudy",
    icon: "partly-cloudy",
    humidity: 65,
    wind: 10
  },
  forecast: [
    { day: "Mon", high: 75, low: 62, condition: "Sunny", icon: "sunny" },
    { day: "Tue", high: 73, low: 59, condition: "Partly Cloudy", icon: "partly-cloudy" },
    { day: "Wed", high: 68, low: 55, condition: "Rainy", icon: "rainy" },
    { day: "Thu", high: 70, low: 58, condition: "Cloudy", icon: "cloudy" },
    { day: "Fri", high: 76, low: 63, condition: "Sunny", icon: "sunny" },
    { day: "Sat", high: 78, low: 65, condition: "Sunny", icon: "sunny" },
    { day: "Sun", high: 74, low: 61, condition: "Partly Cloudy", icon: "partly-cloudy" }
  ]
};

export async function GET() {
  try {
    // For now, return sample data
    // TODO: Integrate with WeatherAPI.com when ready
    return NextResponse.json(sampleWeatherData);
  } catch (error) {
    console.error('Error in weather API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}