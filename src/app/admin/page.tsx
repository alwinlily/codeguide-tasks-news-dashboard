import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Newspaper, AlertTriangle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { googleTasksClient } from "@/lib/google-tasks";
import { cookies } from "next/headers";

// Server-side data fetching
async function getStats() {
  try {
    // Get Google tokens from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('google_access_token')?.value;
    const refreshToken = cookieStore.get('google_refresh_token')?.value;

    if (!accessToken) {
      console.log('No Google access token found, returning zero stats');
      return {
        totalTodos: 0,
        urgentTodos: 0,
        totalNews: 0,
      };
    }

    // Set up Google Tasks client
    googleTasksClient.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // Check if credentials are valid
    const isValid = await googleTasksClient.isCredentialsValid();
    if (!isValid) {
      console.log('Google credentials invalid, returning zero stats');
      return {
        totalTodos: 0,
        urgentTodos: 0,
        totalNews: 0,
      };
    }

    // Fetch tasks from the "To Do Kantor" list only
    const allTasks = await googleTasksClient.getTasksFromTargetList({
      showCompleted: false, // Only active tasks
    });

    // Filter urgent tasks
    const urgentTasks = allTasks.filter(task =>
      task.notes && task.notes.includes('URGENT') ||
      (task.title && task.title.toLowerCase().includes('urgent:'))
    );

    const stats = {
      totalTodos: allTasks.length,
      urgentTodos: urgentTasks.length,
      totalNews: 0, // Company news not implemented with Google Tasks
    };

    console.log('📊 Google Tasks stats:', stats);
    return stats;
  } catch (error) {
    console.error('Error fetching Google Tasks stats:', error);
    return {
      totalTodos: 0,
      urgentTodos: 0,
      totalNews: 0,
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Manage your tasks and news</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTodos}</div>
            <p className="text-xs text-muted-foreground">
              All Google Tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.urgentTodos}</div>
            <p className="text-xs text-muted-foreground">
              Need immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">News Articles</CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNews}</div>
            <p className="text-xs text-muted-foreground">
              Published news
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalTodos > 0 ? Math.round(((stats.totalTodos - stats.urgentTodos) / stats.totalTodos) * 100) : 100}%
            </div>
            <p className="text-xs text-muted-foreground">
              Non-urgent tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/todos/new">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Create Urgent Task
              </Button>
            </Link>
            <Link href="/admin/news/new">
              <Button variant="outline" className="w-full">
                <Newspaper className="mr-2 h-4 w-4" />
                Create News Article
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Admin dashboard is ready. You can now manage tasks and news articles efficiently.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}