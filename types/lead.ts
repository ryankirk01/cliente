export type OpportunityLevel = 'high' | 'medium' | 'low';

export interface Lead {
  placeId: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  userRatingsTotal: number;
  mapsUrl: string;
  website: string;
  photoCount: number;
  profileIncomplete: boolean;
  opportunityScore: number;
  opportunityLevel: OpportunityLevel;
  reasons: string[];
}
