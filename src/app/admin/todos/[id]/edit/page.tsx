"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface TodoTask {
  id: string;
  title: string;
  dueDate: string;
  isUrgent: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EditTodoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    dueDate: "",
    isUrgent: false,
  });

  useEffect(() => {
    fetchTodo();
  }, [id]);

  const fetchTodo = async () => {
    try {
      const response = await fetch("/api/todos");
      if (response.ok) {
        const todos: TodoTask[] = await response.json();
        const todo = todos.find(t => t.id === id);

        if (todo) {
          setFormData({
            title: todo.title,
            dueDate: new Date(todo.dueDate).toISOString().split('T')[0],
            isUrgent: todo.isUrgent,
          });
        } else {
          setNotFound(true);
        }
      }
    } catch (error) {
      console.error("Error fetching todo:", error);
      setNotFound(true);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/todos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          ...formData,
        }),
      });

      if (response.ok) {
        router.push("/admin/todos");
      } else {
        const error = await response.json();
        console.error("Error updating todo:", error);
      }
    } catch (error) {
      console.error("Error updating todo:", error);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div>Loading...</div>;
  }

  if (notFound) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive">Task Not Found</h1>
          <p className="text-muted-foreground mt-2">The requested task could not be found.</p>
          <Link href="/admin/todos" className="mt-4">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tasks
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/todos">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Task</h1>
          <p className="text-muted-foreground">Update todo task details</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isUrgent"
                checked={formData.isUrgent}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isUrgent: checked as boolean })
                }
              />
              <Label htmlFor="isUrgent">Mark as urgent</Label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Task"}
              </Button>
              <Link href="/admin/todos">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}