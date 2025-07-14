import { promises as fs } from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src/app/dramaafera/zapisy/data.json');


export async function GET() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (e) {
    console.error('Błąd odczytu data.json:', e);
    return NextResponse.json({ users: [], dates: [], responses: {}, error: String(e) }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    // body powinien mieć { users, dates, responses }
    await fs.writeFile(DATA_FILE, JSON.stringify(body, null, 2), 'utf-8');
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Błąd zapisu data.json:', e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
