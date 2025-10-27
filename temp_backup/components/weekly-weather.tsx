"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, Cloudy } from "lucide-react";

interface WeatherDay {
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
}

interface WeeklyWeatherProps {
  forecast: WeatherDay[];
  location: string;
}

export function WeeklyWeather({ forecast, location }: WeeklyWeatherProps) {
  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case "sunny":
        return <Sun className="h-4 w-4 text-yellow-500" />;
      case "rainy":
        return <CloudRain className="h-4 w-4 text-blue-500" />;
      case "cloudy":
        return <Cloudy className="h-4 w-4 text-gray-500" />;
      default:
        return <Cloud className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Card className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 border-sky-200 dark:border-sky-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Cloud className="h-5 w-5 text-sky-600" />
          7-Day Forecast - {location}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {forecast.map((day, index) => (
            <div
              key={index}
              className="text-center p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg"
            >
              <div className="text-xs font-medium mb-1">{day.day}</div>
              <div className="flex justify-center mb-1">
                {getWeatherIcon(day.icon)}
              </div>
              <div className="text-xs">
                <span className="text-blue-600 dark:text-blue-400">
                  {day.high}°
                </span>
                <span className="text-gray-500 dark:text-gray-400 mx-1">
                  /
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {day.low}°
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}