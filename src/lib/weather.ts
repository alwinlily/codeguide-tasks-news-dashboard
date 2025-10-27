export interface WeatherDay {
  date: string;
  day: string;
  temperature: number;
  minTemp: number;
  maxTemp: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  chanceOfRain: number;
}

interface WeatherApiDay {
  date: string;
  day: {
    avgtemp_c: number;
    mintemp_c: number;
    maxtemp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    avghumidity: number;
    maxwind_kph: number;
    daily_chance_of_rain: number;
  };
}

interface WeatherApiResponse {
  forecast: {
    forecastday: WeatherApiDay[];
  };
}

export interface WeatherData {
  location: string;
  current: {
    temperature: number;
    description: string;
    icon: string;
    humidity: number;
    windSpeed: number;
  };
  forecast: WeatherDay[];
}

export async function getWeatherForBandung(): Promise<WeatherData> {
  const apiKey = process.env.WEATHER_API_KEY;

  if (!apiKey) {
    console.warn("Weather API key is not configured, using fallback data");
    // Return fallback data for development
    return {
      location: "Bandung, Indonesia",
      current: {
        temperature: 25,
        description: "partly cloudy",
        icon: "02d",
        humidity: 70,
        windSpeed: 5,
      },
      forecast: generateFallbackForecast(),
    };
  }

  // Using weatherapi.com forecast API for Bandung
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=Bandung&days=7&aqi=no&alerts=no`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API responded with status: ${response.status}`);
    }

    const data = await response.json() as WeatherApiResponse;

    const forecast: WeatherDay[] = data.forecast.forecastday.map((day: WeatherApiDay) => ({
      date: day.date,
      day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
      temperature: Math.round(day.day.avgtemp_c),
      minTemp: Math.round(day.day.mintemp_c),
      maxTemp: Math.round(day.day.maxtemp_c),
      description: day.day.condition.text.toLowerCase(),
      icon: day.day.condition.icon,
      humidity: day.day.avghumidity,
      windSpeed: day.day.maxwind_kph / 3.6, // Convert km/h to m/s
      chanceOfRain: day.day.daily_chance_of_rain,
    }));

    return {
      location: data.location.name + ", " + data.location.country,
      current: {
        temperature: Math.round(data.current.temp_c),
        description: data.current.condition.text.toLowerCase(),
        icon: data.current.condition.icon,
        humidity: data.current.humidity,
        windSpeed: data.current.wind_kph / 3.6, // Convert km/h to m/s
      },
      forecast,
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);

    // Return fallback data for development
    return {
      location: "Bandung, Indonesia",
      current: {
        temperature: 25,
        description: "partly cloudy",
        icon: "02d",
        humidity: 70,
        windSpeed: 5,
      },
      forecast: generateFallbackForecast(),
    };
  }
}

function generateFallbackForecast(): WeatherDay[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const forecast: WeatherDay[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    forecast.push({
      date: date.toISOString().split('T')[0],
      day: days[date.getDay()],
      temperature: 22 + Math.floor(Math.random() * 8),
      minTemp: 18 + Math.floor(Math.random() * 4),
      maxTemp: 26 + Math.floor(Math.random() * 6),
      description: ['partly cloudy', 'sunny', 'light rain', 'cloudy'][Math.floor(Math.random() * 4)],
      icon: ['02d', '01d', '10d', '03d'][Math.floor(Math.random() * 4)],
      humidity: 60 + Math.floor(Math.random() * 30),
      windSpeed: 2 + Math.random() * 8,
      chanceOfRain: Math.floor(Math.random() * 100),
    });
  }

  return forecast;
}