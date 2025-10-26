import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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

// GET /api/todos - Get all todos
export async function GET() {
  try {
    const todos = await prisma.todoTask.findMany({
      orderBy: [
        { isUrgent: "desc" },
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
    });
    return NextResponse.json(todos);
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
    const body = await request.json();
    const validatedData = createTodoSchema.parse(body);

    const todo = await prisma.todoTask.create({
      data: validatedData,
    });

    return NextResponse.json(todo, { status: 201 });
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
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Todo ID is required" },
        { status: 400 }
      );
    }

    const validatedData = updateTodoSchema.parse(updateData);

    const todo = await prisma.todoTask.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(todo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return NextResponse.json(
        { error: "Todo not found" },
        { status: 404 }
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Todo ID is required" },
        { status: 400 }
      );
    }

    await prisma.todoTask.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Todo deleted successfully" });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return NextResponse.json(
        { error: "Todo not found" },
        { status: 404 }
      );
    }

    console.error("Error deleting todo:", error);
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}