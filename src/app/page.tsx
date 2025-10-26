import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, Clock, Cloud, Newspaper, AlertTriangle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserBtn } from "@/components/user-button";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

async function getTodos() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/todos`, {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/urgent`, {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/news`, {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/weather`, {
      cache: 'no-store',
    });
    if (!response.ok) throw new Error('Failed to fetch weather');
    return response.json();
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

export default async function Home() {
  const [todos, urgentTodos, news, weather] = await Promise.all([
    getTodos(),
    getUrgentTodos(),
    getNews(),
    getWeather(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <SignedIn>
              <UserBtn />
            </SignedIn>
            <SignedOut>
              <SignInButton>
                <Button>Sign In</Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Todo Tasks */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Todo Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todos.length > 0 ? (
                <div className="space-y-3">
                  {todos.slice(0, 5).map((todo: any) => (
                    <div key={todo.id} className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{todo.title}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(todo.dueDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      {todo.isUrgent && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  ))}
                  {todos.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{todos.length - 5} more tasks
                    </p>
                  )}
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
            </CardHeader>
            <CardContent>
              {urgentTodos.length > 0 ? (
                <div className="space-y-3">
                  {urgentTodos.slice(0, 5).map((todo: any) => (
                    <div key={todo.id} className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border-l-4 border-red-500">
                      <h4 className="font-medium text-sm">{todo.title}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(todo.dueDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  ))}
                  {urgentTodos.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{urgentTodos.length - 5} more urgent tasks
                    </p>
                  )}
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
            </CardHeader>
            <CardContent>
              {news.length > 0 ? (
                <div className="space-y-3">
                  {news.slice(0, 3).map((item: any) => (
                    <div key={item.id} className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
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
                  {news.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{news.length - 3} more news items
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No news yet</p>
              )}
            </CardContent>
          </Card>

          {/* Weather */}
          <Card className="bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/20 border-sky-200 dark:border-sky-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Cloud className="h-5 w-5 text-sky-600" />
                Weather
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weather ? (
                <div className="text-center py-4">
                  <h3 className="text-2xl font-bold">{weather.location}</h3>
                  <div className="text-4xl font-bold my-2">{weather.temperature}°C</div>
                  <p className="text-muted-foreground capitalize">{weather.description}</p>
                  <div className="flex justify-center gap-6 mt-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Humidity:</span> {weather.humidity}%
                    </div>
                    <div>
                      <span className="font-medium">Wind:</span> {weather.windSpeed} m/s
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Weather data unavailable</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}