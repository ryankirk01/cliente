import { NextRequest, NextResponse } from 'next/server';

function fallbackMessage(name: string, reasons: string[]) {
  const issue = reasons.length > 0 ? reasons.join(', ').toLowerCase() : 'pontos de melhoria no perfil';
  return `Olá, ${name}! Tudo bem? Analisei seu perfil no Google Maps e notei ${issue}. Trabalho com marketing digital e otimização de perfil empresarial para aumentar visibilidade local e gerar mais contatos qualificados. Posso te enviar um diagnóstico rápido com melhorias práticas?`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = String(body.name || 'sua empresa');
  const reasons = Array.isArray(body.reasons) ? body.reasons.map(String) : [];

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ message: fallbackMessage(name, reasons), provider: 'template' });
  }

  try {
    const prompt = `Gere uma mensagem curta de prospecção comercial em português brasileiro para a empresa ${name}. Contexto: oportunidades identificadas - ${reasons.join(', ') || 'melhoria de presença local no Google Maps'}. Tom: profissional e amigável, sem parecer spam, com CTA para enviar diagnóstico gratuito.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      return NextResponse.json({ message: fallbackMessage(name, reasons), provider: 'template' });
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content?.trim() || fallbackMessage(name, reasons);
    return NextResponse.json({ message, provider: 'openai' });
  } catch {
    return NextResponse.json({ message: fallbackMessage(name, reasons), provider: 'template' });
  }
}
