
// This file is no longer used for the simplified login system and can be considered for deletion.
// However, to avoid breaking anything that might still reference it,
// we will leave it in a non-functional state.
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ error: 'This auth route is deprecated.' }, { status: 404 });
}

export async function GET() {
    return NextResponse.json({ error: 'This auth route is deprecated.' }, { status: 404 });
}
