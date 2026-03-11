import { Lead, OpportunityLevel } from '@/types/lead';

export function classifyOpportunity(score: number): OpportunityLevel {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export function calculateOpportunity(input: Pick<Lead, 'userRatingsTotal' | 'rating' | 'photoCount' | 'website' | 'profileIncomplete'>) {
  let score = 0;
  const reasons: string[] = [];

  if (input.userRatingsTotal < 30) {
    score += 30;
    reasons.push('Menos de 30 avaliações');
  }

  if (input.rating > 0 && input.rating < 4.5) {
    score += 25;
    reasons.push('Nota abaixo de 4.5');
  }

  if (input.photoCount < 5) {
    score += 20;
    reasons.push('Poucas fotos no perfil');
  }

  if (!input.website) {
    score += 15;
    reasons.push('Sem website');
  }

  if (input.profileIncomplete) {
    score += 10;
    reasons.push('Perfil incompleto');
  }

  const opportunityLevel = classifyOpportunity(score);
  return { score, opportunityLevel, reasons };
}

export function opportunityBadge(level: OpportunityLevel) {
  if (level === 'high') return '🔴 Alta';
  if (level === 'medium') return '🟡 Média';
  return '🟢 Baixa';
}
