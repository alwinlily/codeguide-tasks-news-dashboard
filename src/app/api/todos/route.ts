import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { googleTasksClient, googleTaskToLocalTask, formatDateForGoogleTasks } from "@/lib/google-tasks";

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

// Helper function to get Google tokens from cookies
function getGoogleTokensFromRequest(request: NextRequest) {
  const accessToken = request.cookies.get('google_access_token')?.value;
  const refreshToken = request.cookies.get('google_refresh_token')?.value;

  if (!accessToken) {
    return null;
  }

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
  };
}

// GET /api/todos - Get NON-URGENT todos only (for dashboard To Do section)
export async function GET(request: NextRequest) {
  try {
    const tokens = getGoogleTokensFromRequest(request);
    if (!tokens) {
      // Return empty array if not authenticated with Google
      return NextResponse.json([]);
    }

    // Set up Google Tasks client
    googleTasksClient.setCredentials(tokens);

    // Check if credentials are valid
    const isValid = await googleTasksClient.isCredentialsValid();
    if (!isValid) {
      console.log('Google credentials invalid, returning empty todos');
      return NextResponse.json([]);
    }

    // Get tasks from the "To Do Kantor" list only
    const tasks = await googleTasksClient.getTasksFromTargetList({
      showCompleted: false, // Only get active tasks
    });

    const transformedTasks = tasks.map(task => {
      const localTask = googleTaskToLocalTask(task);
      // Filter out urgent tasks (they go to the urgent tasks endpoint)
      if (localTask.title.toLowerCase().includes('urgent:') ||
          (task.notes && task.notes.includes('URGENT'))) {
        return null;
      }
      return {
        id: task.id,
        title: localTask.title,
        dueDate: task.due || new Date().toISOString(),
        isUrgent: false, // Non-urgent todos endpoint
        createdAt: task.updated || new Date().toISOString(),
        updatedAt: task.updated || new Date().toISOString(),
        userId: 'google-tasks-user'
      };
    }).filter((task): task is NonNullable<typeof task> => task !== null);

    // Sort by due date
    transformedTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return NextResponse.json(transformedTasks);
  } catch (error) {
    console.error("Error fetching todos from Google Tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch todos" },
      { status: 500 }
    );
  }
}

// POST /api/todos - Create a new todo
export async function POST(request: NextRequest) {
  try {
    const tokens = getGoogleTokensFromRequest(request);
    if (!tokens) {
      return NextResponse.json(
        { error: "Google authentication required" },
        { status: 401 }
      );
    }

    // Set up Google Tasks client
    googleTasksClient.setCredentials(tokens);

    // Check if credentials are valid
    const isValid = await googleTasksClient.isCredentialsValid();
    if (!isValid) {
      return NextResponse.json(
        { error: "Google authentication expired" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createTodoSchema.parse(body);

    // Create task in the "To Do Kantor" list
    const newTask = await googleTasksClient.createTask({
      title: validatedData.title,
      notes: validatedData.isUrgent ? 'URGENT: This task requires immediate attention.' : undefined,
      due: validatedData.dueDate ? formatDateForGoogleTasks(validatedData.dueDate) : undefined,
      completed: false,
    });

    // Transform to match our app format
    const transformedData = {
      id: newTask.id,
      title: newTask.title || validatedData.title,
      dueDate: newTask.due || validatedData.dueDate.toISOString(),
      isUrgent: validatedData.isUrgent,
      createdAt: newTask.updated || new Date().toISOString(),
      updatedAt: newTask.updated || new Date().toISOString(),
      userId: 'google-tasks-user'
    };

    return NextResponse.json(transformedData, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating todo in Google Tasks:", error);
    return NextResponse.json(
      { error: "Failed to create todo" },
      { status: 500 }
    );
  }
}

// PUT /api/todos - Update a todo
export async function PUT(request: NextRequest) {
  try {
    const tokens = getGoogleTokensFromRequest(request);
    if (!tokens) {
      return NextResponse.json(
        { error: "Google authentication required" },
        { status: 401 }
      );
    }

    // Set up Google Tasks client
    googleTasksClient.setCredentials(tokens);

    // Check if credentials are valid
    const isValid = await googleTasksClient.isCredentialsValid();
    if (!isValid) {
      return NextResponse.json(
        { error: "Google authentication expired" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, taskListId, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Todo ID is required" },
        { status: 400 }
      );
    }

    const validatedData = updateTodoSchema.parse(updateData);

    // Get task lists to find the one containing this task
    const taskLists = await googleTasksClient.getTaskLists();
    let targetTaskListId = taskListId;

    // If no taskListId provided, search for the task in all lists
    if (!targetTaskListId) {
      for (const taskList of taskLists) {
        const tasks = await googleTasksClient.getTasks(taskList.id!);
        const task = tasks.find(t => t.id === id);
        if (task) {
          targetTaskListId = taskList.id!;
          break;
        }
      }
    }

    if (!targetTaskListId) {
      return NextResponse.json(
        { error: "Task not found in any task list" },
        { status: 404 }
      );
    }

    // Update task in Google Tasks
    const updatedTask = await googleTasksClient.updateTask(targetTaskListId, id, {
      title: validatedData.title,
      notes: validatedData.isUrgent ? 'URGENT: This task requires immediate attention.' : undefined,
      due: validatedData.dueDate ? formatDateForGoogleTasks(validatedData.dueDate) : undefined,
      completed: false, // Non-urgent todos are never completed via this endpoint
    });

    // Transform to match our app format
    const transformedData = {
      id: updatedTask.id,
      title: updatedTask.title || validatedData.title,
      dueDate: updatedTask.due || (validatedData.dueDate?.toISOString()),
      isUrgent: validatedData.isUrgent,
      createdAt: updatedTask.updated || new Date().toISOString(),
      updatedAt: updatedTask.updated || new Date().toISOString(),
      userId: 'google-tasks-user'
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating todo in Google Tasks:", error);
    return NextResponse.json(
      { error: "Failed to update todo" },
      { status: 500 }
    );
  }
}

// DELETE /api/todos - Delete a todo
export async function DELETE(request: NextRequest) {
  try {
    const tokens = getGoogleTokensFromRequest(request);
    if (!tokens) {
      return NextResponse.json(
        { error: "Google authentication required" },
        { status: 401 }
      );
    }

    // Set up Google Tasks client
    googleTasksClient.setCredentials(tokens);

    // Check if credentials are valid
    const isValid = await googleTasksClient.isCredentialsValid();
    if (!isValid) {
      return NextResponse.json(
        { error: "Google authentication expired" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const taskListId = searchParams.get("taskListId");

    if (!id) {
      return NextResponse.json(
        { error: "Todo ID is required" },
        { status: 400 }
      );
    }

    let targetTaskListId = taskListId;

    // If no taskListId provided, search for the task in all lists
    if (!targetTaskListId) {
      const taskLists = await googleTasksClient.getTaskLists();
      for (const taskList of taskLists) {
        const tasks = await googleTasksClient.getTasks(taskList.id!);
        const task = tasks.find(t => t.id === id);
        if (task) {
          targetTaskListId = taskList.id!;
          break;
        }
      }
    }

    if (!targetTaskListId) {
      return NextResponse.json(
        { error: "Task not found in any task list" },
        { status: 404 }
      );
    }

    // Delete task from Google Tasks
    await googleTasksClient.deleteTask(targetTaskListId, id);

    return NextResponse.json({ message: "Todo deleted successfully" });
  } catch (error) {
    console.error("Error deleting todo from Google Tasks:", error);
    return NextResponse.json(
      { error: "Failed to delete todo" },
      { status: 500 }
    );
  }
}