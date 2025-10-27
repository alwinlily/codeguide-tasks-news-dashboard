"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, Clock, Newspaper, AlertTriangle, RefreshCw, Cloud } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
// import { WeeklyWeather } from "@/components/weekly-weather";
// import { MotivationalQuote } from "@/components/motivational-quote";
// import GoogleTasksSync from "@/components/google-tasks-sync";
import { useState, useEffect } from "react";
import { TodoTask, CompanyNews, WeatherData } from "@/types";
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/nextjs";

async function getTodos() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3016'}/api/todos?t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Failed to fetch todos');
    return response.json();
  } catch (error) {
    console.error('Error fetching todos:', error);
    return [];
  }
}

async function getUrgentTodos() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3016'}/api/urgent?t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Failed to fetch urgent todos');
    return response.json();
  } catch (error) {
    console.error('Error fetching urgent todos:', error);
    return [];
  }
}

async function getNews() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3016'}/api/news?t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Failed to fetch news');
    return response.json();
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

async function getWeather() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3016'}/api/weather?t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Failed to fetch weather');
    return response.json();
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

export default function Home() {
  const { userId } = useAuth();
  const [todos, setTodos] = useState<TodoTask[]>([]);
  const [urgentTodos, setUrgentTodos] = useState<TodoTask[]>([]);
  const [news, setNews] = useState<CompanyNews[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      const [todosData, urgentTodosData, newsData, weatherData] = await Promise.all([
        getTodos(),
        getUrgentTodos(),
        getNews(),
        getWeather(),
      ]);

      setTodos(todosData);
      setUrgentTodos(urgentTodosData);
      setNews(newsData);
      setWeather(weatherData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last updated: {format(lastUpdated, 'HH:mm:ss')}</span>
              {isRefreshing && <RefreshCw className="h-4 w-4 animate-spin" />}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <ThemeToggle />
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline">Sign In</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* To Do */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                To Do
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {todos.length} items
              </div>
            </CardHeader>
            <CardContent>
              {todos.length > 0 ? (
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {todos.map((todo: TodoTask) => (
                    <div key={todo.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{todo.title}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(todo.dueDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No tasks yet</p>
              )}
            </CardContent>
          </Card>

          {/* Urgent Tasks */}
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Urgent Tasks
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {urgentTodos.length} items
              </div>
            </CardHeader>
            <CardContent>
              {urgentTodos.length > 0 ? (
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {urgentTodos.map((todo: TodoTask) => (
                    <div key={todo.id} className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border-l-4 border-red-500 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors">
                      <h4 className="font-medium text-sm">{todo.title}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(todo.dueDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No urgent tasks</p>
              )}
            </CardContent>
          </Card>

          {/* Company News */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Newspaper className="h-5 w-5 text-green-600" />
                Company News
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                {news.length} items
              </div>
            </CardHeader>
            <CardContent>
              {news.length > 0 ? (
                <div className="max-h-80 overflow-y-auto space-y-3">
                  {news.map((item: CompanyNews) => (
                    <div key={item.id} className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors">
                      <h4 className="font-medium text-sm mb-2">{item.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {item.content}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(item.publishedAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No news yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Google Tasks Sync - Temporarily disabled */}
        {/* <div className="mt-8">
          <GoogleTasksSync userId={userId || undefined} />
        </div> */}

        {/* Weekly Weather Forecast - Temporarily disabled */}
        {/* <div className="mt-8">
          {weather && (
            <WeeklyWeather
              forecast={weather.forecast}
              location={weather.location}
            />
          )}
        </div> */}

        {/* Daily Motivational Quote - Temporarily disabled */}
        {/* <div className="mt-8">
          <MotivationalQuote />
        </div> */}
      </main>
    </div>
  );
}