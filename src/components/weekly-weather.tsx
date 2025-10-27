import { WeatherDay } from "@/lib/weather";

interface WeeklyWeatherProps {
  forecast: WeatherDay[];
  location: string;
}

export function WeeklyWeather({ forecast, location }: WeeklyWeatherProps) {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/20 rounded-lg border border-sky-200 dark:border-sky-800 p-2">
      <div className="text-center mb-1">
        <h3 className="text-sm font-bold text-sky-900 dark:text-sky-100">
          7-Day Forecast • {location}
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-1">
        {forecast.map((day, index) => {
          const isToday = day.date === today;

          return (
            <div
              key={day.date}
              className={`
                text-center p-1 rounded border transition-all text-xs
                ${isToday
                  ? 'bg-sky-100 dark:bg-sky-800 border-sky-300 dark:border-sky-600 scale-105'
                  : 'bg-white/50 dark:bg-gray-800/50 border-sky-200 dark:border-sky-700 hover:bg-white/70 dark:hover:bg-gray-800/70'
                }
              `}
            >
              <div className="font-semibold text-sky-900 dark:text-sky-100 mb-0.5 text-xs">
                {isToday ? 'Today' : day.day}
              </div>

              <div className="mb-0.5">
                <img
                  src={`https:${day.icon}`}
                  alt={day.description}
                  className="w-5 h-5 mx-auto"
                />
              </div>

              <div className="flex items-center justify-center gap-0.5">
                <span className="text-xs font-bold text-sky-800 dark:text-sky-200">
                  {day.maxTemp}°
                </span>
                <span className="text-xs text-sky-600 dark:text-sky-400">
                  /{day.minTemp}°
                </span>
              </div>

              {day.chanceOfRain > 30 && (
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                  💧 {day.chanceOfRain}%
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}