export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  hasApiKey: boolean;
  role: string;
  createdAt: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  price: number;
  area?: number;
  location?: string;
  lat?: number;
  lng?: number;
  imageUrls: string[];
  status: 'available' | 'rented';
  userId: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  isFavorited: boolean;
  isOwner: boolean;
  isFlagged: boolean;
  tags?: string[];
  phone?: string;
}

export interface OffersResponse {
  items: Offer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Comment {
  id: string;
  content: string;
  userName: string;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
  isOwner?: boolean;
}

export interface AirQuality {
  pm2_5: number;
  pm10: number;
  ozone: number;
  nitrogen_dioxide: number;
  sulphur_dioxide: number;
  carbon_monoxide: number;
}

export interface AqiLevel {
  label: string;
  color: string;
  description: string;
}

export interface NegativeElement {
  type: 'power_line' | 'mine' | 'railway' | 'highway';
  label: string;
  distance?: number;
}

export interface LocationScore {
  total: number;
  airQuality: number;
  poi: number;
  nuisance: number;
  transport: number;
}

export interface AddressAnalysis {
  address: string;
  lat: number;
  lng: number;
  airQuality: AirQuality | null;
  negativeElements: NegativeElement[];
  score: LocationScore | null;
}

export type OfferFilterTab = 'wszystkie' | 'dostepne' | 'wynajete';

export interface OfferFilters {
  tab: OfferFilterTab;
  search: string;
  priceMin?: number;
  priceMax?: number;
  sortBy: 'date' | 'patoPoints';
  sort: 'asc' | 'desc';
}
