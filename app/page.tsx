'use client';

import { FormEvent, useMemo, useState } from 'react';
import { opportunityBadge } from '@/lib/scoring';
import { Lead } from '@/types/lead';

export default function HomePage() {
  const [niche, setNiche] = useState('dentista');
  const [region, setRegion] = useState('São Paulo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [maxReviews, setMaxReviews] = useState(30);
  const [maxRating, setMaxRating] = useState(4.5);
  const [withoutWebsite, setWithoutWebsite] = useState(false);
  const [messages, setMessages] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      if (lead.userRatingsTotal > maxReviews) return false;
      if (lead.rating > maxRating) return false;
      if (withoutWebsite && lead.website) return false;
      return true;
    });
  }, [leads, maxReviews, maxRating, withoutWebsite]);

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/search-leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ niche, region, maxResults: 25 })
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || 'Não foi possível buscar empresas.');
      setLeads([]);
      setLoading(false);
      return;
    }

    setLeads(data.leads || []);
    setLoading(false);
  }

  async function generateMessage(lead: Lead) {
    const res = await fetch('/api/generate-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: lead.name, reasons: lead.reasons })
    });
    const data = await res.json();
    setMessages((prev) => ({ ...prev, [lead.placeId]: data.message || '' }));
  }

  function exportCsv() {
    const header = ['nome da empresa', 'telefone', 'avaliação', 'número de avaliações', 'link do perfil'];
    const rows = filtered.map((lead) => [lead.name, lead.phone, lead.rating, lead.userRatingsTotal, lead.mapsUrl]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_google_maps.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="container">
      <h1>Caçador de Leads no Google Maps</h1>

      <form className="searchBar" onSubmit={handleSearch}>
        <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Nicho (ex: advogado)" required />
        <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Cidade ou região" required />
        <button type="submit" disabled={loading}>{loading ? 'Buscando...' : 'Buscar empresas'}</button>
      </form>

      <section className="filters">
        <label>Menos de <input type="number" value={maxReviews} onChange={(e) => setMaxReviews(Number(e.target.value))} /> avaliações</label>
        <label>Nota até <input type="number" step="0.1" value={maxRating} onChange={(e) => setMaxRating(Number(e.target.value))} /></label>
        <label><input type="checkbox" checked={withoutWebsite} onChange={(e) => setWithoutWebsite(e.target.checked)} /> Sem website</label>
        <button onClick={exportCsv} disabled={filtered.length === 0}>Exportar CSV</button>
      </section>

      {error && <p className="error">{error}</p>}

      <div className="grid">
        {filtered.map((lead) => (
          <article key={lead.placeId} className="card">
            <h3>{lead.name}</h3>
            <p>{lead.address}</p>
            <p><strong>Avaliação:</strong> {lead.rating} ({lead.userRatingsTotal})</p>
            <p><strong>Telefone:</strong> {lead.phone}</p>
            <p><strong>Oportunidade:</strong> {opportunityBadge(lead.opportunityLevel)} ({lead.opportunityScore})</p>
            <p><strong>Sinais:</strong> {lead.reasons.join(', ') || 'Sem alertas fortes'}</p>
            <div className="actions">
              <button onClick={() => navigator.clipboard.writeText(lead.phone)}>Copiar telefone</button>
              <a href={lead.mapsUrl} target="_blank">Abrir no Maps</a>
              <button onClick={() => generateMessage(lead)}>Gerar mensagem</button>
            </div>
            {messages[lead.placeId] && <textarea readOnly value={messages[lead.placeId]} />}
          </article>
        ))}
      </div>
    </main>
  );
}
