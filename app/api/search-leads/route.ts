import { searchLeads } from '@/lib/google-places';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { niche, region, maxResults } = await request.json();

    if (!niche || !region) {
      return NextResponse.json({ error: 'Nicho e região são obrigatórios.' }, { status: 400 });
    }

    const leads = await searchLeads(String(niche), String(region), Number(maxResults) || 20);
    return NextResponse.json({ leads });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro inesperado.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
