import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'orders.json');

const ensureDataDir = () => {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const readOrders = () => {
  ensureDataDir();
  if (!fs.existsSync(DB_PATH)) {
    return [];
  }
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const saveOrders = (orders: any[]) => {
  ensureDataDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(orders, null, 2));
};

export async function GET() {
  const orders = readOrders();
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  try {
    const newOrder = await req.json();
    const orders = readOrders();
    orders.push(newOrder); // Add to end, or beginning? Usually append.
    saveOrders(orders);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
    try {
        const { date, ...updates } = await req.json(); // date is used as ID for now
        let orders = readOrders();
        let found = false;
        orders = orders.map((o: any) => {
            if (o.date === date) {
                found = true;
                return { ...o, ...updates };
            }
            return o;
        });

        if (!found) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        
        saveOrders(orders);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { date } = await req.json(); 
        let orders = readOrders();
        const initialLength = orders.length;
        orders = orders.filter((o: any) => o.date !== date);
        
        if (orders.length === initialLength) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

        saveOrders(orders);
        return NextResponse.json({ success: true });
    } catch (err) {
         return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }
}
