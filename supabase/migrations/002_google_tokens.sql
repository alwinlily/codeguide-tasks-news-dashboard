-- Create table to store Google OAuth tokens for users
CREATE TABLE IF NOT EXISTS user_google_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expiry_date BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_google_tokens ENABLE ROW LEVEL SECURITY;

-- Create index on user_id for faster lookups
CREATE INDEX idx_user_google_tokens_user_id ON user_google_tokens(user_id);

-- Create index on updated_at for cleanup purposes
CREATE INDEX idx_user_google_tokens_updated_at ON user_google_tokens(updated_at);

-- RLS Policies
-- Users can only access their own Google tokens
CREATE POLICY "Users can only access own Google tokens" ON user_google_tokens
  FOR ALL USING (auth.jwt() ->> 'sub' = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_google_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_google_tokens_updated_at
  BEFORE UPDATE ON user_google_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_google_tokens_updated_at();