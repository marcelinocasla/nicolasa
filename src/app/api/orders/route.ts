import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase.from('orders').select('*').order('date', { ascending: false });
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const order = await request.json();
  try {
    const { error } = await supabase.from('orders').insert(order);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { date } = await request.json(); // we use date (ISO string) as ID in this legacy frontend logic, but simpler to use ID if available. 
  // Ideally change frontend to pass ID. For now let's try to match date if that's what we have.

  try {
    const { error } = await supabase.from('orders').delete().eq('date', date);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
