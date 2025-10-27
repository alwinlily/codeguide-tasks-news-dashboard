# Google Tasks Integration Setup Guide

This guide will walk you through setting up Google Tasks synchronization with your news dashboard application.

## Overview

The Google Tasks integration allows you to:
- Sync your local todo tasks with Google Tasks
- Access your tasks across multiple platforms
- Keep your tasks synchronized bidirectionally
- Manage task completion status across platforms

## Prerequisites

- Google Account
- Google Cloud Console access
- Administrative access to your project's environment variables

## Step 1: Set Up Google Cloud Project

### 1.1 Create or Select a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project or select an existing project
4. Note your **Project ID** for later reference

### 1.2 Enable Google Tasks API
1. In your Google Cloud project, navigate to **APIs & Services** > **Library**
2. Search for "**Google Tasks API**"
3. Click on it and click **Enable**
4. Wait for the API to be enabled (usually takes a few seconds)

### 1.3 Configure OAuth 2.0 Consent Screen
1. Navigate to **APIs & Services** > **OAuth consent screen**
2. Choose **External** (unless you're using a Google Workspace account)
3. Fill in the required information:
   - **App name**: Your Dashboard App
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
4. Click **Save and Continue**
5. Add scopes (you can skip this for now, we'll add specific scopes later)
6. Add test users (add your Google account email)
7. Click **Save and Continue** then **Back to Dashboard**

### 1.4 Create OAuth 2.0 Credentials
1. Navigate to **APIs & Services** > **Credentials**
2. Click **+ Create Credentials** > **OAuth client ID**
3. Select **Web application** as the application type
4. Give it a name: "**Web Client for Dashboard**"
5. Add **Authorized redirect URIs**:
   ```
   http://localhost:3007/api/google/auth/callback
   ```
   (Replace `3007` with your actual port if different)
6. Click **Create**

### 1.5 Save Your Credentials
You will receive a **Client ID** and **Client Secret**. Save these securely - you'll need them in the next step.

## Step 2: Configure Environment Variables

Add the following to your `.env.local` file:

```bash
# Google Tasks API Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

Replace the values with the actual Client ID and Client Secret from Step 1.5.

## Step 3: Set Up Database

The Google Tasks integration requires a database table to store OAuth tokens. The migration has already been created in:

```
supabase/migrations/002_google_tokens.sql
```

If you're using Supabase, this migration should be applied automatically. If you need to apply it manually:

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Run the contents of the `002_google_tokens.sql` file

## Step 4: Test the Integration

### 4.1 Start Your Application
```bash
npm run dev
```

### 4.2 Connect to Google Tasks
1. Open your dashboard in the browser
2. Scroll down to the "Google Tasks Sync" section
3. Click the "**Connect Google Tasks**" button
4. You'll be redirected to Google's OAuth consent screen
5. Sign in with your Google account and grant permissions
6. You'll be redirected back to your application

### 4.3 Sync Your Tasks
1. Once connected, you'll see a "Sync Now" button
2. Click it to synchronize your local todos with Google Tasks
3. The first sync will:
   - Create Google Tasks for existing local todos
   - Create local todos for existing Google Tasks
   - Mark synced items with Google IDs

## Features and Usage

### Sync Behavior
- **Bidirectional Sync**: Changes in either platform are synced to the other
- **Conflict Resolution**: The most recent change takes precedence
- **Task Status**: Completion status is synchronized automatically
- **New Tasks**: Created in both platforms when added to one

### Automatic Task Creation
- Local tasks are created in Google Tasks under a "**Synced Tasks**" list
- Google Tasks are created locally as regular todo items
- Due dates and completion status are preserved
- Urgency status is noted in Google Task descriptions

### Manual Sync
- Use the "**Sync Now**" button to trigger manual synchronization
- Sync results show created, updated, and conflicted items
- Failed syncs are displayed with error messages

## Troubleshooting

### Common Issues

#### 1. "Google authentication required" Error
**Cause**: Missing or expired OAuth tokens
**Solution**:
- Click "Connect Google Tasks" to re-authenticate
- Check that your environment variables are correctly set

#### 2. "Google authentication expired" Error
**Cause**: OAuth tokens have expired
**Solution**:
- The system should automatically refresh tokens
- If that fails, disconnect and reconnect your Google account

#### 3. "Failed to get authorization URL" Error
**Cause**: Missing Google Client ID or Secret
**Solution**:
- Verify your `.env.local` file contains correct Google credentials
- Ensure your Google Cloud project has the Tasks API enabled

#### 4. "Redirect URI mismatch" Error
**Cause**: Incorrect redirect URI in Google Cloud Console
**Solution**:
- Update your OAuth client to include the correct redirect URI
- Format: `http://localhost:3007/api/google/auth/callback`

#### 5. Database Errors
**Cause**: Missing database table or permissions
**Solution**:
- Ensure the `user_google_tokens` table exists
- Check that RLS policies allow user access to their own tokens

### Debug Mode
To enable debug logging, add this to your `.env.local`:
```bash
DEBUG=google-tasks:*
```

### Testing API Endpoints Directly
You can test the Google Tasks API endpoints directly:

#### Check Auth Status
```bash
curl "http://localhost:3007/api/google/tasks?userId=YOUR_USER_ID"
```

#### Trigger Sync
```bash
curl -X POST "http://localhost:3007/api/google/sync" \
  -H "Content-Type: application/json" \
  -d '{"userId": "YOUR_USER_ID"}'
```

## Security Considerations

### 1. Environment Variables
- Never commit `.env.local` to version control
- Use strong, unique Client Secrets
- Rotate credentials periodically

### 2. OAuth Tokens
- Tokens are stored encrypted in the database
- Access tokens have limited lifespan
- Refresh tokens are used to maintain access

### 3. Permissions
- The app requests minimal required scopes
- Users can revoke access at any time from their Google Account settings
- Consider implementing periodic token cleanup

## Rate Limits and Quotas

Google Tasks API has usage limits:
- **Read requests**: 10,000 per day per project
- **Write requests**: 10,000 per day per project
- **Batch requests**: Count as individual requests

If you exceed limits, the API will return `429 Too Many Requests` errors. Implement exponential backoff for production use.

## Next Steps

### Enhanced Features (Future Development)
1. **Real-time Sync**: Implement webhooks for instant synchronization
2. **Selective Sync**: Allow users to choose which task lists to sync
3. **Conflict Resolution UI**: Better interface for handling sync conflicts
4. **Bulk Operations**: Support for batch creating/updating tasks
5. **Task Categories**: Sync task labels and categories

### Production Considerations
1. **Error Handling**: Implement robust error handling and retry logic
2. **Monitoring**: Add logging and monitoring for sync operations
3. **Performance**: Cache frequently accessed data
4. **Backup**: Implement backup strategies for task data

## Support

If you encounter issues with the Google Tasks integration:

1. Check this guide for common solutions
2. Review the browser console for error messages
3. Verify your Google Cloud Console configuration
4. Check that environment variables are correctly set
5. Ensure database migrations have been applied

For additional support, refer to the [Google Tasks API Documentation](https://developers.google.com/tasks/v1/reference).