import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ingredients, Ingredient } from '@/data/menu';

const DB_PATH = path.join(process.cwd(), 'data', 'products.json');

// Ensure data dir exists
const ensureDataDir = () => {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const readProducts = (): Ingredient[] => {
    ensureDataDir();
    if (!fs.existsSync(DB_PATH)) {
        // Seed with initial data
        fs.writeFileSync(DB_PATH, JSON.stringify(ingredients, null, 2));
        return ingredients;
    }
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading products DB", err);
        return [];
    }
};

const saveProducts = (products: Ingredient[]) => {
    ensureDataDir();
    fs.writeFileSync(DB_PATH, JSON.stringify(products, null, 2));
};

export async function GET() {
    const products = readProducts();
    return NextResponse.json(products);
}

export async function POST(req: Request) {
    try {
        const products = await req.json();
        saveProducts(products);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to update products' }, { status: 500 });
    }
}
