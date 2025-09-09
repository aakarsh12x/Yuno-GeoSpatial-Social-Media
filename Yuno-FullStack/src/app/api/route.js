import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Yuno FullStack API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
}

