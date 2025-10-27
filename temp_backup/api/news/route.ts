import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('company_news')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching news:', error);
      return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in news API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, published_at } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from('company_news')
      .insert({
        title,
        content,
        published_at: published_at ? new Date(published_at).toISOString() : new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating news:', error);
      return NextResponse.json({ error: 'Failed to create news' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in news API POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}