import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/urgent - Get all urgent todos
export async function GET() {
  try {
    const urgentTodos = await prisma.todoTask.findMany({
      where: {
        isUrgent: true,
      },
      orderBy: [
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
    });
    return NextResponse.json(urgentTodos);
  } catch (error) {
    console.error("Error fetching urgent todos:", error);
    return NextResponse.json(
      { error: "Failed to fetch urgent todos" },
      { status: 500 }
    );
  }
}