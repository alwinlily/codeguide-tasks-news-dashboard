import { google, Auth } from 'googleapis';

// OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/google/auth/callback`
);

// Google Tasks API scopes
const SCOPES = [
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/tasks.readonly'
];

export class GoogleTasksClient {
  private auth: Auth.OAuth2Client;

  constructor() {
    this.auth = oauth2Client;
  }

  // Get authorization URL for Google OAuth2
  getAuthUrl(state?: string): string {
    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state: state || '',
      prompt: 'consent',
    });
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string) {
    try {
      const { tokens } = await this.auth.getToken(code);
      this.auth.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  }

  // Set credentials from stored tokens
  setCredentials(tokens: Auth.Credentials) {
    this.auth.setCredentials(tokens);
  }

  // Get current credentials (for storage)
  getCredentials(): Auth.Credentials {
    return this.auth.credentials;
  }

  // Check if credentials are valid and not expired
  async isCredentialsValid(): Promise<boolean> {
    try {
      const tokens = this.auth.credentials;
      if (!tokens || !tokens.access_token) {
        return false;
      }

      // Check if token is expired
      if (tokens.expiry_date && Date.now() >= tokens.expiry_date) {
        // Try to refresh token
        if (tokens.refresh_token) {
          try {
            const { credentials } = await this.auth.refreshAccessToken();
            return true;
          } catch (refreshError) {
            console.error('Failed to refresh access token:', refreshError);
            return false;
          }
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating credentials:', error);
      return false;
    }
  }

  // Create Tasks API client
  private getTasksClient() {
    return google.tasks({ version: 'v1', auth: this.auth });
  }

  // Get all task lists
  async getTaskLists() {
    try {
      const tasks = this.getTasksClient();
      const response = await tasks.tasklists.list();
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching task lists:', error);
      throw error;
    }
  }

  // Get tasks from a specific task list
  async getTasks(taskListId: string, options?: {
    showCompleted?: boolean;
    dueMax?: string;
    dueMin?: string;
  }) {
    try {
      const tasks = this.getTasksClient();
      const response = await tasks.tasks.list({
        tasklist: taskListId,
        showCompleted: options?.showCompleted || false,
        dueMax: options?.dueMax,
        dueMin: options?.dueMin,
      });
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  // Create a new task
  async createTask(taskListId: string, taskData: {
    title: string;
    notes?: string;
    due?: string;
    completed?: boolean;
  }) {
    try {
      const tasks = this.getTasksClient();
      const response = await tasks.tasks.insert({
        tasklist: taskListId,
        requestBody: {
          title: taskData.title,
          notes: taskData.notes,
          due: taskData.due,
          status: taskData.completed ? 'completed' : 'needsAction',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  // Update an existing task
  async updateTask(taskListId: string, taskId: string, taskData: {
    title?: string;
    notes?: string;
    due?: string;
    completed?: boolean;
  }) {
    try {
      const tasks = this.getTasksClient();

      // First get the current task data
      const currentTask = await tasks.tasks.get({
        tasklist: taskListId,
        task: taskId,
      });

      const requestBody = {
        ...currentTask.data,
        ...taskData,
        status: taskData.completed !== undefined
          ? (taskData.completed ? 'completed' : 'needsAction')
          : currentTask.data.status,
      };

      const response = await tasks.tasks.update({
        tasklist: taskListId,
        task: taskId,
        requestBody: requestBody as Schema$Task,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // Delete a task
  async deleteTask(taskListId: string, taskId: string) {
    try {
      const tasks = this.getTasksClient();
      await tasks.tasks.delete({
        tasklist: taskListId,
        task: taskId,
      });
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Create a new task list
  async createTaskList(title: string) {
    try {
      const tasks = this.getTasksClient();
      const response = await tasks.tasklists.insert({
        requestBody: { title },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating task list:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const googleTasksClient = new GoogleTasksClient();

// Helper functions for formatting dates
export function formatDateForGoogleTasks(date: Date): string {
  return date.toISOString().split('T')[0] + 'T00:00:00.000Z';
}

export function parseGoogleTasksDate(dateString?: string): Date | null {
  if (!dateString) return null;
  return new Date(dateString);
}

// Sync functions for integrating with existing todo system
export interface GoogleTask {
  id: string | null | undefined;
  title: string;
  notes?: string;
  due?: string;
  status: 'needsAction' | 'completed';
  updated: string;
}

export interface LocalTask {
  id: string;
  title: string;
  dueDate?: Date;
  isUrgent: boolean;
  completed: boolean;
  userId?: string;
}

export function googleTaskToLocalTask(googleTask: GoogleTask): LocalTask {
  return {
    id: `google_${googleTask.id || 'unknown'}`,
    title: googleTask.title,
    dueDate: parseGoogleTasksDate(googleTask.due) || undefined,
    isUrgent: false, // Google Tasks doesn't have urgency, set default
    completed: googleTask.status === 'completed',
  };
}

export function localTaskToGoogleTask(localTask: LocalTask): Omit<GoogleTask, 'id' | 'updated'> {
  return {
    title: localTask.title,
    notes: `Synced from local task system`,
    due: localTask.dueDate ? formatDateForGoogleTasks(localTask.dueDate) : undefined,
    status: localTask.completed ? 'completed' : 'needsAction',
  };
}