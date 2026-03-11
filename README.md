# Prospecção automática de clientes (Google Maps)

Plataforma web privada para encontrar oportunidades de negócio em empresas locais usando a API oficial Google Places.

## Funcionalidades

- Busca por nicho + cidade/região.
- Coleta de dados principais: nome, endereço, telefone, avaliação, nº de avaliações, link Maps, website.
- Score de oportunidade (alta/média/baixa) com critérios configurados.
- Dashboard com filtros e ações rápidas (copiar telefone, abrir no Maps).
- Gerador de mensagem de prospecção com IA (OpenAI) com fallback automático para template.
- Exportação de leads em CSV.

## Configuração

1. Instale dependências:

```bash
npm install
```

2. Crie `.env.local`:

```env
GOOGLE_MAPS_API_KEY=sua_chave
OPENAI_API_KEY=sua_chave_opcional
```

3. Rode local:

```bash
npm run dev
```

## Endpoints internos

- `POST /api/search-leads`
  - body: `{ niche: string, region: string, maxResults?: number }`
- `POST /api/generate-message`
  - body: `{ name: string, reasons: string[] }`

## Critérios de oportunidade

- Menos de 30 avaliações
- Nota abaixo de 4.5
- Poucas fotos (menos de 5)
- Ausência de website
- Perfil incompleto

Cada critério soma pontos para determinar o nível final:
- 🔴 Alta oportunidade
- 🟡 Média oportunidade
- 🟢 Baixa oportunidade
