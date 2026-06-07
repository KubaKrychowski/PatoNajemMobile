import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Offer, OffersResponse, Comment, OfferFilters } from '../types';

const CACHE_KEY = 'cached_offers';
const CACHE_TTL = 5 * 60 * 1000;

export const offersService = {
  async getOffers(filters: Partial<OfferFilters>, page = 1): Promise<OffersResponse> {
    const params: Record<string, any> = {
      page,
      limit: 20,
      filter: filters.tab ?? 'wszystkie',
      sort: filters.sort ?? 'desc',
      sortBy: filters.sortBy ?? 'date',
    };
    if (filters.search) params.search = filters.search;
    if (filters.priceMin) params.priceMin = filters.priceMin;
    if (filters.priceMax) params.priceMax = filters.priceMax;

    const res = await api.get<OffersResponse>('/offers', { params });

    if (page === 1) {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
        data: res.data,
        timestamp: Date.now(),
      }));
    }

    return res.data;
  },

  async getCachedOffers(): Promise<OffersResponse | null> {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const { data, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp > CACHE_TTL) return null;
      return data;
    } catch {
      return null;
    }
  },

  async getOffer(id: string): Promise<Offer> {
    const res = await api.get<Offer>(`/offers/${id}`);
    return res.data;
  },

  async getComments(offerId: string): Promise<Comment[]> {
    const res = await api.get<Comment[]>(`/offers/${offerId}/comments`);
    return res.data;
  },

  async addComment(offerId: string, content: string, userName: string): Promise<Comment> {
    const res = await api.post<Comment>(`/offers/${offerId}/comments`, { content, userName });
    return res.data;
  },

  async vote(offerId: string, type: 'up' | 'down'): Promise<void> {
    await api.post(`/offers/${offerId}/vote`, { type });
  },

  async createOffer(data: {
    title: string;
    location: string;
    area: number;
    price: number;
    description: string;
    landlordPhone?: string;
    difficulty?: string;
  }): Promise<Offer> {
    const res = await api.post<Offer>('/offers', data);
    return res.data;
  },

  async uploadOfferImage(offerId: string, uri: string): Promise<{ imageUrls: string[] }> {
    const fileName = uri.split('/').pop() ?? 'photo.jpg';
    const mimeType = fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    const formData = new FormData();
    formData.append('file', { uri, name: fileName, type: mimeType } as any);
    const res = await api.post<{ imageUrls: string[] }>(
      `/offers/${offerId}/images`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data;
  },

  async toggleFavorite(offerId: string, isFavorited: boolean): Promise<void> {
    if (isFavorited) {
      await api.delete(`/offers/${offerId}/favorite`);
    } else {
      await api.post(`/offers/${offerId}/favorite`);
    }
  },
};
