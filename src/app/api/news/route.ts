import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

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

// GET /api/news - Get all news
export async function GET() {
  try {
    const news = await prisma.companyNews.findMany({
      orderBy: [
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
    });
    return NextResponse.json(news);
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
    const body = await request.json();
    const validatedData = createNewsSchema.parse(body);

    const news = await prisma.companyNews.create({
      data: validatedData,
    });

    return NextResponse.json(news, { status: 201 });
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
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "News ID is required" },
        { status: 400 }
      );
    }

    const validatedData = updateNewsSchema.parse(updateData);

    const news = await prisma.companyNews.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(news);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return NextResponse.json(
        { error: "News not found" },
        { status: 404 }
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "News ID is required" },
        { status: 400 }
      );
    }

    await prisma.companyNews.delete({
      where: { id },
    });

    return NextResponse.json({ message: "News deleted successfully" });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return NextResponse.json(
        { error: "News not found" },
        { status: 404 }
      );
    }

    console.error("Error deleting news:", error);
    return NextResponse.json(
      { error: "Failed to delete news" },
      { status: 500 }
    );
  }
}