// Zmień na IP swojej maszyny gdy testujesz na fizycznym urządzeniu
// np. 'http://192.168.1.100:3000'
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://patonajem-api-dveta0erh4h2avce.polandcentral-01.azurewebsites.net';
console.log('[CONFIG] API_BASE_URL =', API_BASE_URL);

export const OPEN_METEO_URL = 'https://api.open-meteo.com/v1';
export const AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1';
export const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
export const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
