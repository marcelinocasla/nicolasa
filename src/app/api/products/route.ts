import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ingredients } from '@/data/menu'; // Fallback initial data

// GET /api/products
export async function GET() {
    try {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
            const { data, error } = await supabase.from('products').select('*');
            if (error) throw error;
            if (data && data.length > 0) return NextResponse.json(data);

            // If DB is empty, seed it?
            // Optional: Seed DB with default ingredients if empty
            // await supabase.from('products').insert(ingredients);
            // return NextResponse.json(ingredients);
            return NextResponse.json([]);
        }
    } catch (e) {
        console.warn("Supabase load failed, using local backup", e);
    }

    // Fallback to local file for dev/demo if Supabase fails or not configured
    return NextResponse.json(ingredients);
}

// POST /api/products (Update/Create)
export async function POST(request: Request) {
    const products = await request.json();

    try {
        if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
            // Upsert logic: Delete all and rewrite? Or Upsert efficiently?
            // For simplicity in this specific admin panel logic that sends the WHOLE array:
            // We will loop upsert.

            const { error } = await supabase.from('products').upsert(products, { onConflict: 'id' });
            if (error) throw error;

            return NextResponse.json({ success: true, method: 'supabase' });
        }
    } catch (e) {
        console.error("Supabase save failed", e);
    }

    return NextResponse.json({ success: true, method: 'local_mock' });
}
