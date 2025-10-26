export interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

export async function getWeatherForBandung(): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    throw new Error("OpenWeatherMap API key is not configured");
  }

  // Bandung coordinates
  const lat = -6.9175;
  const lon = 107.6191;

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API responded with status: ${response.status}`);
    }

    const data = await response.json();

    return {
      location: "Bandung, Indonesia",
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      icon: data.weather[0].icon,
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);

    // Return fallback data for development
    return {
      location: "Bandung, Indonesia",
      temperature: 25,
      description: "partly cloudy",
      humidity: 70,
      windSpeed: 5,
      icon: "02d",
    };
  }
}