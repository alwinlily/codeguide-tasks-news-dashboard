import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase";
// import { auth } from "@clerk/nextjs/server";

const createNewsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  publishedAt: z.string().transform((val) => new Date(val)).optional(),
});

const updateNewsSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  content: z.string().min(1, "Content is required").optional(),
  publishedAt: z.string().transform((val) => new Date(val)).optional(),
});

// News item interface for Supabase data
interface NewsItem {
  id: string;
  title: string;
  content: string;
  published_at: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

// Transform helper function
function transformNewsData(data: NewsItem[]) {
  return data?.map(item => ({
    id: item.id,
    title: item.title,
    content: item.content,
    publishedAt: item.published_at,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    userId: item.user_id
  })) || [];
}

// GET /api/news - Get all news
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('company_news')
      .select('*')
      .order('published_at', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch news" },
        { status: 500 }
      );
    }

    return NextResponse.json(transformNewsData(data));
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}

// POST /api/news - Create new news
export async function POST(request: NextRequest) {
  try {
    // Temporarily disable auth check for testing
    // const { userId } = auth();
    // if (!userId) {
    //   return NextResponse.json(
    //     { error: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    const body = await request.json();
    const validatedData = createNewsSchema.parse(body);

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('company_news')
      .insert({
        title: validatedData.title,
        content: validatedData.content,
        published_at: validatedData.publishedAt || new Date(),
        user_id: null // Temporarily null for testing
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to create news" },
        { status: 500 }
      );
    }

    return NextResponse.json(transformNewsData([data])[0], { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating news:", error);
    return NextResponse.json(
      { error: "Failed to create news" },
      { status: 500 }
    );
  }
}

// PUT /api/news - Update news
export async function PUT(request: NextRequest) {
  try {
    // Temporarily disable auth check for testing
    // const { userId } = auth();
    // if (!userId) {
    //   return NextResponse.json(
    //     { error: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "News ID is required" },
        { status: 400 }
      );
    }

    const validatedData = updateNewsSchema.parse(updateData);
    const supabase = await createSupabaseServerClient();

    // Convert field names to match database
    const dbUpdateData: {
      title?: string;
      content?: string;
      published_at?: string;
    } = {};
    if (validatedData.title !== undefined) dbUpdateData.title = validatedData.title;
    if (validatedData.content !== undefined) dbUpdateData.content = validatedData.content;
    if (validatedData.publishedAt !== undefined) dbUpdateData.published_at = validatedData.publishedAt.toISOString();

    const { data, error } = await supabase
      .from('company_news')
      .update(dbUpdateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "News not found" },
          { status: 404 }
        );
      }
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to update news" },
        { status: 500 }
      );
    }

    return NextResponse.json(transformNewsData([data])[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating news:", error);
    return NextResponse.json(
      { error: "Failed to update news" },
      { status: 500 }
    );
  }
}

// DELETE /api/news - Delete news
export async function DELETE(request: NextRequest) {
  try {
    // Temporarily disable auth check for testing
    // const { userId } = auth();
    // if (!userId) {
    //   return NextResponse.json(
    //     { error: "Unauthorized" },
    //     { status: 401 }
    //   );
    // }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "News ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from('company_news')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "News not found" },
          { status: 404 }
        );
      }
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to delete news" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "News deleted successfully" });
  } catch (error) {
    console.error("Error deleting news:", error);
    return NextResponse.json(
      { error: "Failed to delete news" },
      { status: 500 }
    );
  }
}