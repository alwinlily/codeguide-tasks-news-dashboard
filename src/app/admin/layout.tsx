import { UserBtn } from "@/components/user-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Calendar,
  Newspaper,
  Home,
  Plus
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserBtn />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen border-r bg-muted/10">
          <nav className="p-4 space-y-2">
            <Link href="/admin">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>

            <div className="space-y-1">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Todos
              </h3>
              <Link href="/admin/todos">
                <Button variant="ghost" className="w-full justify-start pl-6">
                  <Calendar className="mr-2 h-4 w-4" />
                  All Tasks
                </Button>
              </Link>
              <Link href="/admin/todos/new">
                <Button variant="ghost" className="w-full justify-start pl-6">
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Button>
              </Link>
            </div>

            <div className="space-y-1">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                News
              </h3>
              <Link href="/admin/news">
                <Button variant="ghost" className="w-full justify-start pl-6">
                  <Newspaper className="mr-2 h-4 w-4" />
                  All News
                </Button>
              </Link>
              <Link href="/admin/news/new">
                <Button variant="ghost" className="w-full justify-start pl-6">
                  <Plus className="mr-2 h-4 w-4" />
                  New Article
                </Button>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}