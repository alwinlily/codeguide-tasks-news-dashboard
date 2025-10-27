-- ========================================
-- SUPABASE DATABASE SETUP SCRIPT
-- ========================================
-- Run this in your Supabase Dashboard > SQL Editor
-- ========================================

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

-- Create policies for todo_tasks (allow all operations for now)
CREATE POLICY "Allow all operations on todo_tasks" ON todo_tasks
    FOR ALL USING (true)
    WITH CHECK (true);

-- Create policies for company_news (allow all operations for now)
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
DROP TRIGGER IF EXISTS update_todo_tasks_updated_at ON todo_tasks;
CREATE TRIGGER update_todo_tasks_updated_at
    BEFORE UPDATE ON todo_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_news_updated_at ON company_news;
CREATE TRIGGER update_company_news_updated_at
    BEFORE UPDATE ON company_news
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing
INSERT INTO todo_tasks (title, due_date, is_urgent) VALUES
    ('Complete project documentation', '2025-11-15', false),
    ('Review pull requests', '2025-11-10', false),
    ('Fix critical bug in production', '2025-10-28', true),
    ('Prepare team meeting presentation', '2025-11-05', true),
    ('Update dependencies', '2025-11-20', false);

INSERT INTO company_news (title, content, published_at) VALUES
    ('New Product Launch Announced', 'We are excited to announce the launch of our new product line coming next month. This represents a major milestone for our company.', '2025-10-25'),
    ('Team Expansion Update', 'Our team is growing! We welcome three new developers who will be joining our engineering department next week.', '2025-10-24'),
    ('Q4 Results Exceed Expectations', 'Fourth quarter results have exceeded analyst expectations with a 25% increase in revenue year-over-year.', '2025-10-23');

-- Verify tables are created and data inserted
SELECT 'Tables created successfully!' as status,
       (SELECT COUNT(*) FROM todo_tasks) as todo_count,
       (SELECT COUNT(*) FROM company_news) as news_count;