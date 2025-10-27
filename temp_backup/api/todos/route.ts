import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('todo_tasks')
      .select('*')
      .eq('is_urgent', false)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching todos:', error);
      return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in todos API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, due_date, is_urgent = false } = body;

    if (!title || !due_date) {
      return NextResponse.json({ error: 'Title and due date are required' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('todo_tasks')
      .insert({
        title,
        due_date: new Date(due_date).toISOString(),
        is_urgent,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating todo:', error);
      return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in todos API POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}