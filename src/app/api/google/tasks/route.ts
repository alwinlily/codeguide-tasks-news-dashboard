import { NextRequest, NextResponse } from 'next/server';
import { googleTasksClient, googleTaskToLocalTask, GoogleTask } from '@/lib/google-tasks';
import { createSupabaseServerClient } from '@/lib/supabase';

// GET /api/google/tasks - Fetch Google Tasks for authenticated user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's Google tokens from database
    const supabase = await createSupabaseServerClient();
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_google_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Google authentication required' },
        { status: 401 }
      );
    }

    // Set up Google Tasks client with user tokens
    const tokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expiry_date: tokenData.expiry_date,
    };

    googleTasksClient.setCredentials(tokens);

    // Check if credentials are valid
    const isValid = await googleTasksClient.isCredentialsValid();
    if (!isValid) {
      return NextResponse.json(
        { error: 'Google authentication expired' },
        { status: 401 }
      );
    }

    // Get user's task lists
    const taskLists = await googleTasksClient.getTaskLists();

    // Get tasks from all task lists
    const allTasks = [];
    for (const taskList of taskLists) {
      const tasks = await googleTasksClient.getTasks(taskList.id!, {
        showCompleted: true,
      });

      const transformedTasks = tasks.map(task => ({
        ...googleTaskToLocalTask(task as GoogleTask),
        taskListId: taskList.id,
        taskListTitle: taskList.title,
        googleId: task.id,
      }));

      allTasks.push(...transformedTasks);
    }

    return NextResponse.json(allTasks);
  } catch (error) {
    console.error('Error fetching Google Tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Google Tasks' },
      { status: 500 }
    );
  }
}

// POST /api/google/tasks - Create a new task in Google Tasks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, notes, due, taskListId } = body;

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'User ID and title are required' },
        { status: 400 }
      );
    }

    // Get user's Google tokens from database
    const supabase = await createSupabaseServerClient();
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_google_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Google authentication required' },
        { status: 401 }
      );
    }

    // Set up Google Tasks client with user tokens
    const tokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expiry_date: tokenData.expiry_date,
    };

    googleTasksClient.setCredentials(tokens);

    // Check if credentials are valid
    const isValid = await googleTasksClient.isCredentialsValid();
    if (!isValid) {
      return NextResponse.json(
        { error: 'Google authentication expired' },
        { status: 401 }
      );
    }

    // Get or create default task list if not specified
    let targetTaskListId = taskListId;
    if (!targetTaskListId) {
      const taskLists = await googleTasksClient.getTaskLists();
      if (taskLists.length === 0) {
        // Create a default task list
        const newTaskList = await googleTasksClient.createTaskList('Default Tasks');
        targetTaskListId = newTaskList.id!;
      } else {
        targetTaskListId = taskLists[0].id!;
      }
    }

    // Create the task
    const newTask = await googleTasksClient.createTaskInList(targetTaskListId, {
      title,
      notes,
      due,
      completed: false,
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating Google Task:', error);
    return NextResponse.json(
      { error: 'Failed to create Google Task' },
      { status: 500 }
    );
  }
}

// PUT /api/google/tasks - Update a task in Google Tasks
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, taskListId, taskId, title, notes, due, completed } = body;

    if (!userId || !taskListId || !taskId) {
      return NextResponse.json(
        { error: 'User ID, task list ID, and task ID are required' },
        { status: 400 }
      );
    }

    // Get user's Google tokens from database
    const supabase = await createSupabaseServerClient();
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_google_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Google authentication required' },
        { status: 401 }
      );
    }

    // Set up Google Tasks client with user tokens
    const tokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expiry_date: tokenData.expiry_date,
    };

    googleTasksClient.setCredentials(tokens);

    // Check if credentials are valid
    const isValid = await googleTasksClient.isCredentialsValid();
    if (!isValid) {
      return NextResponse.json(
        { error: 'Google authentication expired' },
        { status: 401 }
      );
    }

    // Update the task
    const updatedTask = await googleTasksClient.updateTask(taskListId, taskId, {
      title,
      notes,
      due,
      completed,
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating Google Task:', error);
    return NextResponse.json(
      { error: 'Failed to update Google Task' },
      { status: 500 }
    );
  }
}

// DELETE /api/google/tasks - Delete a task from Google Tasks
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const taskListId = searchParams.get('taskListId');
    const taskId = searchParams.get('taskId');

    if (!userId || !taskListId || !taskId) {
      return NextResponse.json(
        { error: 'User ID, task list ID, and task ID are required' },
        { status: 400 }
      );
    }

    // Get user's Google tokens from database
    const supabase = await createSupabaseServerClient();
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_google_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Google authentication required' },
        { status: 401 }
      );
    }

    // Set up Google Tasks client with user tokens
    const tokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expiry_date: tokenData.expiry_date,
    };

    googleTasksClient.setCredentials(tokens);

    // Check if credentials are valid
    const isValid = await googleTasksClient.isCredentialsValid();
    if (!isValid) {
      return NextResponse.json(
        { error: 'Google authentication expired' },
        { status: 401 }
      );
    }

    // Delete the task
    await googleTasksClient.deleteTask(taskListId, taskId);

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting Google Task:', error);
    return NextResponse.json(
      { error: 'Failed to delete Google Task' },
      { status: 500 }
    );
  }
}