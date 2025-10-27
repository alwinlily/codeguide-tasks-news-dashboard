import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Newspaper, AlertTriangle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase";

// Server-side data fetching
async function getStats() {
  try {
    const supabase = await createSupabaseServerClient();

    // Fetch all data directly from Supabase
    const [allTodosRes, urgentRes, newsRes] = await Promise.all([
      supabase.from('todo_tasks').select('*'),
      supabase.from('todo_tasks').select('*').eq('is_urgent', true),
      supabase.from('company_news').select('*')
    ]);

    const stats = {
      totalTodos: allTodosRes.data?.length || 0,
      urgentTodos: urgentRes.data?.length || 0,
      totalNews: newsRes.data?.length || 0,
    };

    console.log('📊 Server-side stats:', stats);
    return stats;
  } catch (error) {
    console.error('Error fetching stats:', error);
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
              All todo tasks
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
              <Button className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Create New Task
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