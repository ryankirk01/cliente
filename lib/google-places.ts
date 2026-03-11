import { calculateOpportunity } from '@/lib/scoring';
import { Lead } from '@/types/lead';

interface PlaceTextResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: Array<{ photo_reference: string }>;
}

interface PlaceDetailsResult {
  formatted_phone_number?: string;
  website?: string;
  url?: string;
  business_status?: string;
}

export async function searchLeads(niche: string, region: string, maxResults = 20): Promise<Lead[]> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error('GOOGLE_MAPS_API_KEY não configurada.');
  }

  const query = encodeURIComponent(`${niche} em ${region}`);
  const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${key}`;
  const textSearchRes = await fetch(textSearchUrl, { cache: 'no-store' });

  if (!textSearchRes.ok) {
    throw new Error('Falha na busca da Google Places API.');
  }

  const textSearchData = await textSearchRes.json();
  const places: PlaceTextResult[] = (textSearchData.results ?? []).slice(0, maxResults);

  const leads = await Promise.all(
    places.map(async (place) => {
      const detailsFields = 'formatted_phone_number,website,url,business_status';
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=${detailsFields}&key=${key}`;
      const detailsRes = await fetch(detailsUrl, { cache: 'no-store' });
      const detailsData = detailsRes.ok ? await detailsRes.json() : { result: {} };
      const details: PlaceDetailsResult = detailsData.result ?? {};

      const photoCount = place.photos?.length ?? 0;
      const profileIncomplete = !details.formatted_phone_number || !place.formatted_address;

      const base = {
        userRatingsTotal: place.user_ratings_total ?? 0,
        rating: place.rating ?? 0,
        photoCount,
        website: details.website ?? '',
        profileIncomplete
      };

      const opp = calculateOpportunity(base);

      const lead: Lead = {
        placeId: place.place_id,
        name: place.name,
        address: place.formatted_address ?? 'Endereço não disponível',
        phone: details.formatted_phone_number ?? 'Telefone não disponível',
        rating: place.rating ?? 0,
        userRatingsTotal: place.user_ratings_total ?? 0,
        mapsUrl: details.url ?? `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
        website: details.website ?? '',
        photoCount,
        profileIncomplete,
        opportunityScore: opp.score,
        opportunityLevel: opp.opportunityLevel,
        reasons: opp.reasons
      };

      return lead;
    })
  );

  return leads;
}
