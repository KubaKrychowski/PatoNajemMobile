import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../constants/config';

// Axios instance z automatycznym dołączaniem tokenu
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — dołącza Bearer token z SecureStore
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // SecureStore niedostępny — kontynuuj bez tokenu
  }
  return config;
});

// Response interceptor — obsługa wygaśnięcia tokenu (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Usuń token i wymuś ponowne logowanie
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
    }
    return Promise.reject(error);
  },
);

export default api;
