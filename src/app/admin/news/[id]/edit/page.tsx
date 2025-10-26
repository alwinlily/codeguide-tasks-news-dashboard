"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface CompanyNews {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditNewsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    publishedAt: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchNews();
  }, [id]);

  const fetchNews = async () => {
    try {
      const response = await fetch("/api/news");
      if (response.ok) {
        const news: CompanyNews[] = await response.json();
        const article = news.find(n => n.id === id);

        if (article) {
          setFormData({
            title: article.title,
            content: article.content,
            publishedAt: new Date(article.publishedAt).toISOString().split('T')[0],
          });
        } else {
          setNotFound(true);
        }
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setNotFound(true);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/news", {
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
        router.push("/admin/news");
      } else {
        const error = await response.json();
        console.error("Error updating news:", error);
      }
    } catch (error) {
      console.error("Error updating news:", error);
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
          <h1 className="text-2xl font-bold text-destructive">Article Not Found</h1>
          <p className="text-muted-foreground mt-2">The requested news article could not be found.</p>
          <Link href="/admin/news" className="mt-4">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to News
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/news">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to News
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Article</h1>
          <p className="text-muted-foreground">Update news article details</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Article Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter article title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter article content"
                rows={8}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishedAt">Publication Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="publishedAt"
                  type="date"
                  value={formData.publishedAt}
                  onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Article"}
              </Button>
              <Link href="/admin/news">
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