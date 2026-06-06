import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../constants/config';
import { User } from '../types';

const base = `${API_BASE_URL}/api`;

export const authService = {
  // Logowanie — używa dedykowanego mobilnego endpointu
  async login(email: string, password: string): Promise<{ user: User; access_token: string }> {
    const res = await axios.post(`${base}/mobile-token`, { email, password });
    const { access_token, user } = res.data;
    try {
      await SecureStore.setItemAsync('access_token', access_token);
      await SecureStore.setItemAsync('user', JSON.stringify(user));
    } catch {
      // SecureStore niedostępny na web — fallback do localStorage
      try {
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
      } catch {}
    }
    return { user, access_token };
  },

  // Rejestracja
  async register(email: string, password: string, name: string): Promise<void> {
    await axios.post(`${base}/users/register`, { email, password, name });
  },

  // Pobierz zalogowanego użytkownika
  async getMe(token: string): Promise<User> {
    const res = await axios.get(`${base}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Wylogowanie — czyści SecureStore i localStorage
  async logout(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('user');
    } catch {}
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    } catch {}
  },

  // Odczytaj token z SecureStore (bezpieczne na web)
  async getToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('access_token');
    } catch {
      try { return localStorage.getItem('access_token'); } catch { return null; }
    }
  },

  // Odczytaj zapisanego użytkownika z SecureStore
  async getCachedUser(): Promise<User | null> {
    try {
      const raw = await SecureStore.getItemAsync('user');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      try {
        const raw = localStorage.getItem('user');
        if (!raw) return null;
        return JSON.parse(raw);
      } catch { return null; }
    }
  },
};
