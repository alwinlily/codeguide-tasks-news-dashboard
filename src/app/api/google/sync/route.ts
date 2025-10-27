import { NextRequest, NextResponse } from 'next/server';
import { googleTasksClient, googleTaskToLocalTask, localTaskToGoogleTask } from '@/lib/google-tasks';
import { createSupabaseServerClient } from '@/lib/supabase';

// POST /api/google/sync - Sync local todos with Google Tasks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Get user's Google tokens
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

    // Set up Google Tasks client
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

    // Get local todos from Supabase
    const { data: localTodos, error: localError } = await supabase
      .from('todo_tasks')
      .select('*')
      .eq('user_id', userId);

    if (localError) {
      console.error('Error fetching local todos:', localError);
      return NextResponse.json(
        { error: 'Failed to fetch local todos' },
        { status: 500 }
      );
    }

    // Get Google Tasks
    const taskLists = await googleTasksClient.getTaskLists();
    const googleTasks = [];

    for (const taskList of taskLists) {
      const tasks = await googleTasksClient.getTasks(taskList.id!, {
        showCompleted: true,
      });

      googleTasks.push(...tasks.map(task => ({
        ...task,
        taskListId: taskList.id,
        taskListTitle: taskList.title,
      })));
    }

    // Sync logic
    const syncResults = {
      created: [],
      updated: [],
      conflicts: [],
    };

    // Get or create sync task list
    let syncTaskList = taskLists.find(list => list.title === 'Synced Tasks');
    if (!syncTaskList) {
      syncTaskList = await googleTasksClient.createTaskList('Synced Tasks');
    }

    // Sync local todos to Google Tasks
    for (const localTodo of localTodos || []) {
      const isGoogleSynced = localTodo.id.startsWith('google_');

      if (!isGoogleSynced) {
        // This is a local-only task, create it in Google
        try {
          const googleTask = await googleTasksClient.createTask(syncTaskList.id!, {
            title: localTodo.title,
            notes: `Urgent: ${localTodo.is_urgent ? 'Yes' : 'No'}`,
            due: localTodo.due_date ? new Date(localTodo.due_date).toISOString() : undefined,
            completed: false, // We'll mark completed when synced
          });

          // Update local todo with Google ID
          await supabase
            .from('todo_tasks')
            .update({
              id: `google_${googleTask.id}`,
              updated_at: new Date().toISOString(),
            })
            .eq('id', localTodo.id);

          syncResults.created.push({
            localId: localTodo.id,
            googleId: googleTask.id,
            title: localTodo.title,
          });
        } catch (error) {
          console.error('Error creating Google Task:', error);
          syncResults.conflicts.push({
            localId: localTodo.id,
            title: localTodo.title,
            error: 'Failed to create in Google Tasks',
          });
        }
      }
    }

    // Sync Google Tasks to local todos
    for (const googleTask of googleTasks) {
      const localGoogleId = `google_${googleTask.id}`;
      const localTodo = localTodos?.find(todo => todo.id === localGoogleId);

      if (!localTodo) {
        // This is a Google-only task, create it locally
        try {
          const transformedTask = googleTaskToLocalTask(googleTask);

          await supabase
            .from('todo_tasks')
            .insert({
              id: localGoogleId,
              title: transformedTask.title,
              due_date: transformedTask.dueDate?.toISOString(),
              is_urgent: false, // Default for Google Tasks
              user_id: userId,
              created_at: new Date(googleTask.created || new Date()).toISOString(),
              updated_at: new Date(googleTask.updated || new Date()).toISOString(),
            });

          syncResults.created.push({
            localId: localGoogleId,
            googleId: googleTask.id!,
            title: googleTask.title!,
          });
        } catch (error) {
          console.error('Error creating local todo:', error);
          syncResults.conflicts.push({
            googleId: googleTask.id!,
            title: googleTask.title,
            error: 'Failed to create locally',
          });
        }
      } else {
        // Check if update is needed
        const googleCompleted = googleTask.status === 'completed';
        const localCompleted = localTodo.completed || false;

        if (googleCompleted !== localCompleted) {
          try {
            // Update local todo to match Google
            await supabase
              .from('todo_tasks')
              .update({
                completed: googleCompleted,
                updated_at: new Date().toISOString(),
              })
              .eq('id', localGoogleId);

            syncResults.updated.push({
              localId: localGoogleId,
              googleId: googleTask.id!,
              title: googleTask.title!,
              field: 'completed',
              newValue: googleCompleted,
            });
          } catch (error) {
            console.error('Error updating local todo:', error);
            syncResults.conflicts.push({
              localId: localGoogleId,
              googleId: googleTask.id!,
              title: googleTask.title,
              error: 'Failed to update local completion status',
            });
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Sync completed successfully',
      results: syncResults,
      stats: {
        localTodos: localTodos?.length || 0,
        googleTasks: googleTasks.length,
        created: syncResults.created.length,
        updated: syncResults.updated.length,
        conflicts: syncResults.conflicts.length,
      },
    });
  } catch (error) {
    console.error('Error during sync:', error);
    return NextResponse.json(
      { error: 'Failed to sync tasks' },
      { status: 500 }
    );
  }
}