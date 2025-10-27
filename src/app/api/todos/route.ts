import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

const createTodoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  dueDate: z.string().transform((val) => new Date(val)),
  isUrgent: z.boolean().default(false),
});

const updateTodoSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  dueDate: z.string().transform((val) => new Date(val)).optional(),
  isUrgent: z.boolean().optional(),
});

// GET /api/todos - Get NON-URGENT todos only (for dashboard To Do section)
export async function GET() {
  try {
    // Temporarily disable auth check for testing
    // const { userId } = auth();
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('todo_tasks')
      .select('*')
      .eq('is_urgent', false) // Only get non-urgent todos
      .order('due_date', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch todos" },
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
    console.error("Error fetching todos:", error);
    return NextResponse.json(
      { error: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}

// POST /api/todos - Create a new todo
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
    const validatedData = createTodoSchema.parse(body);

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('todo_tasks')
      .insert({
        title: validatedData.title,
        due_date: validatedData.dueDate,
        is_urgent: validatedData.isUrgent,
        user_id: null // Temporarily null for testing
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to create todo" },
        { status: 500 }
      );
    }

    // Transform to match old format
    const transformedData = {
      id: data.id,
      title: data.title,
      dueDate: data.due_date,
      isUrgent: data.is_urgent,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      userId: data.user_id
    };

    return NextResponse.json(transformedData, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating todo:", error);
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}

// PUT /api/todos - Update a todo
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Todo ID is required" },
        { status: 400 }
      );
    }

    const validatedData = updateTodoSchema.parse(updateData);
    const supabase = await createSupabaseServerClient();

    // Convert field names to match database
    const dbUpdateData: {
      title?: string;
      due_date?: Date;
      is_urgent?: boolean;
    } = {};
    if (validatedData.title !== undefined) dbUpdateData.title = validatedData.title;
    if (validatedData.dueDate !== undefined) dbUpdateData.due_date = validatedData.dueDate;
    if (validatedData.isUrgent !== undefined) dbUpdateData.is_urgent = validatedData.isUrgent;

    const { data, error } = await supabase
      .from('todo_tasks')
      .update(dbUpdateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "Todo not found" },
          { status: 404 }
        );
      }
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to update todo" },
        { status: 500 }
      );
    }

    // Transform to match old format
    const transformedData = {
      id: data.id,
      title: data.title,
      dueDate: data.due_date,
      isUrgent: data.is_urgent,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      userId: data.user_id
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating todo:", error);
    return NextResponse.json(
      { error: "Failed to update todo" },
      { status: 500 }
    );
  }
}

// DELETE /api/todos - Delete a todo
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.userId;
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Todo ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
      .from('todo_tasks')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: "Todo not found" },
          { status: 404 }
        );
      }
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to delete todo" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo:", error);
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}