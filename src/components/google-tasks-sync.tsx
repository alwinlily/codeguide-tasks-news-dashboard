"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Loader2, RefreshCw, Link as LinkIcon } from "lucide-react";

interface SyncResult {
  created: Array<{
    localId: string;
    googleId: string;
    title: string;
  }>;
  updated: Array<{
    localId: string;
    googleId: string;
    title: string;
    field: string;
    newValue: any;
  }>;
  conflicts: Array<{
    localId?: string;
    googleId?: string;
    title: string;
    error: string;
  }>;
}

interface GoogleTasksSyncProps {
  userId?: string;
}

export default function GoogleTasksSync({ userId }: GoogleTasksSyncProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Check Google authentication status
  useEffect(() => {
    if (userId) {
      checkAuthStatus();
    }
  }, [userId]);

  // Check URL parameters for auth results
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('google_auth');
    const authError = urlParams.get('google_auth_error');

    if (authSuccess === 'success') {
      setIsConnected(true);
      setError(null);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (authError) {
      setError(`Google authentication failed: ${authError}`);
      setIsConnected(false);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`/api/google/tasks?userId=${userId}`);
      if (response.ok) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsConnected(false);
    }
  };

  const handleConnectGoogle = async () => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch(`/api/google/auth?userId=${userId}`);
      const data = await response.json();

      if (data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      } else {
        setError('Failed to get authorization URL');
      }
    } catch (error) {
      console.error('Error connecting to Google:', error);
      setError('Failed to connect to Google Tasks');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    if (!userId) {
      setError('User ID is required');
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      const response = await fetch('/api/google/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setLastSyncResult(data.results);
        setLastSyncTime(new Date());
        setError(null);
      } else {
        setError(data.error || 'Sync failed');
      }
    } catch (error) {
      console.error('Error syncing with Google Tasks:', error);
      setError('Failed to sync with Google Tasks');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5" />
          Google Tasks Sync
        </CardTitle>
        <CardDescription>
          Sync your todo tasks with Google Tasks for cross-platform access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">Connected to Google Tasks</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-600">Not connected</span>
              </>
            )}
          </div>

          {!isConnected && (
            <Button
              onClick={handleConnectGoogle}
              disabled={isConnecting || !userId}
              size="sm"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Google Tasks'
              )}
            </Button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        {/* Sync Controls */}
        {isConnected && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {lastSyncTime
                    ? `Last sync: ${lastSyncTime.toLocaleString()}`
                    : 'Not synced yet'
                  }
                </p>
              </div>
              <Button
                onClick={handleSync}
                disabled={isSyncing}
                size="sm"
                variant="outline"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </>
                )}
              </Button>
            </div>

            {/* Sync Results */}
            {lastSyncResult && (
              <div className="space-y-2 p-3 bg-gray-50 rounded-md">
                <h4 className="text-sm font-medium">Sync Results:</h4>
                <div className="flex flex-wrap gap-2">
                  {lastSyncResult.created.length > 0 && (
                    <Badge variant="default" className="bg-green-600">
                      +{lastSyncResult.created.length} Created
                    </Badge>
                  )}
                  {lastSyncResult.updated.length > 0 && (
                    <Badge variant="default" className="bg-blue-600">
                      ↑{lastSyncResult.updated.length} Updated
                    </Badge>
                  )}
                  {lastSyncResult.conflicts.length > 0 && (
                    <Badge variant="destructive">
                      !{lastSyncResult.conflicts.length} Conflicts
                    </Badge>
                  )}
                </div>

                {/* Detailed Results */}
                {(lastSyncResult.created.length > 0 ||
                  lastSyncResult.updated.length > 0 ||
                  lastSyncResult.conflicts.length > 0) && (
                  <div className="mt-2 space-y-1">
                    {lastSyncResult.created.slice(0, 3).map((item, index) => (
                      <div key={index} className="text-xs text-green-700">
                        ✓ Created: {item.title}
                      </div>
                    ))}
                    {lastSyncResult.updated.slice(0, 3).map((item, index) => (
                      <div key={index} className="text-xs text-blue-700">
                        ↑ Updated: {item.title} ({item.field})
                      </div>
                    ))}
                    {lastSyncResult.conflicts.slice(0, 3).map((item, index) => (
                      <div key={index} className="text-xs text-red-700">
                        ✗ Conflict: {item.title} - {item.error}
                      </div>
                    ))}
                    {(lastSyncResult.created.length > 3 ||
                      lastSyncResult.updated.length > 3 ||
                      lastSyncResult.conflicts.length > 3) && (
                      <div className="text-xs text-gray-500">
                        ... and more
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Setup Instructions */}
        {!isConnected && (
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Setup required:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Get Google Cloud credentials</li>
              <li>Enable Google Tasks API</li>
              <li>Add Client ID and Secret to .env.local</li>
              <li>Click "Connect Google Tasks" above</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}