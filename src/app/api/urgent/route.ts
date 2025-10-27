import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
// import { auth } from "@clerk/nextjs/server";

// GET /api/urgent - Get all urgent todos
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('todo_tasks')
      .select('*')
      .eq('is_urgent', true)
      .order('due_date', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch urgent todos" },
        { status: 500 }
      );
    }

    // Transform the data to match the old Prisma format
    const transformedData = data?.map(item => ({
      id: item.id,
      title: item.title,
      dueDate: item.due_date,
      isUrgent: item.is_urgent,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      userId: item.user_id
    })) || [];

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error fetching urgent todos:", error);
    return NextResponse.json(
      { error: "Failed to fetch urgent todos" },
      { status: 500 }
    );
  }
}