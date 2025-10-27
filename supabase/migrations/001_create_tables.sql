-- Create tables for the news dashboard application
-- These tables match the current Prisma schema but work with Supabase

-- Create todo_tasks table
CREATE TABLE IF NOT EXISTS todo_tasks (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    title TEXT NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    is_urgent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    user_id TEXT -- Reference to Clerk user ID (will be populated later)
);

-- Create company_news table
CREATE TABLE IF NOT EXISTS company_news (
    id TEXT PRIMARY KEY DEFAULT (gen_random_uuid()),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    user_id TEXT -- Reference to Clerk user ID (will be populated later)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_todo_tasks_due_date ON todo_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_is_urgent ON todo_tasks(is_urgent);
CREATE INDEX IF NOT EXISTS idx_todo_tasks_created_at ON todo_tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_company_news_published_at ON company_news(published_at);
CREATE INDEX IF NOT EXISTS idx_company_news_created_at ON company_news(created_at);

-- Enable Row Level Security (RLS) on both tables
ALTER TABLE todo_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_news ENABLE ROW LEVEL SECURITY;

-- Create policies for todo_tasks
-- For now, allow all operations (we'll restrict these later with authentication)
CREATE POLICY "Allow all operations on todo_tasks" ON todo_tasks
    FOR ALL USING (true)
    WITH CHECK (true);

-- Create policies for company_news
-- For now, allow all operations (we'll restrict these later with authentication)
CREATE POLICY "Allow all operations on company_news" ON company_news
    FOR ALL USING (true)
    WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_todo_tasks_updated_at
    BEFORE UPDATE ON todo_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_news_updated_at
    BEFORE UPDATE ON company_news
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();